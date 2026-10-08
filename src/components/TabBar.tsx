"use client";

import { cartCount, useStore } from "@/lib/store";
import { useUI, type Tab } from "@/lib/ui";
import Icon, { type IconName } from "./Icon";

type Item = { id: Tab; label: string; icon: IconName } | { id: "videos"; label: string; icon: IconName };

const TABS: Item[] = [
  { id: "home", label: "Asosiy", icon: "home" },
  { id: "favs", label: "Sevimli", icon: "heart" },
  { id: "videos", label: "Videolar", icon: "reels" },
  { id: "cart", label: "Savat", icon: "bag" },
  { id: "info", label: "Boshqa", icon: "dots" },
];

export default function TabBar({ tab, onMore }: { tab: Tab; onMore: () => void }) {
  const { go, openReels } = useUI();
  const { state } = useStore();
  const counts: Partial<Record<Tab, number>> = { cart: cartCount(state.cart), favs: state.favs.length };

  return (
    <nav className="tabbar" aria-label="Asosiy menyu">
      {TABS.map((t) =>
        t.id === "videos" ? (
          // Videolar — Reels lentasini ochadi (Instagram'dagi kabi markazda)
          <button key={t.id} className="tab tab--videos" onClick={() => openReels(0)}>
            <span className="tab__icon tab__icon--videos">
              <Icon name={t.icon} />
            </span>
            <span>{t.label}</span>
          </button>
        ) : (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "is-on" : ""}`}
            onClick={() => (t.id === "info" ? onMore() : go(t.id as Tab))}
            aria-current={tab === t.id ? "page" : undefined}
          >
            <span className="tab__icon" data-cart-target={t.id === "cart" ? "" : undefined}>
              <Icon name={t.icon} />
              {!!counts[t.id as Tab] && (
                <i className="badge" key={counts[t.id as Tab]}>
                  {counts[t.id as Tab]}
                </i>
              )}
            </span>
            <span>{t.label}</span>
          </button>
        )
      )}
    </nav>
  );
}
