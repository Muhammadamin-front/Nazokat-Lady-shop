"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StoreProvider } from "@/lib/store";
import { UIContext, type Tab, type ToastAction, type UI } from "@/lib/ui";
import { CatalogProvider } from "@/lib/catalog-context";
import { buildStories, byId, mergeSeed, publicCatalog } from "@/lib/catalog";
import { DEMO_EVENT, loadCatalog } from "@/lib/demo-store";
import type { Catalog } from "@/lib/types";
import Header from "./Header";
import TabBar from "./TabBar";
import Home from "./Home";
import CartView from "./CartView";
import FavsView from "./FavsView";
import InfoView from "./InfoView";
import ProductSheet from "./ProductSheet";
import StoryViewer from "./StoryViewer";
import ReelsViewer from "./ReelsViewer";
import Toast from "./Toast";
import MoreSheet from "./MoreSheet";
import Intro from "./Intro";

type Modal =
  | { kind: "product"; id: string; color?: number }
  | { kind: "story"; index: number }
  | { kind: "reels"; index: number }
  | null;

const clamp = (n: number, max: number) => Math.max(0, Math.min(max, Number.isFinite(n) ? n : 0));

// Modal holati URL hash'da: #p/kardigan/1, #story/0, #reels/2 — "orqaga" tugmasi modalni yopadi,
// mahsulot havolasini Instagramda ulashish mumkin.
function parseHash(c: Catalog): Modal {
  const [k, a, b] = decodeURIComponent(location.hash.slice(1)).split("/");
  if (k === "p" && a && byId(c, a)) return { kind: "product", id: a, color: b ? Number(b) : undefined };
  if (k === "story") return { kind: "story", index: clamp(Number(a), buildStories(c).length - 1) };
  if (k === "reels") return { kind: "reels", index: clamp(Number(a), c.reels.length - 1) };
  return null;
}

function hashOf(m: NonNullable<Modal>) {
  if (m.kind === "product") return `#p/${m.id}${m.color != null ? `/${m.color}` : ""}`;
  return `#${m.kind}/${m.index}`;
}

// Katalog: serverdan kelgan boshlang'ich holat; DEMO rejimda admin panel o'zgarishlari (localStorage) ustidan yoziladi
// va boshqa vkladkadagi admin saqlaganda jonli yangilanadi.
export default function Shop({ seed }: { seed: Catalog }) {
  const [catalog, setCatalog] = useState(() => publicCatalog(seed));

  useEffect(() => {
    const sync = () => setCatalog(publicCatalog(mergeSeed(loadCatalog(), seed)));
    sync();
    const onStorage = (e: StorageEvent) => e.key?.startsWith("nazokat:admin") && sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener(DEMO_EVENT, sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(DEMO_EVENT, sync);
    };
  }, [seed]);

  return (
    <CatalogProvider catalog={catalog}>
      <Intro />
      <StoreProvider>
        <ShopInner catalog={catalog} />
      </StoreProvider>
    </CatalogProvider>
  );
}

function ShopInner({ catalog }: { catalog: Catalog }) {
  const [tab, setTab] = useState<Tab>("home");
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [more, setMore] = useState(false);
  const [toast, setToast] = useState<{ msg: string; action?: ToastAction; id: number } | null>(null);
  const toastTimer = useRef<number>(0);

  useEffect(() => {
    setModal(parseHash(catalog));
    const onPop = () => setModal(parseHash(catalog));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [catalog]);

  useEffect(() => {
    document.body.classList.toggle("lock", !!modal);
  }, [modal]);

  const open = useCallback((m: NonNullable<Modal>, replace = false) => {
    if (replace) history.replaceState({ m: 1 }, "", hashOf(m));
    else history.pushState({ m: 1 }, "", hashOf(m));
    setModal(m);
  }, []);

  const close = useCallback(() => {
    if (history.state?.m) history.back();
    else {
      history.replaceState(null, "", location.pathname + location.search);
      setModal(null);
    }
  }, []);

  const go = useCallback((t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  }, []);

  const ui = useMemo<UI>(
    () => ({
      go,
      openProduct: (id, color, replace) => open({ kind: "product", id, color }, replace),
      openStory: (index) => open({ kind: "story", index }),
      openReels: (index) => open({ kind: "reels", index }),
      toast: (msg, action) => {
        window.clearTimeout(toastTimer.current);
        setToast({ msg, action, id: Date.now() });
        toastTimer.current = window.setTimeout(() => setToast(null), action ? 3200 : 2200);
      },
    }),
    [go, open]
  );

  const product = modal?.kind === "product" ? byId(catalog, modal.id) : undefined;

  return (
    <UIContext.Provider value={ui}>
      <Header
        q={q}
        onSearch={(v) => {
          setQ(v);
          if (tab !== "home") setTab("home");
        }}
        showSearch={tab === "home"}
        tab={tab}
        onMore={() => setMore(true)}
      />
      <main className="main">
        {tab === "home" && <Home q={q} clearSearch={() => setQ("")} />}
        {tab === "favs" && <FavsView />}
        {tab === "cart" && <CartView />}
        {tab === "info" && <InfoView />}
      </main>
      <TabBar tab={tab} onMore={() => setMore(true)} />
      {more && <MoreSheet onClose={() => setMore(false)} />}

      {product && <ProductSheet key={product.id} product={product} initialColor={modal?.kind === "product" ? modal.color : 0} onClose={close} />}
      {modal?.kind === "story" && <StoryViewer start={modal.index} onClose={close} />}
      {modal?.kind === "reels" && <ReelsViewer start={modal.index} onClose={close} />}
      <Toast toast={toast} onDone={() => setToast(null)} />
    </UIContext.Provider>
  );
}
