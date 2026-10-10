"use client";

import { useRef } from "react";
import { useCatalog } from "@/lib/catalog-context";
import { useUI } from "@/lib/ui";
import Img from "./Img";
import Icon from "./Icon";

export default function ReelsRow() {
  const { openReels } = useUI();
  const REELS = useCatalog().reels;
  const row = useRef<HTMLDivElement>(null);
  // sichqoncha bilan ishlovchilar uchun: qatorni bir ekran kengligida suradi
  const slide = (dir: -1 | 1) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: "smooth" });
  if (!REELS.length) return null;
  return (
    <section className="section">
      <div className="section__head">
        <h2>Reels</h2>
        <div className="section__tools">
          <button className="row-nav" onClick={() => slide(-1)} aria-label="Orqaga">
            <Icon name="left" />
          </button>
          <button className="row-nav" onClick={() => slide(1)} aria-label="Oldinga">
            <Icon name="right" />
          </button>
          <button className="link" onClick={() => openReels(0)}>
            Hammasi <Icon name="right" />
          </button>
        </div>
      </div>
      <div className="reel-row" ref={row}>
        {REELS.map((r, i) => (
          <button key={r.id} className="reel-card" onClick={() => openReels(i)}>
            <Img k={r.poster} alt="" />
            <span className="reel-card__shade" />
            <span className="reel-card__play">
              <Icon name="play" />
            </span>
            {r.video && <span className="reel-card__live">Video</span>}
            <span className="reel-card__cap">{r.caption}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
