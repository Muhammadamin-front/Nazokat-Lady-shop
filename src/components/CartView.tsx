"use client";

import { useRef, useState, type FormEvent } from "react";
import type { OrderResponse } from "@/lib/order";
import { byId, igDm, money, photosOf, priceOf } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { addOrder } from "@/lib/demo-store";
import type { Catalog, Order } from "@/lib/types";
import { cartCount, lineKey, useStore, type Line, type Profile } from "@/lib/store";
import { useUI } from "@/lib/ui";
import Img from "./Img";
import Icon from "./Icon";

// Savat qatorlari katalogdagi narx va nomlar bilan
function priced(c: Catalog, cart: Line[]) {
  return cart.flatMap((l) => {
    const p = byId(c, l.id);
    return p ? [{ l, p, price: priceOf(c, p), color: p.colors[l.color]?.name ?? "" }] : [];
  });
}

function orderText(c: Catalog, cart: Line[], f: Profile) {
  const SHOP = c.settings;
  const rows = priced(c, cart);
  const lines = rows.map(({ l, p, price, color }, i) => {
    const opts = [color, l.size].filter(Boolean).join(", ");
    return `${i + 1}. ${p.name} (${opts}) × ${l.qty} = ${money(price * l.qty)}`;
  });
  return [
    `🛍 Yangi buyurtma — ${SHOP.name}`,
    "",
    ...lines,
    "",
    `Jami: ${money(rows.reduce((s, r) => s + r.price * r.l.qty, 0))}`,
    "",
    `👤 ${f.name}`,
    `📞 +998 ${f.phone}`,
    `📍 ${SHOP.city}, ${f.address}`,
    ...(f.note ? [`📝 ${f.note}`] : []),
  ].join("\n");
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    ta.remove();
    return ok;
  }
}

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
};

// Buyurtmani serverga (/api/order) yuboradi — server do'kon egasiga Telegram orqali xabar beradi.
// Sekin internet uchun 20 soniya kutadi; javob bo'lmasa savat saqlanib qoladi va qayta urinish mumkin.
async function sendOrder(c: Catalog, cart: Line[], customer: Profile, website: string): Promise<OrderResponse> {
  try {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // name/colorName — admin demo'da qo'shilgan (serverda hali yo'q) mahsulotlar uchun
        items: priced(c, cart).map(({ l, p, color }) => ({ id: l.id, color: l.color, size: l.size, qty: l.qty, name: p.name, colorName: color })),
        customer: { ...customer, phone: customer.phone.replace(/\D/g, "") },
        website,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    return (await res.json()) as OrderResponse;
  } catch {
    return { ok: false, error: "network" };
  }
}

const ERRORS: Record<string, string> = {
  network: "Internet aloqasi sekin yoki uzildi. Buyurtma yuborilmadi — qayta urinib ko'ring.",
  too_many: "Juda ko'p urinish bo'ldi. Bir necha daqiqadan so'ng qayta urinib ko'ring yoki Instagramda yozing.",
  bad_customer: "Ma'lumotlarni tekshiring: ism, telefon va manzil to'g'ri yozilganmi?",
  bad_items: "Savatdagi mahsulotlardan biri o'zgargan. Savatni yangilab, qayta urinib ko'ring.",
};

type Done = { orderId: string; count: number; total: number; via: "telegram" | "instagram" };

