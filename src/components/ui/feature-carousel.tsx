"use client";

import { forwardRef, useCallback, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { motionOn } from "@/lib/motion";
import Img from "../Img";
import Icon from "../Icon";

// 3D "coverflow" carousel (21st.dev feature-carousel asosida, loyihaning o'z CSS tizimiga moslangan:
// Tailwind/shadcn/lucide o'rniga globals.css dagi .fc-* klasslar va <Icon/>, rasmlar <Img/> orqali LQIP bilan).
// Qo'shimchalar: barmoq bilan surish, ekrandan chiqsa / bosib turilsa autoplay to'xtaydi,
// "harakatni kamaytirish" yoqilgan bo'lsa autoplay yo'q, markaziy karta bosilsa onOpen.

type Item = { k: string; alt: string };

interface FeatureCarouselProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  subtitle: string;
  images: Item[];
  interval?: number;
  onOpen?: (index: number) => void;
  caption?: (index: number) => ReactNode;
}

export const FeatureCarousel = forwardRef<HTMLDivElement, FeatureCarouselProps>(
  ({ title, subtitle, images, interval = 4000, onOpen, caption, className = "", ...props }, ref) => {
    const total = images.length;
    const [current, setCurrent] = useState(Math.floor(total / 2));
    const [visible, setVisible] = useState(false);
    const [hold, setHold] = useState(false);
    const stage = useRef<HTMLDivElement>(null);
    const drag = useRef({ x: 0, moved: false });

    const next = useCallback(() => setCurrent((i) => (i + 1) % total), [total]);
    const prev = useCallback(() => setCurrent((i) => (i - 1 + total) % total), [total]);

    useEffect(() => {
      const el = stage.current;
      if (!el || !("IntersectionObserver" in window)) return;
      const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
      io.observe(el);
      return () => io.disconnect();
    }, []);

    // Har bir o'tishdan keyin taymer qaytadan boshlanadi — qo'lda bosilganda darhol keyingisiga sakramaydi
    useEffect(() => {
      if (!visible || hold || !motionOn()) return;
      const t = window.setTimeout(() => {
        if (!document.hidden) next();
      }, interval);
      return () => window.clearTimeout(t);
    }, [current, visible, hold, interval, next]);

    return (
      <div ref={ref} className={`fc ${className}`} {...props}>
        <div className="fc__glow" aria-hidden="true">
          <span />
          <span />
        </div>

        <div className="fc__head">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div
          className="fc__stage"
          ref={stage}
          role="region"
          aria-roledescription="carousel"
          aria-label={typeof title === "string" ? title : "Carousel"}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, moved: false };
            setHold(true);
          }}
          onPointerMove={(e) => {
            if (Math.abs(e.clientX - drag.current.x) > 8) drag.current.moved = true;
          }}
          onPointerUp={(e) => {
            setHold(false);
            const dx = e.clientX - drag.current.x;
            if (dx < -40) next();
            else if (dx > 40) prev();
          }}
          onPointerCancel={() => setHold(false)}
          onPointerLeave={() => setHold(false)}
        >
          {images.map((image, index) => {
            let pos = (index - current + total) % total;
            if (pos > Math.floor(total / 2)) pos -= total;
            const isCenter = pos === 0;
            const isAdjacent = Math.abs(pos) === 1;

            return (
              <button
                key={image.k}
                className={`fc__item ${isCenter ? "is-center" : ""} ${isAdjacent ? "is-side" : ""}`}
                style={{
                  transform: `translateX(${pos * 48}%) scale(${isCenter ? 1 : isAdjacent ? 0.84 : 0.7}) rotateY(${pos * -12}deg)`,
                  zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                  opacity: isCenter ? 1 : isAdjacent ? 0.55 : 0,
                  visibility: Math.abs(pos) > 1 ? "hidden" : "visible",
                }}
                tabIndex={isCenter ? 0 : -1}
                aria-hidden={!isCenter}
                aria-label={image.alt}
                onClick={() => {
                  if (drag.current.moved) return;
                  if (isCenter) onOpen?.(index);
                  else setCurrent(index);
                }}
              >
                <Img k={image.k} alt={image.alt} />
              </button>
            );
          })}

          <button className="fc__nav fc__nav--l" onClick={prev} aria-label="Oldingi">
            <Icon name="left" />
          </button>
          <button className="fc__nav fc__nav--r" onClick={next} aria-label="Keyingi">
            <Icon name="right" />
          </button>
        </div>

        {caption && (
          <div className="fc__caption" aria-live="polite" key={current}>
            {caption(current)}
          </div>
        )}

        <div className="fc__dots" aria-hidden="true">
          {images.map((image, i) => (
            <span key={image.k} className={i === current ? "is-on" : ""} />
          ))}
        </div>
      </div>
    );
  }
);

FeatureCarousel.displayName = "FeatureCarousel";
