"use client";

import { useEffect, useState } from "react";
import { igUrl } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { cartCount, useStore } from "@/lib/store";
import { useUI, type Tab } from "@/lib/ui";
import { motionOn } from "@/lib/motion";
import Flower from "./Flower";
import Icon from "./Icon";

type Props = {
  q: string;
  onSearch: (v: string) => void;
  showSearch: boolean;
  tab: Tab;
  onMore: () => void;
};

// Telefonda: logo + Instagram, ostida qidiruv (pastda TabBar).
// Desktopda (≥1024px): bitta qator — logo, navigatsiya, keng qidiruv, sevimli/savat/⋯ ikonkalari; TabBar yashiriladi.
export default function Header({ q, onSearch, showSearch, tab, onMore }: Props) {
  const { go, openReels } = useUI();
  const { state } = useStore();
  const { settings: SHOP } = useCatalog();
  const [scrolled, setScrolled] = useState(false);
  const cart = cartCount(state.cart);
  const favs = state.favs.length;

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 8);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toCatalog = () => {
    go("home");
    requestAnimationFrame(() => document.getElementById("catalog")?.scrollIntoView({ behavior: motionOn() ? "smooth" : "auto" }));
  };

  const search = (cls: string) => (
    <label className={`search ${cls}`}>
      <Icon name="search" />
      <input
        type="search"
        value={q}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Palto, sviter, sumka…"
        enterKeyHint="search"
        aria-label="Mahsulot qidirish"
      />
      {q && (
        <button className="search__clear" onClick={() => onSearch("")} aria-label="Tozalash">
          <Icon name="close" />
        </button>
      )}
    </label>
  );

  return (
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="header__row">
        <a
          className="logo"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSearch("");
            go("home");
          }}
          aria-label={SHOP.name}
        >
          <span className="logo__mark">
            <Flower />
          </span>
          <span className="logo__text">
            Nazokat<small>Lady Shop · {SHOP.city}</small>
          </span>
        </a>

        <nav className="hnav" aria-label="Bo'limlar">
          <button className={tab === "home" && !q ? "is-on" : ""} onClick={toCatalog}>
            Kolleksiya
          </button>
          <button onClick={() => openReels(0)}>Videolar</button>
          <button className={tab === "info" ? "is-on" : ""} onClick={() => go("info")}>
            Aloqa
          </button>
        </nav>

        {search("search--desk")}

        <a className="ig-pill" href={igUrl(SHOP)} target="_blank" rel="noopener">
          <Icon name="insta" />
          <span>@{SHOP.instagram}</span>
        </a>

        <div className="hicons">
          <button className={`hicon ${tab === "favs" ? "is-on" : ""}`} onClick={() => go("favs")} aria-label={`Sevimlilar (${favs})`} title="Sevimlilar">
            <span className="hicon__in">
              <Icon name="heart" />
              {favs > 0 && <i className="badge">{favs}</i>}
            </span>
          </button>
          <button className={`hicon ${tab === "cart" ? "is-on" : ""}`} onClick={() => go("cart")} aria-label={`Savat (${cart})`} title="Savat">
            <span className="hicon__in" data-cart-target="">
              <Icon name="bag" />
              {cart > 0 && (
                <i className="badge" key={cart}>
                  {cart}
                </i>
              )}
            </span>
          </button>
          <button className="hicon" onClick={onMore} aria-label="Boshqa" title="Boshqa">
            <Icon name="dots" />
          </button>
        </div>
      </div>
      {showSearch && search("search--mob")}
    </header>
  );
}
