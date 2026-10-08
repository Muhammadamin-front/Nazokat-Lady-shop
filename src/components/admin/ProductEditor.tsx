"use client";

import { useRef, useState } from "react";
import { money, ratingOf } from "@/lib/catalog";
import { CatalogProvider } from "@/lib/catalog-context";
import type { Media, Product } from "@/lib/types";
import Img from "../Img";
import Icon from "../Icon";
import { Field, Segmented, Sheet, Toggle, useAdmin } from "./ui";
import { newKey, processImage } from "./media";

const SIZE_PRESETS = {
  kiyim: ["42–44", "46–48", "50–52", "54–56"],
  harf: ["S", "M", "L", "XL"],
};

const blank = (cat: string): Product => ({
  id: newKey("p"),
  cat,
  name: "",
  desc: "",
  colors: [{ name: "Asosiy", hex: "#b08a7a", photos: [] }],
  sizes: [],
});

export default function ProductEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const { catalog, save, toast, confirm } = useAdmin();
  const isNew = id === "new";
  const [p, setP] = useState<Product>(() => structuredClone(catalog.products.find((x) => x.id === id) ?? blank(catalog.categories[0]?.id ?? "")));
  const [media, setMedia] = useState<Record<string, Media>>({}); // shu oynada yangi yuklangan rasmlar
  const [busy, setBusy] = useState<number | null>(null);
  const [sizeInput, setSizeInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const view = { ...catalog, media: { ...catalog.media, ...media } };
  const customPrice = !!p.price && p.price > 0;

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));
  const setColor = (i: number, change: Partial<Product["colors"][number]>) =>
    setP((x) => ({ ...x, colors: x.colors.map((c, j) => (j === i ? { ...c, ...change } : c)) }));

  const addPhotos = async (ci: number, files: FileList | null) => {
    if (!files?.length) return;
    setBusy(ci);
    const added: Record<string, Media> = {};
    const keys: string[] = [];
    for (const f of Array.from(files).slice(0, 8)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 20 * 1048576) {
        toast(`${f.name}: 20 MB dan katta`, "err");
        continue;
      }
      try {
        const k = newKey("img");
        added[k] = await processImage(f);
        keys.push(k);
      } catch {
        toast(`${f.name}: rasmni o'qib bo'lmadi`, "err");
      }
    }
    setMedia((m) => ({ ...m, ...added }));
    setP((x) => ({ ...x, colors: x.colors.map((c, j) => (j === ci ? { ...c, photos: [...c.photos, ...keys] } : c)) }));
    setBusy(null);
  };

  const movePhoto = (ci: number, pi: number, dir: -1 | 1) => {
    const photos = [...p.colors[ci].photos];
    const j = pi + dir;
    if (j < 0 || j >= photos.length) return;
    [photos[pi], photos[j]] = [photos[j], photos[pi]];
    setColor(ci, { photos });
  };

  const submit = () => {
    const errs: string[] = [];
    if (p.name.trim().length < 2) errs.push("Tovar nomini yozing");
    if (!p.colors.length || !p.colors.some((c) => c.photos.length)) errs.push("Kamida bitta rasm qo'shing");
    if (p.colors.some((c) => !c.name.trim())) errs.push("Har bir rangga nom bering");
    if (customPrice && (p.price! < 1000 || p.price! > 100_000_000)) errs.push("Narxni tekshiring");
    setErrors(errs);
    if (errs.length) return;
    const clean: Product = { ...p, name: p.name.trim(), desc: p.desc.trim(), price: customPrice ? p.price : undefined };
    // Ishlatilmay qolgan yangi rasmlarni saqlamaymiz
    const used = new Set(clean.colors.flatMap((c) => c.photos));
    const newMedia = Object.fromEntries(Object.entries(media).filter(([k]) => used.has(k)));
    const products = isNew ? [clean, ...catalog.products] : catalog.products.map((x) => (x.id === clean.id ? clean : x));
    if (save({ ...catalog, products, media: { ...catalog.media, ...newMedia } }, isNew ? "Tovar qo'shildi" : "O'zgarishlar saqlandi")) onClose();
  };

  return (
    <Sheet
      title={isNew ? "Yangi tovar" : "Tovarni tahrirlash"}
      onClose={onClose}
      footer={
        <>
          {errors.length > 0 && <p className="a-form-err">{errors.join(" · ")}</p>}
          <div className="a-foot-row">
            {!isNew && (
              <button
                className="a-icon-btn a-icon-btn--danger"
                aria-label="O'chirish"
                onClick={() =>
                  confirm(`"${p.name}" tovarini o'chirasizmi?`, () => {
                    save({ ...catalog, products: catalog.products.filter((x) => x.id !== p.id) }, "Tovar o'chirildi");
                    onClose();
                  })
                }
              >
                <Icon name="trash" />
              </button>
            )}
            <button className="btn btn--ghost" onClick={onClose}>
              Bekor qilish
            </button>
            <button className="btn btn--primary" onClick={submit}>
              <Icon name="check" /> Saqlash
            </button>
          </div>
        </>
      }
    >
      {/* Yangi (hali saqlanmagan) rasmlar ham <Img/> da ko'rinishi uchun vaqtinchalik katalog */}
      <CatalogProvider catalog={view}>
      <div className="a-editor">
        <section className="a-block">
          <h3>Rasmlar va ranglar</h3>
          <p className="a-block__hint">Har bir rang uchun rasm yuklang. Birinchi rasm — asosiy. Rasm telefoningizda avtomatik siqiladi.</p>
          {p.colors.map((c, ci) => (
            <div className="a-color" key={ci}>
              <div className="a-color__head">
                <label className="a-swatch-pick" title="Rangni tanlash">
                  <input type="color" value={c.hex} onChange={(e) => setColor(ci, { hex: e.target.value })} aria-label="Rang kodi" />
                  <i style={{ background: c.hex }} />
                </label>
                <input className="a-input" value={c.name} onChange={(e) => setColor(ci, { name: e.target.value })} placeholder="Rang nomi, masalan: Qora" />
                {p.colors.length > 1 && (
                  <button className="a-icon-btn a-icon-btn--danger" onClick={() => set("colors", p.colors.filter((_, j) => j !== ci))} aria-label="Rangni o'chirish">
                    <Icon name="trash" />
                  </button>
                )}
              </div>
              <div className="a-photos">
                {c.photos.map((k, pi) => (
                  <div className="a-photo" key={k}>
                    <Img k={k} />
                    {pi === 0 && <em>Asosiy</em>}
                    <div className="a-photo__tools">
                      <button onClick={() => movePhoto(ci, pi, -1)} aria-label="Chapga" disabled={pi === 0}>
                        <Icon name="left" />
                      </button>
                      <button onClick={() => setColor(ci, { photos: c.photos.filter((x) => x !== k) })} aria-label="Rasmni olib tashlash">
                        <Icon name="close" />
                      </button>
                      <button onClick={() => movePhoto(ci, pi, 1)} aria-label="O'ngga" disabled={pi === c.photos.length - 1}>
                        <Icon name="right" />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="a-photo a-photo--add" onClick={() => fileRefs.current[ci]?.click()} disabled={busy === ci}>
                  {busy === ci ? <span className="spinner spinner--dark" /> : <Icon name="upload" />}
                  <span>{busy === ci ? "Siqilmoqda…" : "Rasm qo'shish"}</span>
                </button>
                <input
                  ref={(el) => {
                    fileRefs.current[ci] = el;
                  }}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    addPhotos(ci, e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          ))}
          <button className="a-add-row" onClick={() => set("colors", [...p.colors, { name: "", hex: "#cccccc", photos: [] }])}>
            <Icon name="plus" /> Rang qo&apos;shish
          </button>
        </section>

        <section className="a-block">
          <h3>Asosiy ma&apos;lumot</h3>
          <Field label="Nomi">
            <input className="a-input" value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Masalan: Uzun sport kardigan" maxLength={80} />
          </Field>
          <Field label="Kategoriya">
            <select className="a-input" value={p.cat} onChange={(e) => set("cat", e.target.value)}>
              {catalog.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tavsif" hint={`${p.desc.length}/400`}>
            <textarea className="a-input" rows={3} value={p.desc} onChange={(e) => set("desc", e.target.value.slice(0, 400))} placeholder="Mato, bichim, nima bilan kiyiladi…" />
          </Field>
        </section>

        <section className="a-block">
          <h3>Narx</h3>
          <Segmented
            value={customPrice ? "custom" : "base"}
            options={[
              { v: "base", label: `Umumiy · ${money(catalog.settings.price)}` },
              { v: "custom", label: "Maxsus narx" },
            ]}
            onChange={(v) => set("price", v === "custom" ? catalog.settings.price + 10000 : undefined)}
          />
          {customPrice && (
            <Field label="Narx (so'm)" hint={money(p.price ?? 0)}>
              <input
                className="a-input"
                inputMode="numeric"
                value={p.price ?? ""}
                onChange={(e) => set("price", Number(e.target.value.replace(/\D/g, "")) || 0)}
              />
            </Field>
          )}
        </section>

        <section className="a-block">
          <h3>O&apos;lchamlar</h3>
          <div className="a-sizes">
            {p.sizes.map((s) => (
              <span className="a-size" key={s}>
                {s}
                <button onClick={() => set("sizes", p.sizes.filter((x) => x !== s))} aria-label={`${s} ni olib tashlash`}>
                  <Icon name="close" />
                </button>
              </span>
            ))}
            {!p.sizes.length && <span className="muted">O&apos;lchamsiz (masalan, sumka)</span>}
          </div>
          <form
            className="a-inline-add"
            onSubmit={(e) => {
              e.preventDefault();
              const v = sizeInput.trim();
              if (v && !p.sizes.includes(v)) set("sizes", [...p.sizes, v]);
              setSizeInput("");
            }}
          >
            <input className="a-input" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} placeholder="Yangi o'lcham, masalan 58–60" />
            <button className="btn btn--ghost" type="submit">
              Qo&apos;shish
            </button>
          </form>
          <div className="a-presets">
            <button onClick={() => set("sizes", SIZE_PRESETS.kiyim)}>42–56</button>
            <button onClick={() => set("sizes", SIZE_PRESETS.harf)}>S–XL</button>
            <button onClick={() => set("sizes", [])}>O&apos;lchamsiz</button>
          </div>
        </section>

        <section className="a-block">
          <h3>Reyting</h3>
          <p className="a-block__hint">
            Demo: bo&apos;sh qoldirsangiz avtomatik ({ratingOf({ ...p, rating: undefined, reviews: undefined }).rating} ★,{" "}
            {ratingOf({ ...p, rating: undefined, reviews: undefined }).reviews} baho). Haqiqiy saytda mijozlar baholaridan hisoblanadi.
          </p>
          <div className="a-grid2">
            <Field label="Yulduz (1–5)">
              <input
                className="a-input"
                inputMode="decimal"
                value={p.rating ?? ""}
                placeholder="avtomatik"
                onChange={(e) => {
                  const v = parseFloat(e.target.value.replace(",", "."));
                  set("rating", Number.isFinite(v) ? Math.min(5, Math.max(1, Math.round(v * 10) / 10)) : undefined);
                }}
              />
            </Field>
            <Field label="Baholar soni">
              <input
                className="a-input"
                inputMode="numeric"
                value={p.reviews ?? ""}
                placeholder="avtomatik"
                onChange={(e) => set("reviews", Number(e.target.value.replace(/\D/g, "")) || undefined)}
              />
            </Field>
          </div>
        </section>

        <section className="a-block">
          <h3>Holat va belgilar</h3>
          <Segmented
            value={p.badge ?? "none"}
            options={[
              { v: "none", label: "Belgisiz" },
              { v: "Xit", label: "Xit" },
              { v: "Yangi", label: "Yangi" },
            ]}
            onChange={(v) => set("badge", v === "none" ? undefined : (v as Product["badge"]))}
          />
          <Toggle on={!p.soldOut} onChange={(v) => set("soldOut", !v)} label="Sotuvda bor" hint="O'chirsangiz — saytda “Tugagan” deb chiqadi" />
          <Toggle on={!p.hidden} onChange={(v) => set("hidden", !v)} label="Saytda ko'rinadi" hint="Vaqtincha yashirish uchun o'chiring" />
          <Toggle on={!!p.featured} onChange={(v) => set("featured", v)} label="Bosh sahifadagi katta carousel'da" />
        </section>
      </div>
      </CatalogProvider>
    </Sheet>
  );
}
