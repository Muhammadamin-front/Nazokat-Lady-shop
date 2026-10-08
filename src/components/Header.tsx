"use client";

import { useEffect, useState } from "react";
import { igUrl } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useUI } from "@/lib/ui";
import Flower from "./Flower";
import Icon from "./Icon";

export default function Header({ q, onSearch, showSearch }: { q: string; onSearch: (v: string) => void; showSearch: boolean }) {
  const { go } = useUI();
  const { settings: SHOP } = useCatalog();
  const [scrolled, setScrolled] = useState(false);

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
        <a className="ig-pill" href={igUrl(SHOP)} target="_blank" rel="noopener">
          <Icon name="insta" />
          <span>@{SHOP.instagram}</span>
        </a>
      </div>
      {showSearch && (
        <label className="search">
          <Icon name="search" />
          <input
            type="search"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Kardigan, kostyum, velur…"
            enterKeyHint="search"
            aria-label="Mahsulot qidirish"
          />
          {q && (
            <button className="search__clear" onClick={() => onSearch("")} aria-label="Tozalash">
              <Icon name="close" />
            </button>
          )}
        </label>
      )}
    </header>
  );
}
