"use client";

import { useMemo } from "react";
import { buildStories } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import Img from "./Img";

export default function Stories() {
  const catalog = useCatalog();
  const stories = useMemo(() => buildStories(catalog), [catalog]);
  const { openStory } = useUI();
  const { state } = useStore();

  return (
    <section className="stories" aria-label="Story'lar">
      {stories.map((s, i) => (
        <button
          key={s.id}
          className={`story-dot ${state.seen.includes(s.id) ? "is-seen" : ""}`}
          style={{ animationDelay: `${i * 60}ms` }}
          onClick={() => openStory(i)}
        >
          <span className="story-dot__ring">
            <Img k={s.cover} alt="" className="story-dot__img" />
          </span>
          <span className="story-dot__label">{s.title}</span>
        </button>
      ))}
    </section>
  );
}
