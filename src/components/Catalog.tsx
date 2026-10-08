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

  return (
    <section className="section" id="catalog">
      <div className="section__head">
        <h2>{query ? "Qidiruv natijalari" : "Kolleksiya"}</h2>
        <span className="muted">{list.length} ta mahsulot</span>
      </div>
      <div className="chips" ref={chips} role="tablist">
        {CATEGORIES.filter((c) => counts[c.id]).map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={cat === c.id}
            className={`chip ${cat === c.id ? "is-on" : ""}`}
            onClick={(e) => {
              setCat(c.id);
              setAnimate(true);
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
    </section>
  );
}
