"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CatalogProvider } from "@/lib/catalog-context";
import { mergeSeed } from "@/lib/catalog";
import { loadCatalog, loadOrders, saveCatalog, saveOrders } from "@/lib/demo-store";
import type { Catalog, Order } from "@/lib/types";
import Flower from "../Flower";
import Icon, { type IconName } from "../Icon";
import { AdminCtx, type Admin, type View } from "./ui";
import { demoOrders } from "./demo-orders";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import Products from "./Products";
import ProductEditor from "./ProductEditor";
import Videos from "./Videos";
import ReelEditor from "./ReelEditor";
import SettingsView from "./SettingsView";

// DEMO kirish: haqiqiy himoya emas — faqat ko'rsatish uchun. Haqiqiy versiyada server sessiyasi bo'ladi.
const DEMO_PASSWORD = "admin";
const AUTH_KEY = "nazokat:admin:auth";

const NAV: { v: View; label: string; icon: IconName }[] = [
  { v: "dash", label: "Panel", icon: "grid" },
  { v: "orders", label: "Buyurtmalar", icon: "receipt" },
  { v: "products", label: "Tovarlar", icon: "box" },
  { v: "videos", label: "Videolar", icon: "reels" },
  { v: "settings", label: "Sozlamalar", icon: "gear" },
];

const TITLES: Record<View, string> = {
  dash: "Bosh panel",
  orders: "Buyurtmalar",
  products: "Tovarlar",
  videos: "Videolar va Reels",
  settings: "Sozlamalar",
};

export default function AdminApp({ seed }: { seed: Catalog }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      setAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
    } catch {
      setAuthed(false);
    }
  }, []);

  if (authed === null) return <div className="a-boot" />;
  if (!authed)
    return (
      <Login
        onOk={() => {
          try {
            sessionStorage.setItem(AUTH_KEY, "1");
          } catch {}
          setAuthed(true);
        }}
      />
    );
  return (
    <Panel
      seed={seed}
      onLogout={() => {
        try {
          sessionStorage.removeItem(AUTH_KEY);
        } catch {}
        setAuthed(false);
      }}
    />
  );
}

function Login({ onOk }: { onOk: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <div className="a-login">
      <form
        className="a-login__card"
        onSubmit={(e) => {
          e.preventDefault();
          if (pw.trim() === DEMO_PASSWORD) onOk();
          else setErr(true);
        }}
      >
        <span className="a-login__logo">
          <Flower />
        </span>
        <h1>Admin panel</h1>
        <p>Nazokat Lady Shop boshqaruvi</p>
        <label className={`a-field ${err ? "is-err" : ""}`}>
          <span className="a-field__label">Parol</span>
          <span className="a-pass">
            <input
              type={show ? "text" : "password"}
              value={pw}
              autoFocus
              autoComplete="current-password"
              onChange={(e) => {
                setPw(e.target.value);
                setErr(false);
              }}
              placeholder="••••••"
            />
            <button type="button" className="a-icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? "Yashirish" : "Ko'rsatish"}>
              <Icon name={show ? "eyeOff" : "eye"} />
            </button>
          </span>
          {err && <small className="a-field__err">Parol noto&apos;g&apos;ri</small>}
        </label>
        <button className="btn btn--primary btn--lg" type="submit">
          Kirish
        </button>
        <div className="a-demo-note">
          <Icon name="sparkle" /> Demo rejim · parol: <code>{DEMO_PASSWORD}</code>
        </div>
        <a className="a-login__back" href="/">
          <Icon name="left" /> Saytga qaytish
        </a>
      </form>
    </div>
  );
}

