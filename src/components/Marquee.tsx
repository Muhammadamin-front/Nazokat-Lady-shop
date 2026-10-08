"use client";

import { useEffect, useRef, useState } from "react";
import { useCatalog } from "@/lib/catalog-context";

// Cheksiz yuguruvchi lenta: bitta transform animatsiyasi, faqat ekranda ko'ringanda yuradi
export default function Marquee() {
  const ITEMS = useCatalog().settings.marquee.filter(Boolean);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!ITEMS.length) return null;
  const row = ITEMS.map((t, i) => (
    <span key={i}>
      {t}
      <i aria-hidden="true">✦</i>
    </span>
  ));
  return (
    <div ref={ref} className={`marquee ${inView ? "is-in" : ""}`} role="note" aria-label={ITEMS.join(", ")}>
      <div className="marquee__track" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  );
}
