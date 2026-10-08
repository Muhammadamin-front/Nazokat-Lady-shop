"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildStories, colorOfPhoto, mediaSrc, money, priceOf, productOfPhoto } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { slowNet } from "@/lib/motion";
import Img from "./Img";
import Icon from "./Icon";
import Flower from "./Flower";

// Instagram story ko'ruvchisi: o'ng tomonga bosish — keyingi, chapga — oldingi,
// bosib turish — pauza, pastga surish — yopish. Taymer segmentning CSS animatsiyasi.
export default function StoryViewer({ start, onClose }: { start: number; onClose: () => void }) {
  const { dispatch } = useStore();
  const catalog = useCatalog();
  const SHOP = catalog.settings;
  const STORIES = useMemo(() => buildStories(catalog), [catalog]);
  const { openProduct } = useUI();
  const [si, setSi] = useState(start);
  const [ii, setIi] = useState(0);
  const [paused, setPaused] = useState(false);
  const press = useRef({ t: 0, x: 0, y: 0, held: false, timer: 0 });
  const story = STORIES[si];
  const photo = story.items[ii];
  const product = productOfPhoto(catalog, photo);
  const size = slowNet() ? "sm" : "lg";

  useEffect(() => {
    dispatch({ type: "seen", id: story.id });
  }, [story.id, dispatch]);

  const next = () => {
    if (ii < story.items.length - 1) setIi(ii + 1);
    else if (si < STORIES.length - 1) {
      setSi(si + 1);
      setIi(0);
    } else onClose();
  };
  const prev = () => {
    if (ii > 0) setIi(ii - 1);
    else if (si > 0) {
      setSi(si - 1);
      setIi(0);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const nextPhoto = story.items[ii + 1] ?? STORIES[si + 1]?.items[0];

  return (
    <div className="story" role="dialog" aria-modal="true" aria-label={`${story.title} story`}>
      <div className="story__frame">
        <div
          className="story__media"
          onPointerDown={(e) => {
            const p = press.current;
            p.t = Date.now();
            p.x = e.clientX;
            p.y = e.clientY;
            p.held = false;
            p.timer = window.setTimeout(() => {
              p.held = true;
              setPaused(true);
            }, 220);
          }}
          onPointerUp={(e) => {
            const p = press.current;
            window.clearTimeout(p.timer);
            setPaused(false);
            if (e.clientY - p.y > 90) return onClose();
            if (p.held) return;
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientX - r.left < r.width / 3) prev();
            else next();
          }}
          onPointerCancel={() => {
            window.clearTimeout(press.current.timer);
            setPaused(false);
          }}
        >
          <Img k={photo} size={size} key={photo} priority alt={product?.name} className="story__img" />
          {nextPhoto && <link rel="prefetch" as="image" href={mediaSrc(catalog, nextPhoto, size)} />}
        </div>

        <div className="story__top">
          <div className="segs segs--story">
            {story.items.map((k, i) => (
              <span key={k} className={`seg ${i < ii ? "is-done" : ""} ${i === ii ? "is-on" : ""} ${paused ? "is-paused" : ""}`}>
                <i key={i === ii ? `${si}-${ii}` : "x"} onAnimationEnd={i === ii ? next : undefined} />
              </span>
            ))}
          </div>
          <div className="story__who">
            <span className="story__avatar">
              <Flower />
            </span>
            <b>{SHOP.instagram.toLowerCase()}</b>
            <span className="story__title">{story.title}</span>
            <button className="story__close" onClick={onClose} aria-label="Yopish">
              <Icon name="close" />
            </button>
          </div>
        </div>

        {product && (
          <div className="story__bottom">
            <div>
              <b>{product.name}</b>
              <span>{money(priceOf(catalog, product))}</span>
            </div>
            <button className="btn btn--light" onClick={() => openProduct(product.id, colorOfPhoto(product, photo), true)}>
              Ko&apos;rish <Icon name="arrow" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
