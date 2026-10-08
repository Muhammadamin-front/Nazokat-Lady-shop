"use client";

import { useState } from "react";
import { allPhotos, money, priceOf } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import Img from "../Img";
import Icon from "../Icon";
import { Empty, useAdmin } from "./ui";

export default function Products() {
  const { catalog, save, editProduct, confirm } = useAdmin();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const query = q.trim().toLowerCase();
  const list = catalog.products.filter((p) => (cat === "all" || p.cat === cat) && (!query || p.name.toLowerCase().includes(query)));
  const catName = (id: string) => catalog.categories.find((c) => c.id === id)?.name ?? "—";

  const patch = (id: string, change: Partial<Product>, msg: string) =>
    save({ ...catalog, products: catalog.products.map((p) => (p.id === id ? { ...p, ...change } : p)) }, msg);

  const move = (id: string, dir: -1 | 1) => {
    const arr = [...catalog.products];
    const i = arr.findIndex((p) => p.id === id);
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    save({ ...catalog, products: arr }, "Tartib o'zgardi");
  };

  return (
    <div className="a-products">
      <div className="a-toolbar">
        <label className="a-search">
          <Icon name="search" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tovar nomi" type="search" />
        </label>
        <button className="btn btn--primary" onClick={() => editProduct("new")}>
          <Icon name="plus" /> <span>Yangi tovar</span>
        </button>
      </div>
      <div className="a-chips">
        {[{ id: "all", name: "Hammasi" }, ...catalog.categories].map((c) => (
          <button key={c.id} className={`chip ${cat === c.id ? "is-on" : ""}`} onClick={() => setCat(c.id)}>
            {c.name} <small>{c.id === "all" ? catalog.products.length : catalog.products.filter((p) => p.cat === c.id).length}</small>
          </button>
        ))}
      </div>

      {!list.length ? (
        <Empty
          icon="box"
          title="Tovar topilmadi"
          text="Qidiruvni o'zgartiring yoki yangi tovar qo'shing."
          action={
            <button className="btn btn--primary" onClick={() => editProduct("new")}>
              <Icon name="plus" /> Tovar qo&apos;shish
            </button>
          }
        />
      ) : (
        <ul className="a-prod-list">
          {list.map((p) => {
            const photo = allPhotos(p)[0];
            const custom = p.price && p.price !== catalog.settings.price;
            return (
              <li key={p.id} className={`a-prod ${p.hidden ? "is-hidden" : ""}`}>
                <button className="a-prod__main" onClick={() => editProduct(p.id)}>
                  {photo ? <Img k={photo} className="a-prod__img" /> : <span className="a-prod__img a-prod__img--empty"><Icon name="image" /></span>}
                  <span className="a-prod__info">
                    <b>{p.name}</b>
                    <small>
                      {catName(p.cat)} · {p.colors.length} rang · {allPhotos(p).length} rasm
                    </small>
                    <span className="a-prod__tags">
                      <span className={`a-price ${custom ? "is-custom" : ""}`}>{money(priceOf(catalog, p))}</span>
                      {p.hidden ? (
                        <em className="a-pill a-pill--muted">Yashirin</em>
                      ) : p.soldOut ? (
                        <em className="a-pill a-pill--warn">Tugagan</em>
                      ) : (
                        <em className="a-pill a-pill--ok">Sotuvda</em>
                      )}
                      {p.badge && <em className="a-pill">{p.badge}</em>}
                      {p.featured && <em className="a-pill">Bosh sahifa</em>}
                    </span>
                  </span>
                </button>
                <div className="a-prod__actions">
                  <button
                    className="a-icon-btn"
                    title={p.soldOut ? "Sotuvga qaytarish" : "Tugadi deb belgilash"}
                    aria-label={p.soldOut ? "Sotuvga qaytarish" : "Tugadi deb belgilash"}
                    onClick={() => patch(p.id, { soldOut: !p.soldOut }, p.soldOut ? "Sotuvga qaytdi" : "Tugagan deb belgilandi")}
                  >
                    <Icon name={p.soldOut ? "refresh" : "tag"} />
                  </button>
                  <button
                    className="a-icon-btn"
                    title={p.hidden ? "Saytda ko'rsatish" : "Saytdan yashirish"}
                    aria-label={p.hidden ? "Saytda ko'rsatish" : "Saytdan yashirish"}
                    onClick={() => patch(p.id, { hidden: !p.hidden }, p.hidden ? "Saytda ko'rinadi" : "Saytdan yashirildi")}
                  >
                    <Icon name={p.hidden ? "eyeOff" : "eye"} />
                  </button>
                  <span className="a-move">
                    <button className="a-icon-btn" onClick={() => move(p.id, -1)} aria-label="Yuqoriga">
                      <Icon name="up" />
                    </button>
                    <button className="a-icon-btn" onClick={() => move(p.id, 1)} aria-label="Pastga">
                      <Icon name="down" />
                    </button>
                  </span>
                  <button
                    className="a-icon-btn a-icon-btn--danger"
                    aria-label="O'chirish"
                    onClick={() =>
                      confirm(`"${p.name}" tovarini o'chirasizmi? Bu amalni qaytarib bo'lmaydi.`, () =>
                        save({ ...catalog, products: catalog.products.filter((x) => x.id !== p.id) }, "Tovar o'chirildi")
                      )
                    }
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
