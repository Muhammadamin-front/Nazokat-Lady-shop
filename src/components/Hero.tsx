"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { byId, heroSlides, money } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useUI } from "@/lib/ui";
import { motionOn } from "@/lib/motion";
import Img from "./Img";
import Icon from "./Icon";


// Instagram story'ga o'xshash avtomatik carousel. Taymer = segmentning CSS animatsiyasi:
// ekrandan chiqsa yoki barmoq bosib turilsa, animatsiya (va taymer) to'xtaydi.
export default function Hero() {
  const { openProduct, openReels } = useUI();
  const catalog = useCatalog();
  const SHOP = catalog.settings;
  const SLIDES = useMemo(() => heroSlides(catalog), [catalog]);
  const priceNum = money(SHOP.price).replace(" so'm", "");
  const track = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [hold, setHold] = useState(false);
  const programmatic = useRef(false);

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const n = (i + SLIDES.length) % Math.max(1, SLIDES.length);
    programmatic.current = true;
    el.scrollTo({ left: n * el.clientWidth, behavior: motionOn() ? "smooth" : "auto" });
    setIdx(n);
    window.setTimeout(() => (programmatic.current = false), 700);
  };

  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let t = 0;
    const onScroll = () => {
      if (programmatic.current) return;
      window.clearTimeout(t);
      t = window.setTimeout(() => setIdx(Math.min(SLIDES.length - 1, Math.round(el.scrollLeft / el.clientWidth))), 90);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const current = SLIDES[idx] ? byId(catalog, SLIDES[idx].product) : undefined;

  return (
    <section ref={root} className={`hero ${visible && !hold ? "" : "is-paused"}`}>
      <div className="hero__media">
        <div
          className="hero__track"
          ref={track}
          onPointerDown={() => setHold(true)}
          onPointerUp={() => setHold(false)}
          onPointerCancel={() => setHold(false)}
          onPointerLeave={() => setHold(false)}
        >
          {SLIDES.map((s, i) => (
            <button key={s.photo} className="hero__slide" onClick={() => openProduct(s.product)} aria-label={byId(catalog, s.product)?.name}>
              <Img k={s.photo} size="lg" priority={i === 0} alt={byId(catalog, s.product)?.name} />
            </button>
          ))}
        </div>
        <div className="segs">
          {SLIDES.map((s, i) => (
            <button key={s.photo} className={`seg ${i < idx ? "is-done" : ""} ${i === idx ? "is-on" : ""}`} onClick={() => goTo(i)} aria-label={`${i + 1}-rasm`}>
              <i key={i === idx ? `on-${idx}` : "off"} onAnimationEnd={() => goTo(idx + 1)} />
            </button>
          ))}
        </div>
        {current && (
          <button className="hero__tag" onClick={() => openProduct(current.id)} key={current.id}>
            {current.name}
            <Icon name="right" />
          </button>
        )}
      </div>

      <div className="hero__copy">
        <h1>
          <span className="w" style={{ ["--i" as string]: 0 }}>Hammasi</span>{" "}
          <span className="w" style={{ ["--i" as string]: 1 }}>
            <em>{priceNum}</em>
          </span>{" "}
          <span className="w" style={{ ["--i" as string]: 2 }}>so&apos;m</span>
        </h1>
        <p className="hero__sub">
          {SHOP.city}dagi ayollar butigi: {catalog.categories.map((c) => c.name.toLowerCase()).join(", ")} — bitta narxda.
        </p>
        <div className="hero__actions">
          <a
            className="btn btn--light cta"
            href="#catalog"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("catalog")?.scrollIntoView({ behavior: motionOn() ? "smooth" : "auto" });
            }}
          >
            Kolleksiyani ko&apos;rish <Icon name="arrow" className="cta__arrow" />
          </a>
          <button className="btn btn--glass" onClick={() => openReels(0)}>
            <Icon name="play" /> Reels
          </button>
        </div>
      </div>
    </section>
  );
}
