"use client";

import { useMemo } from "react";
import { money, priceOf, showcaseItems } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useUI } from "@/lib/ui";
import { FeatureCarousel } from "./ui/feature-carousel";
import Icon from "./Icon";

// Vitrina: admin sozlamalaridagi kategoriya mahsulotlari 3D carousel'da
export default function BagShowcase() {
  const catalog = useCatalog();
  const { openProduct } = useUI();
  const items = useMemo(() => showcaseItems(catalog), [catalog]);
  const { title, subtitle } = catalog.settings.showcase;
  if (items.length < 3) return null;
  const open = (i: number) => openProduct(items[i].p.id, items[i].color);
  const [first, ...rest] = title.split(" ");

  return (
    <section className="section">
      <FeatureCarousel
        key={items.length}
        title={
          <>
            {first} <em>{rest[0]}</em> {rest.slice(1).join(" ")}
          </>
        }
        subtitle={`${subtitle} Har biri ${money(catalog.settings.price)}.`}
        images={items.map(({ k, alt }) => ({ k, alt }))}
        onOpen={open}
        caption={(i) => (
          <button className="fc__pick" onClick={() => open(i)}>
            <span>
              <b>{items[i].p.name}</b>
              <small>
                {items[i].p.colors[items[i].color].name} · {money(priceOf(catalog, items[i].p))}
              </small>
            </span>
            <span className="fc__pick-go">
              Ko&apos;rish <Icon name="arrow" />
            </span>
          </button>
        )}
      />
    </section>
  );
}
