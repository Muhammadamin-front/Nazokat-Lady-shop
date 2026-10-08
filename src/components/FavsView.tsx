"use client";

import { useCatalog } from "@/lib/catalog-context";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import ProductCard from "./ProductCard";
import Icon from "./Icon";

export default function FavsView() {
  const { state } = useStore();
  const { go } = useUI();
  const list = useCatalog().products.filter((p) => state.favs.includes(p.id));

  if (!list.length) {
    return (
      <div className="empty">
        <Icon name="heart" className="ico--xl" />
        <h2>Sevimlilar bo&apos;sh</h2>
        <p>Yoqqan mahsulotdagi yurakcha tugmasini bosing — u shu yerda saqlanadi.</p>
        <button className="btn btn--primary" onClick={() => go("home")}>
          Mahsulotlarni ko&apos;rish
        </button>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="section__head">
        <h2>Sevimlilar</h2>
        <span className="muted">{list.length} ta</span>
      </div>
      <div className="grid">
        {list.map((p, i) => (
          <ProductCard key={p.id} p={p} index={i} />
        ))}
      </div>
    </section>
  );
}
