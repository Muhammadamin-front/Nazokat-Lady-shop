"use client";

import { allPhotos, igUrl } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import Img from "./Img";
import Icon from "./Icon";
import Flower from "./Flower";

export default function InstaCta() {
  const catalog = useCatalog();
  const SHOP = catalog.settings;
  const GRID = catalog.products.map((p) => allPhotos(p)[0]).filter(Boolean).slice(0, 6);
  return (
    <section className="section insta">
      <div className="insta__grid" aria-hidden="true">
        {GRID.map((k) => (
          <Img key={k} k={k} />
        ))}
      </div>
      <div className="insta__body">
        <span className="insta__avatar">
          <Flower />
        </span>
        <h2>Yangi tovarlarni birinchi bo&apos;lib ko&apos;ring</h2>
        <p>Yangi rasmlar va videolar birinchi bo'lib @{SHOP.instagram} sahifasida chiqadi.</p>
        <a className="btn btn--insta" href={igUrl(SHOP)} target="_blank" rel="noopener">
          <Icon name="insta" /> Instagramga obuna bo&apos;lish
        </a>
      </div>
      <footer className="foot">
        © {new Date().getFullYear()} {SHOP.name} · {SHOP.city}
      </footer>
    </section>
  );
}
