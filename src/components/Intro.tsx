"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import Flower from "./Flower";

const TEXT = "Nazokat Shop'ga\nxush kelibsiz!";
const KEY = "nazokat:intro";

// Kirish ekrani: "Nazokat Shop'ga xush kelibsiz!" harfma-harf yoziladi, so'ng parda yuqoriga ko'tariladi.
// Sessiyada bir marta; layout.tsx dagi skript <html data-intro="play"> qo'yganda ko'rinadi (CSS),
// shuning uchun qayta tashrifda miltillamaydi. JS kech yuklansa ham CSS o'zi 7 soniyada yopadi.
export default function Intro() {
  const { settings } = useCatalog();
  const [play, setPlay] = useState(false);
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<"type" | "sub" | "out">("type");

  useEffect(() => {
    setPlay(document.documentElement.dataset.intro === "play");
  }, []);

  useEffect(() => {
    if (!play || phase !== "type") return;
    if (n >= TEXT.length) {
      const t = window.setTimeout(() => setPhase("sub"), 150);
      return () => window.clearTimeout(t);
    }
    // bo'shliq va yangi qatorda biroz uzoqroq to'xtaladi — qo'lda yozilgandek
    const ch = TEXT[n];
    const t = window.setTimeout(() => setN(n + 1), ch === "\n" ? 170 : ch === " " ? 70 : 42);
    return () => window.clearTimeout(t);
  }, [play, n, phase]);

  useEffect(() => {
    if (phase !== "sub") return;
    const t = window.setTimeout(() => setPhase("out"), 650);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "out") return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    const t = window.setTimeout(() => {
      document.documentElement.dataset.intro = "done";
      setPlay(false);
    }, 750);
    return () => window.clearTimeout(t);
  }, [phase]);

  const skip = () => {
    setN(TEXT.length);
    setPhase("out");
  };

  const typed = TEXT.slice(0, n);
  const [l1, l2 = ""] = typed.split("\n");

  return (
    <div className={`intro ${phase === "out" ? "is-out" : ""}`} onClick={skip} aria-hidden={!play}>
      <div className="intro__inner">
        <span className="intro__mark">
          <Flower />
        </span>
        <h1 className="intro__text" aria-label={TEXT.replace("\n", " ")}>
          <span aria-hidden="true">
            {l1}
            {typed.includes("\n") && <br />}
            <em>{l2}</em>
            <i className="intro__caret" />
          </span>
        </h1>
        <p className={`intro__sub ${phase !== "type" ? "is-on" : ""}`}>
          {settings.city} · Hammasi {money(settings.price)}
        </p>
      </div>
      <button
        className="intro__skip"
        onClick={(e) => {
          e.stopPropagation();
          skip();
        }}
      >
        O&apos;tkazib yuborish
      </button>
    </div>
  );
}