function Panel({ seed, onLogout }: { seed: Catalog; onLogout: () => void }) {
  const [catalog, setCatalog] = useState<Catalog>(seed);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [view, setView] = useState<View>("dash");
  const [editing, setEditing] = useState<{ kind: "product" | "reel"; id: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err"; id: number } | null>(null);
  const [ask, setAsk] = useState<{ text: string; yes: () => void; danger: string } | null>(null);
  const toastTimer = useRef(0);

  useEffect(() => {
    setCatalog(mergeSeed(loadCatalog(), seed));
    // Shu qurilmadagi haqiqiy buyurtmalar + (birinchi marta) namunaviy demo buyurtmalar
    const stored = loadOrders();
    const list = stored.some((o) => o.demo) ? stored : [...stored, ...demoOrders(seed)];
    setOrdersState(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, [seed]);

  const showToast = useCallback((msg: string, kind: "ok" | "err" = "ok") => {
    window.clearTimeout(toastTimer.current);
    setToast({ msg, kind, id: Date.now() });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const admin = useMemo<Admin>(
    () => ({
      catalog,
      save: (next, msg = "Saqlandi") => {
        const c = { ...next, version: next.version + 1 };
        try {
          saveCatalog(c);
        } catch {
          showToast("Demo xotirasi to'ldi — ba'zi rasmlarni o'chiring", "err");
          return false;
        }
        setCatalog(c);
        showToast(msg);
        return true;
      },
      orders,
      setOrders: (list) => {
        setOrdersState(list);
        saveOrders(list);
      },
      toast: showToast,
      confirm: (text, yes, danger = "O'chirish") => setAsk({ text, yes, danger }),
      go: (v) => {
        setView(v);
        window.scrollTo({ top: 0 });
      },
      editProduct: (id) => setEditing({ kind: "product", id }),
      editReel: (id) => setEditing({ kind: "reel", id }),
    }),
    [catalog, orders, showToast]
  );

  const newOrders = orders.filter((o) => o.status === "new").length;
  const closeEditor = useCallback(() => setEditing(null), []);

  return (
    <AdminCtx.Provider value={admin}>
      <CatalogProvider catalog={catalog}>
        <div className="a-app">
          <aside className="a-side">
            <a className="a-brand" href="/">
              <span className="a-brand__mark">
                <Flower />
              </span>
              <span>
                <b>Nazokat</b>
                <small>Admin panel</small>
              </span>
            </a>
            <nav className="a-nav" aria-label="Admin menyu">
              {NAV.map((n) => (
                <button key={n.v} className={`a-nav__item ${view === n.v ? "is-on" : ""}`} onClick={() => admin.go(n.v)}>
                  <Icon name={n.icon} />
                  <span>{n.label}</span>
                  {n.v === "orders" && newOrders > 0 && <i className="a-count">{newOrders}</i>}
                </button>
              ))}
            </nav>
            <div className="a-side__foot">
              <a className="a-side__link" href="/" target="_blank" rel="noopener">
                <Icon name="external" /> Saytni ochish
              </a>
              <button className="a-side__link" onClick={onLogout}>
                <Icon name="logout" /> Chiqish
              </button>
            </div>
          </aside>

          <div className="a-main">
            <header className="a-top">
              <div>
                <h1>{TITLES[view]}</h1>
                <span className="a-badge-demo">
                  <Icon name="sparkle" /> Demo rejim
                </span>
              </div>
              <div className="a-top__actions">
                <a className="a-icon-btn" href="/" target="_blank" rel="noopener" aria-label="Saytni ochish">
                  <Icon name="external" />
                </a>
                <button className="a-icon-btn a-only-mobile" onClick={onLogout} aria-label="Chiqish">
                  <Icon name="logout" />
                </button>
              </div>
            </header>

            <main className="a-content" key={view}>
              {view === "dash" && <Dashboard />}
              {view === "orders" && <Orders />}
              {view === "products" && <Products />}
              {view === "videos" && <Videos />}
              {view === "settings" && <SettingsView />}
            </main>
          </div>

          <nav className="a-tabbar" aria-label="Admin menyu">
            {NAV.map((n) => (
              <button key={n.v} className={`a-tab ${view === n.v ? "is-on" : ""}`} onClick={() => admin.go(n.v)}>
                <span className="a-tab__icon">
                  <Icon name={n.icon} />
                  {n.v === "orders" && newOrders > 0 && <i className="badge">{newOrders}</i>}
                </span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {editing?.kind === "product" && <ProductEditor id={editing.id} onClose={closeEditor} />}
        {editing?.kind === "reel" && <ReelEditor id={editing.id} onClose={closeEditor} />}

        {ask && (
          <div className="a-confirm" role="alertdialog" aria-modal="true">
            <div className="a-confirm__bg" onClick={() => setAsk(null)} />
            <div className="a-confirm__card">
              <p>{ask.text}</p>
              <div>
                <button className="btn btn--ghost" onClick={() => setAsk(null)}>
                  Bekor qilish
                </button>
                <button
                  className="btn a-btn-danger"
                  onClick={() => {
                    ask.yes();
                    setAsk(null);
                  }}
                >
                  {ask.danger}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`toast a-toast ${toast ? "is-on" : ""} ${toast?.kind === "err" ? "is-err" : ""}`} role="status" aria-live="polite">
          {toast && (
            <>
              <Icon name={toast.kind === "err" ? "close" : "check"} className="toast__ico" />
              <span>{toast.msg}</span>
            </>
          )}
        </div>
      </CatalogProvider>
    </AdminCtx.Provider>
  );
}
