"use client";

import { useEffect, useRef, useState } from "react";
import { fmtNum, igDm, mediaSrc, money, photosOf, priceOf, ratingOf, showRatings } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { flyToCart, haptic, motionOn, slowNet } from "@/lib/motion";
import Img from "./Img";
import Icon from "./Icon";
import Stars from "./Stars";

export default function ProductSheet({ product: p, initialColor = 0, onClose }: { product: Product; initialColor?: number; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const { toast, go } = useUI();
  const catalog = useCatalog();
  const SHOP = catalog.settings;
  const price = priceOf(catalog, p);
  const [color, setColor] = useState(Math.min(initialColor ?? 0, p.colors.length - 1));
  const [size, setSize] = useState<string | null>(p.sizes.length ? null : "");
  const [sizeErr, setSizeErr] = useState(false);
  const [qty, setQty] = useState(1);
  const [slide, setSlide] = useState(0);
  const [open, setOpen] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);
  const photos = photosOf(p, color);
  const fav = state.favs.includes(p.id);
  const big = slowNet() ? "sm" : "lg";

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    track.current?.scrollTo({ left: 0 });
    setSlide(0);
  }, [color]);

  const onScroll = () => {
    const el = track.current;
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goSlide = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: motionOn() ? "smooth" : "auto" });
  };

  const add = () => {
    if (size === null) {
      setSizeErr(true);
      haptic(30);
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    dispatch({ type: "add", line: { id: p.id, color, size, qty } });
    const img = track.current?.children[slide]?.querySelector("img");
    flyToCart(img, mediaSrc(catalog, photos[slide] ?? photos[0], "sm"));
    haptic(15);
    toast("Savatga qo'shildi", { label: "Savatga o'tish", onClick: () => go("cart") });
    onClose();
  };

  const share = async () => {
    const url = `${location.origin}${location.pathname}#p/${p.id}/${color}`;
    const text = `${p.name} — ${money(price)}`;
    try {
      if (navigator.share) await navigator.share({ title: p.name, text, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Havola nusxalandi");
      }
    } catch {}
  };

  return (
    <div className={`modal ${open ? "is-open" : ""}`}>
      <div className="modal__bg" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={p.name}>
        <div className="sheet__grab" aria-hidden="true" />
        <div className="gallery">
          <div className="gallery__track" ref={track} onScroll={onScroll}>
            {photos.map((k, i) => (
              <div className="gallery__slide" key={k}>
                <Img k={k} size={big} priority={i === 0} alt={`${p.name} — ${p.colors[color].name}`} />
              </div>
            ))}
          </div>
          {photos.length > 1 && (
            <>
              <div className="dots">
                {photos.map((k, i) => (
                  <button key={k} className={i === slide ? "is-on" : ""} onClick={() => goSlide(i)} aria-label={`${i + 1}-rasm`} />
                ))}
              </div>
              <div className="thumbs">
                {photos.map((k, i) => (
                  <button key={k} className={i === slide ? "is-on" : ""} onClick={() => goSlide(i)} aria-label={`${i + 1}-rasm`}>
                    <Img k={k} />
                  </button>
                ))}
              </div>
              <button className="gallery__nav gallery__nav--l" onClick={() => goSlide(Math.max(0, slide - 1))} aria-label="Oldingi rasm">
                <Icon name="left" />
              </button>
              <button className="gallery__nav gallery__nav--r" onClick={() => goSlide(Math.min(photos.length - 1, slide + 1))} aria-label="Keyingi rasm">
                <Icon name="right" />
              </button>
            </>
          )}
          <div className="gallery__tools">
            <button className="round" onClick={share} aria-label="Ulashish">
              <Icon name="share" />
            </button>
            <button className="round" onClick={onClose} aria-label="Yopish">
              <Icon name="close" />
            </button>
          </div>
          {p.badge && <span className={`badge-tag badge-tag--${p.badge === "Xit" ? "hit" : "new"}`}>{p.badge}</span>}
        </div>

        <div className="sheet__body">
          <h2 className="sheet__title">{p.name}</h2>
          {showRatings(SHOP) && (
            <div className="sheet__rating">
              <Stars value={ratingOf(p).rating} size={17} />
              <b>{ratingOf(p).rating.toFixed(1)}</b>
              <span>· {fmtNum(ratingOf(p).reviews)} ta baho</span>
            </div>
          )}
          <div className="sheet__price">
            <span className="price price--lg">{money(price)}</span>
            <span className="muted">{p.soldOut ? "Hozircha tugagan — Instagramda so'rang" : price === SHOP.price ? "Barcha mahsulotlar bir narxda" : "Maxsus narx"}</span>
          </div>

          <div className="opt-block">
            <div className="opt-block__label">
              Rang: <b>{p.colors[color].name}</b>
            </div>
            <div className="swatches swatches--lg" role="radiogroup" aria-label="Rang">
              {p.colors.map((c, i) => (
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
            </div>
          </div>

          {p.sizes.length > 0 && (
            <div className={`opt-block ${sizeErr ? "is-err" : ""}`} ref={sizesRef}>
              <div className="opt-block__label">
                O&apos;lcham {sizeErr && <span className="err-text">— iltimos, tanlang</span>}
              </div>
              <div className="sizes" role="radiogroup" aria-label="O'lcham">
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    role="radio"
                    aria-checked={size === s}
                    className={`size ${size === s ? "is-on" : ""}`}
                    onClick={() => {
                      setSize(s);
                      setSizeErr(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <a className="hint-link" href={igDm(SHOP)} target="_blank" rel="noopener">
                <Icon name="ruler" /> O&apos;lchamni bilmaysizmi? Instagramda so&apos;rang
              </a>
            </div>
          )}

          <p className="sheet__desc">{p.desc}</p>

          <ul className="perks">
            <li>
              <Icon name="truck" /> {SHOP.city} bo&apos;ylab yetkazib berish
            </li>
            <li>
              <Icon name="chat" /> Savol bo&apos;lsa —{" "}
              <a href={igDm(SHOP)} target="_blank" rel="noopener">
                Instagramda yozing
              </a>
            </li>
          </ul>
        </div>

        <div className="buybar">
          <button
            className={`round round--line ${fav ? "is-fav" : ""}`}
            onClick={() => {
              dispatch({ type: "fav", id: p.id });
              haptic();
            }}
            aria-pressed={fav}
            aria-label="Sevimlilarga"
          >
            <Icon name="heart" />
          </button>
          <div className="stepper">
            <button onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Kamaytirish">
              <Icon name="minus" />
            </button>
            <b>{qty}</b>
            <button onClick={() => setQty((n) => Math.min(20, n + 1))} aria-label="Ko'paytirish">
              <Icon name="plus" />
            </button>
          </div>
          {p.soldOut ? (
            <a className="btn btn--ghost buybar__add" href={igDm(SHOP)} target="_blank" rel="noopener">
              Tugagan · Instagramda so&apos;rash
            </a>
          ) : (
            <button className="btn btn--primary buybar__add" onClick={add}>
              Savatga · {money(price * qty)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
