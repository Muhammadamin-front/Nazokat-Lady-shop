"use client";

import { useEffect, useRef, useState } from "react";
import { useCatalog } from "@/lib/catalog-context";
import { mediaSrc } from "@/lib/catalog";

type Props = {
  k: string;
  size?: "sm" | "lg";
  alt?: string;
  className?: string;
  priority?: boolean;
};

// Avval ~400 baytlik xira LQIP fon ko'rinadi, keyin haqiqiy rasm ustiga yumshoq chiqadi.
export default function Img({ k, size = "sm", alt = "", className = "", priority = false }: Props) {
  const catalog = useCatalog();
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const m = catalog.media[k];
  const src = mediaSrc(catalog, k, size);

  useEffect(() => {
    const el = ref.current;
    setLoaded(!!(el?.complete && el.naturalWidth));
  }, [src]);

  return (
    <span className={`img ${loaded ? "is-loaded" : ""} ${className}`} style={m ? { backgroundImage: `url(${m.lqip})` } : undefined}>
      {src && (
        <img
          ref={ref}
          src={src}
          alt={alt}
          width={m?.w}
          height={m?.h}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
        />
      )}
    </span>
  );
}
