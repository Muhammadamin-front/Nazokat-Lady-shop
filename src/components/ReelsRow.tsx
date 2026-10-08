"use client";

import { useCatalog } from "@/lib/catalog-context";
import { useUI } from "@/lib/ui";
import Img from "./Img";
import Icon from "./Icon";

export default function ReelsRow() {
  const { openReels } = useUI();
  const REELS = useCatalog().reels;
  if (!REELS.length) return null;
  return (
    <section className="section">
      <div className="section__head">
        <h2>Reels</h2>
        <button className="link" onClick={() => openReels(0)}>
          Hammasi <Icon name="right" />
        </button>
      </div>
      <div className="reel-row">
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