export default function CartView() {
  const { state, dispatch } = useStore();
  const { go, toast } = useUI();
  const catalog = useCatalog();
  const SHOP = catalog.settings;
  const rows = priced(catalog, state.cart);
  const total = rows.reduce((s, r) => s + r.price * r.l.qty, 0);
  const [form, setForm] = useState<Profile | null>(null);
  const [err, setErr] = useState("");
  const [sendErr, setSendErr] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const f = form ?? state.profile;
  const count = rows.reduce((n, r) => n + r.l.qty, 0);

  // Savatga yangi mahsulot qo'shilsa, "qabul qilindi" ekrani o'rniga yangi savat ko'rinadi
  if (done && !state.cart.length) {
    return (
      <div className="empty done">
        <Icon name="checkCircle" className="ico--xl ico--ok" />
        <h2>Buyurtma qabul qilindi!</h2>
        {done.via === "telegram" ? (
          <>
            <span className="order-id">#{done.orderId}</span>
            <p>
              {done.count} ta mahsulot, jami <b>{money(done.total)}</b>. Tez orada siz bilan telefon orqali bog&apos;lanamiz.
            </p>
          </>
        ) : (
          <p>
            Buyurtmangiz matni nusxalandi. Instagram ochilgan bo&apos;lsa — xabarga <b>qo&apos;yib (Paste)</b> yuboring. Tez orada siz bilan
            bog&apos;lanamiz.
          </p>
        )}
        <button className="btn btn--primary" onClick={() => go("home")}>
          Xaridni davom ettirish
        </button>
        <a className="btn btn--ghost" href={igDm(SHOP)} target="_blank" rel="noopener">
          <Icon name="insta" /> Instagramda yozish
        </a>
      </div>
    );
  }

  if (!state.cart.length) {
    return (
      <div className="empty">
        <Icon name="bag" className="ico--xl" />
        <h2>Savatingiz bo&apos;sh</h2>
        <p>Yoqqan mahsulotni tanlang — hammasi {money(SHOP.price)}.</p>
        <button className="btn btn--primary" onClick={() => go("home")}>
          Xarid qilishni boshlash
        </button>
      </div>
    );
  }

  const set = (k: keyof Profile, v: string) => setForm({ ...f, [k]: k === "phone" ? formatPhone(v) : v });

  const validate = () => {
    const clean = { ...f, name: f.name.trim(), address: f.address.trim(), note: f.note.trim() };
    if (clean.name.length < 2) return setErr("Iltimos, ismingizni kiriting."), null;
    if (clean.phone.replace(/\D/g, "").length !== 9) return setErr("Telefon raqam 9 ta raqamdan iborat bo'lishi kerak, masalan 90 123 45 67."), null;
    if (clean.address.length < 3) return setErr("Iltimos, manzilingizni kiriting."), null;
    setErr("");
    dispatch({ type: "profile", profile: clean });
    return clean;
  };

  // Demo: buyurtma shu qurilmadagi admin panelda ham ko'rinadi
  const record = (orderId: string, clean: Profile): Order => ({
    id: orderId || "IG" + Date.now().toString(36).toUpperCase().slice(-5),
    createdAt: new Date().toISOString(),
    status: "new",
    customer: { ...clean, phone: clean.phone.replace(/\D/g, "") },
    items: rows.map(({ l, p, price, color }) => ({ id: p.id, name: p.name, color, size: l.size, qty: l.qty, price })),
    total,
    count,
    telegram: orderId ? "sent" : "off",
  });

  const finish = (d: Done) => {
    dispatch({ type: "clear" });
    setDone(d);
    setSendErr("");
    window.scrollTo({ top: 0 });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const clean = validate();
    if (!clean) return;
    setSending(true);
    setSendErr("");
    const res = await sendOrder(catalog, state.cart, clean, honeypot.current?.value ?? "");
    setSending(false);
    if (res.ok) {
      addOrder(record(res.orderId, clean));
      return finish({ orderId: res.orderId, count, total, via: "telegram" });
    }
    setSendErr(ERRORS[res.error] ?? "Buyurtmani yuborib bo'lmadi. Qayta urinib ko'ring yoki Instagram orqali yuboring.");
  };

  // Zaxira yo'l: server ishlamasa — buyurtma matnini nusxalab Instagram (yoki Telegram) ni ochadi
  const sendViaInstagram = async () => {
    const clean = validate();
    if (!clean) return;
    const text = orderText(catalog, state.cart, clean);
    const copied = await copy(text);
    const url = SHOP.telegram ? `https://t.me/${SHOP.telegram}?text=${encodeURIComponent(text)}` : igDm(SHOP);
    window.open(url, "_blank", "noopener");
    addOrder(record("", clean));
    finish({ orderId: "", count, total, via: "instagram" });
    if (!copied) toast("Nusxalab bo'lmadi — Instagramda o'zingiz yozing");
  };

  return (
    <div className="cart">
      <div className="section__head">
        <h2>Savat</h2>
        <button className="link" onClick={() => dispatch({ type: "clear" })}>
          Tozalash
        </button>
      </div>

      <ul className="lines">
        {state.cart.map((l) => {
          const p = byId(catalog, l.id);
          if (!p) return null;
          const k = lineKey(l);
          return (
            <li className="line" key={k}>
              <Img k={photosOf(p, l.color)[0]} alt="" className="line__img" />
              <div className="line__info">
                <h3>{p.name}</h3>
                <small>{[p.colors[l.color]?.name, l.size].filter(Boolean).join(" · ")}</small>
                <span className="price">{money(priceOf(catalog, p) * l.qty)}</span>
              </div>
              <div className="line__side">
                <button className="line__del" onClick={() => dispatch({ type: "remove", key: k })} aria-label="O'chirish">
                  <Icon name="trash" />
                </button>
                <div className="stepper stepper--sm">
                  <button onClick={() => dispatch({ type: "qty", key: k, delta: -1 })} aria-label="Kamaytirish">
                    <Icon name="minus" />
                  </button>
                  <b>{l.qty}</b>
                  <button onClick={() => dispatch({ type: "qty", key: k, delta: 1 })} aria-label="Ko'paytirish">
                    <Icon name="plus" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <form className="form" onSubmit={submit} noValidate>
        <h2>Buyurtma ma&apos;lumotlari</h2>
        <label>
          Ismingiz
          <input value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" placeholder="Masalan: Nazokat" />
        </label>
        <label>
          Telefon raqam
          <span className="phone">
            <span>+998</span>
            <input value={f.phone} onChange={(e) => set("phone", e.target.value)} inputMode="numeric" autoComplete="tel-national" placeholder="90 123 45 67" />
          </span>
        </label>
        <label>
          Manzil ({SHOP.city})
          <input value={f.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" placeholder="Mahalla, ko'cha, uy" />
        </label>
        <label>
          Izoh (ixtiyoriy)
          <textarea value={f.note} onChange={(e) => set("note", e.target.value)} rows={2} placeholder="Qo'shimcha xohish…" />
        </label>
        <input ref={honeypot} name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        {err && <p className="err">{err}</p>}
        <div className="summary">
          <div>
            <span>Mahsulotlar ({count} ta)</span>
            <b>{money(total)}</b>
          </div>
          <div>
            <span>Yetkazish</span>
            <b>{SHOP.city} bo&apos;ylab</b>
          </div>
          <div className="summary__total">
            <span>Jami</span>
            <b>{money(total)}</b>
          </div>
        </div>
        {sendErr && (
          <div className="send-err" role="alert">
            <p>{sendErr}</p>
            <button type="button" className="btn btn--ghost" onClick={sendViaInstagram}>
              <Icon name="insta" /> Instagram orqali yuborish
            </button>
          </div>
        )}
        <button className={`btn btn--primary btn--lg ${sending ? "is-loading" : ""}`} type="submit" disabled={sending} aria-busy={sending}>
          {sending ? (
            <>
              <span className="spinner" aria-hidden="true" /> Yuborilmoqda…
            </>
          ) : sendErr ? (
            "Qayta urinish"
          ) : (
            "Buyurtma berish"
          )}
        </button>
        <p className="hint">Buyurtma to&apos;g&apos;ridan-to&apos;g&apos;ri do&apos;kon egasiga yuboriladi. Biz sizga qo&apos;ng&apos;iroq qilib tasdiqlaymiz.</p>
      </form>
    </div>
  );
}
