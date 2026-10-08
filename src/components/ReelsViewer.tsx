"use client";

import { useEffect, useRef, useState } from "react";
import { byId, colorOfPhoto, mediaSrc, money, priceOf } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { bump, haptic, slowNet } from "@/lib/motion";
import Img from "./Img";
import Icon from "./Icon";
import Flower from "./Flower";

// Instagram Reels kabi vertikal lenta. Faqat ekrandagi video yuklanadi va o'ynaydi;
// sekin internet / Data Saver da video avtomatik boshlanmaydi — "play" tugmasi chiqadi.
export default function ReelsViewer({ start, onClose }: { start: number; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const catalog = useCatalog();
  const SHOP = catalog.settings;
  const REELS = catalog.reels;
  const { openProduct, toast } = useUI();
  const [active, setActive] = useState(start);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [burst, setBurst] = useState<number | null>(null);
  const feed = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const lastTap = useRef(0);
  const autoplay = useRef(true);

  useEffect(() => {
    autoplay.current = !slowNet();
    const el = feed.current;
    if (!el) return;
    el.scrollTop = start * el.clientHeight;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { root: el, threshold: 0.6 }
    );
    el.querySelectorAll(".reel").forEach((r) => io.observe(r));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [start, onClose]);

  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && autoplay.current) {
        v.play().then(
          () => setPlaying(true),
          () => setPlaying(false)
        );
      } else {
        v.pause();
        if (i !== active) v.currentTime = 0;
      }
    });
    if (!REELS[active]?.video) setPlaying(false);
  }, [active]);

  const toggleVideo = (i: number) => {
    const v = videos.current[i];
    if (!v) return;
    if (v.paused) {
      autoplay.current = true;
      v.play().then(() => setPlaying(true), () => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const like = (id: string, i: number) => {
    if (!state.favs.includes(id)) dispatch({ type: "fav", id });
    haptic(12);
    setBurst(i);
    window.setTimeout(() => setBurst(null), 800);
  };

  return (
    <div className="reels" role="dialog" aria-modal="true" aria-label="Reels">
      <div className="reels__bar">
        <button className="round round--dark" onClick={onClose} aria-label="Yopish">
          <Icon name="left" />
        </button>
        <b>Reels</b>
        {REELS[active]?.video ? (
          <button className="round round--dark" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Ovozni yoqish" : "Ovozni o'chirish"}>
            <Icon name={muted ? "mute" : "volume"} />
          </button>
        ) : (
          <span className="round round--ghost" />
        )}
      </div>

      <div className="reels__feed" ref={feed}>
        {REELS.map((r, i) => {
          const p = r.product ? byId(catalog, r.product) : undefined;
          const fav = p ? state.favs.includes(p.id) : false;
          const near = Math.abs(i - active) <= 1;
          return (
            <section className={`reel ${i === active ? "is-active" : ""}`} key={r.id} data-i={i}>
              <div
                className="reel__media"
                onPointerUp={() => {
                  const now = Date.now();
                  if (now - lastTap.current < 280 && p) {
                    like(p.id, i);
                    lastTap.current = 0;
                    return;
                  }
                  lastTap.current = now;
                  if (r.video) window.setTimeout(() => lastTap.current === now && toggleVideo(i), 290);
                }}
              >
                {r.video ? (
                  <>
                    {near || i === active ? (
                      <video
                        ref={(v) => {
                          videos.current[i] = v;
                        }}
                        src={r.video}
                        poster={mediaSrc(catalog, r.poster, "lg")}
                        muted={muted}
                        loop
                        playsInline
                        preload={i === active ? "auto" : "none"}
                      />
                    ) : (
                      <Img k={r.poster} size="lg" alt="" />
                    )}
                    {i === active && !playing && (
                      <span className="reel__play">
                        <Icon name="play" />
                      </span>
                    )}
                  </>
                ) : (
                  near && <Img k={r.poster} size={slowNet() ? "sm" : "lg"} alt={r.caption} className="kenburns" />
                )}
                {burst === i && (
                  <span className="reel__burst">
                    <Icon name="heart" />
                  </span>
                )}
              </div>

              <div className="reel__side">
                {p && (
                  <button
                    className={`reel__act ${fav ? "is-fav" : ""}`}
                    onClick={(e) => {
                      dispatch({ type: "fav", id: p.id });
                      haptic();
                      bump(e.currentTarget.firstElementChild);
                    }}
                    aria-label="Sevimlilarga"
                  >
                    <Icon name="heart" />
                    <span>Sevimli</span>
                  </button>
                )}
                <button
                  className="reel__act"
                  onClick={async () => {
                    const url = `${location.origin}${location.pathname}#reels/${i}`;
                    try {
                      if (navigator.share) await navigator.share({ title: SHOP.name, text: r.caption, url });
                      else {
                        await navigator.clipboard.writeText(url);
                        toast("Havola nusxalandi");
                      }
                    } catch {}
                  }}
                  aria-label="Ulashish"
                >
                  <Icon name="send" />
                  <span>Ulashish</span>
                </button>
                {p && (
                  <button className="reel__act" onClick={() => openProduct(p.id, colorOfPhoto(p, r.poster), true)} aria-label="Mahsulotni ko'rish">
                    <Icon name="bag" />
                    <span>Xarid</span>
                  </button>
                )}
              </div>

              <div className="reel__info">
                <div className="reel__who">
                  <span className="story__avatar">
                    <Flower />
                  </span>
                  <b>{SHOP.instagram.toLowerCase()}</b>
                </div>
                <p>{r.caption}</p>
                {p && (
                  <button className="reel__product" onClick={() => openProduct(p.id, colorOfPhoto(p, r.poster), true)}>
                    <Img k={r.video ? (p.colors[0].photos[0] ?? r.poster) : r.poster} alt="" />
                    <span>
                      <b>{p.name}</b>
                      <small>{money(priceOf(catalog, p))}</small>
                    </span>
                    <Icon name="right" />
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
