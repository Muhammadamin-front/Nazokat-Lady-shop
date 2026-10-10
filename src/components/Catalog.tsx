"use client";

import { useMemo, useRef, useState } from "react";
import { useCatalog } from "@/lib/catalog-context";
import ProductCard from "./ProductCard";
import Icon from "./Icon";

export default function Catalog({ q, clearSearch }: { q: string; clearSearch: () => void }) {
  const [cat, setCat] = useState("all");
  const [animate, setAnimate] = useState(false); // ro'yxat faqat foydalanuvchi kategoriya tanlaganda animatsiya qiladi
  const chips = useRef<HTMLDivElement>(null);
  const catalog = useCatalog();
  const PRODUCTS = catalog.products;
  const CATEGORIES = [{ id: "all", name: "Hammasi" }, ...catalog.categories];

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: PRODUCTS.length };
    PRODUCTS.forEach((p) => (c[p.cat] = (c[p.cat] ?? 0) + 1));
    return c;
  }, [PRODUCTS]);

  const query = q.trim().toLowerCase();
  const list = PRODUCTS.filter(
    (p) =>
      (cat === "all" || p.cat === cat) &&
      (!query || p.name.toLowerCase().includes(query) || p.colors.some((c) => c.name.toLowerCase().includes(query)))
  );

  const pick = (id: string) => {
    setCat(id);
    setAnimate(true);
  };
  const visible = CATEGORIES.filter((c) => counts[c.id]);

  return (
    <section className="section catalog" id="catalog">
      <div className="section__head">
        <h2>{query ? "Qidiruv natijalari" : "Kolleksiya"}</h2>
        <span className="muted">{list.length} ta mahsulot</span>
      </div>

      <div className="catalog__layout">
        {/* Desktop: chap tomonda yopishqoq kategoriyalar paneli */}
        <aside className="cat-side" aria-label="Kategoriyalar">
          <h3>Kategoriyalar</h3>
          <ul>
            {visible.map((c) => (
              <li key={c.id}>
                <button className={cat === c.id ? "is-on" : ""} aria-current={cat === c.id} onClick={() => pick(c.id)}>
                  <span>{c.name}</span>
                  <small>{counts[c.id]}</small>
                </button>
              </li>
            ))}
          </ul>
          <div className="cat-side__note">
            <b>Hammasi bitta narxda</b>
            <span>{catalog.settings.city} bo&apos;ylab yetkazib beramiz</span>
          </div>
        </aside>

        <div className="catalog__main">
          {/* Telefon: gorizontal chip'lar */}
          <div className="chips" ref={chips} role="tablist">
            {visible.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={cat === c.id}
                className={`chip ${cat === c.id ? "is-on" : ""}`}
                onClick={(e) => {
                  pick(c.id);
                  (e.currentTarget as HTMLElement).scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
                }}
              >
                {c.name}
                <small>{counts[c.id]}</small>
              </button>
            ))}
          </div>

          {list.length ? (
            <div className={`grid ${animate ? "grid--anim" : ""}`} key={`${cat}|${query}`}>
              {list.map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <Icon name="search" className="ico--xl" />
              <p>“{q}” bo&apos;yicha hech narsa topilmadi</p>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setCat("all");
                  clearSearch();
                }}
              >
                Hammasini ko&apos;rsatish
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
