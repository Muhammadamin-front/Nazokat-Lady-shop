"use client";

import { useState } from "react";
import { fmtNum, money, photosOf, priceOf, ratingOf, showRatings } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { bump, haptic } from "@/lib/motion";
import Img from "./Img";
import Icon from "./Icon";
import Stars from "./Stars";

const MAX_SWATCHES = 4;

export default function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { state, dispatch } = useStore();
  const { openProduct, toast } = useUI();
  const catalog = useCatalog();
  const [picked, setColor] = useState(0);
  const color = Math.min(picked, p.colors.length - 1); // admin rangni o'chirsa ham xavfsiz
  const photos = photosOf(p, color);
  const fav = state.favs.includes(p.id);
  const inCart = state.cart.filter((l) => l.id === p.id).reduce((n, l) => n + l.qty, 0);

  return (
    <article className={`card ${p.soldOut ? "is-out" : ""}`} style={{ ["--i" as string]: Math.min(index, 8) }}>
      <button className="card__media" onClick={() => openProduct(p.id, color)} aria-label={p.name}>
        <Img k={photos[0]} alt={`${p.name} — ${p.colors[color].name}`} key={photos[0]} className="card__img" />
        {photos[1] && <Img k={photos[1]} alt="" className="card__img card__img--alt" />}
        {p.badge && !p.soldOut && <span className={`badge-tag badge-tag--${p.badge === "Xit" ? "hit" : "new"}`}>{p.badge}</span>}
        {p.soldOut && <span className="badge-tag badge-tag--out">Tugagan</span>}
        {inCart > 0 && <span className="card__incart">Savatda: {inCart}</span>}
      </button>

      <button
        className={`fav ${fav ? "is-on" : ""}`}
        aria-pressed={fav}
        aria-label={fav ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
        onClick={(e) => {
          dispatch({ type: "fav", id: p.id });
          haptic();
          bump(e.currentTarget.firstElementChild);
          if (!fav) toast("Sevimlilarga qo'shildi");
        }}
      >
        <Icon name="heart" />
      </button>

      <div className="card__body">
        {p.colors.length > 1 && (
          <div className="swatches" role="radiogroup" aria-label="Rang">
            {p.colors.slice(0, MAX_SWATCHES).map((c, i) => (
              <button
                key={c.name}
                role="radio"
                aria-checked={i === color}
                aria-label={c.name}
                title={c.name}
                className={`swatch ${i === color ? "is-on" : ""}`}
                style={{ ["--c" as string]: c.hex }}
                onClick={() => setColor(i)}
              />
            ))}
            {p.colors.length > MAX_SWATCHES && <span className="swatches__more">+{p.colors.length - MAX_SWATCHES}</span>}
          </div>
        )}
        <h3 className="card__name">{p.name}</h3>
        {showRatings(catalog.settings) && (
          <div className="card__rating">
            <Stars value={ratingOf(p).rating} size={12} />
            <b>{ratingOf(p).rating.toFixed(1)}</b>
            <span>({fmtNum(ratingOf(p).reviews)})</span>
          </div>
        )}
        <div className="card__foot">
          <span className="price">{money(priceOf(catalog, p))}</span>
          <button className="card__add" onClick={() => openProduct(p.id, color)} aria-label="Savatga qo'shish">
            <Icon name="bagPlus" />
          </button>
        </div>
      </div>
    </article>
  );
}
