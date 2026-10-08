"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/catalog";
import { resetCatalog, saveOrders, storageUsage } from "@/lib/demo-store";
import type { Category, Settings } from "@/lib/types";
import Icon from "../Icon";
import { Field, Toggle, useAdmin } from "./ui";
import { fmtBytes, newKey } from "./media";

const QUOTA = 5 * 1048576;

export default function SettingsView() {
  const { catalog, save, confirm, toast } = useAdmin();
  const [s, setS] = useState<Settings>(catalog.settings);
  const [cats, setCats] = useState<Category[]>(catalog.categories);
  const [usage, setUsage] = useState(0);
  const dirty = JSON.stringify(s) !== JSON.stringify(catalog.settings) || JSON.stringify(cats) !== JSON.stringify(catalog.categories);

  useEffect(() => {
    setS(catalog.settings);
    setCats(catalog.categories);
    setUsage(storageUsage());
  }, [catalog]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((x) => ({ ...x, [k]: v }));
  const count = (id: string) => catalog.products.filter((p) => p.cat === id).length;
  const customCount = catalog.products.filter((p) => p.price && p.price !== catalog.settings.price).length;

  const submit = () => {
    if (!(s.price >= 1000)) return toast("Narxni tekshiring", "err");
    if (cats.some((c) => !c.name.trim())) return toast("Kategoriya nomi bo'sh bo'lmasin", "err");
    save({ ...catalog, settings: { ...s, marquee: s.marquee.map((m) => m.trim()).filter(Boolean) }, categories: cats.map((c) => ({ ...c, name: c.name.trim() })) });
  };

  const moveCat = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= cats.length) return;
    const arr = [...cats];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setCats(arr);
  };

  return (
    <div className="a-settings">
      <section className="a-card a-price-card">
        <h3>Umumiy narx</h3>
        <p className="a-block__hint">Saytdagi “Hammasi … so&apos;m” va maxsus narxi bo&apos;lmagan barcha tovarlar shu narxda.</p>
        <div className="a-price-input">
          <input inputMode="numeric" value={s.price || ""} onChange={(e) => set("price", Number(e.target.value.replace(/\D/g, "")) || 0)} aria-label="Umumiy narx" />
          <span>so&apos;m</span>
        </div>
        <div className="a-price-preview">
          Saytda: <b>Hammasi {money(s.price || 0)}</b>
        </div>
        {customCount > 0 && <small className="muted">{customCount} ta tovarda maxsus narx bor — ular o&apos;zgarmaydi.</small>}
      </section>

      <section className="a-card">
        <h3>Do&apos;kon ma&apos;lumotlari</h3>
        <div className="a-grid2">
          <Field label="Do'kon nomi">
            <input className="a-input" value={s.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Shahar">
            <input className="a-input" value={s.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Instagram" hint="@ belgisisiz">
            <input className="a-input" value={s.instagram} onChange={(e) => set("instagram", e.target.value.replace(/^@/, ""))} />
          </Field>
          <Field label="Telefon" hint="Aloqa sahifasida chiqadi">
            <input className="a-input" value={s.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+998 90 123 45 67" inputMode="tel" />
          </Field>
          <Field label="Telegram (mijozlar uchun)" hint="@ belgisisiz, ixtiyoriy">
            <input className="a-input" value={s.telegram} onChange={(e) => set("telegram", e.target.value.replace(/^@/, ""))} />
          </Field>
        </div>
      </section>

      <section className="a-card">
        <h3>Kategoriyalar</h3>
        <ul className="a-cat-list">
          {cats.map((c, i) => (
            <li key={c.id}>
              <input className="a-input" value={c.name} onChange={(e) => setCats(cats.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))} />
              <small>{count(c.id)} ta</small>
              <button className="a-icon-btn" onClick={() => moveCat(i, -1)} aria-label="Yuqoriga" disabled={i === 0}>
                <Icon name="up" />
              </button>
              <button className="a-icon-btn" onClick={() => moveCat(i, 1)} aria-label="Pastga" disabled={i === cats.length - 1}>
                <Icon name="down" />
              </button>
              <button
                className="a-icon-btn a-icon-btn--danger"
                aria-label="O'chirish"
                disabled={count(c.id) > 0}
                title={count(c.id) ? "Avval tovarlarni boshqa kategoriyaga o'tkazing" : "O'chirish"}
                onClick={() => setCats(cats.filter((x) => x.id !== c.id))}
              >
                <Icon name="trash" />
              </button>
            </li>
          ))}
        </ul>
        <button className="a-add-row" onClick={() => setCats([...cats, { id: newKey("c"), name: "" }])}>
          <Icon name="plus" /> Kategoriya qo&apos;shish
        </button>
      </section>

      <section className="a-card">
        <h3>Yuguruvchi lenta</h3>
        <p className="a-block__hint">Bosh sahifadagi bordo lentada aylanib turadigan qisqa gaplar.</p>
        {s.marquee.map((m, i) => (
          <div className="a-inline-add" key={i}>
            <input className="a-input" value={m} onChange={(e) => set("marquee", s.marquee.map((x, j) => (j === i ? e.target.value : x)))} maxLength={60} />
            <button className="a-icon-btn a-icon-btn--danger" onClick={() => set("marquee", s.marquee.filter((_, j) => j !== i))} aria-label="O'chirish">
              <Icon name="trash" />
            </button>
          </div>
        ))}
        {s.marquee.length < 8 && (
          <button className="a-add-row" onClick={() => set("marquee", [...s.marquee, ""])}>
            <Icon name="plus" /> Gap qo&apos;shish
          </button>
        )}
      </section>

      <section className="a-card">
        <h3>3D vitrina</h3>
        <p className="a-block__hint">Bosh sahifadagi aylanuvchi 3D carousel qaysi kategoriyani ko&apos;rsatadi.</p>
        <div className="a-grid2">
          <Field label="Sarlavha" hint="Ikkinchi so'z rangli bo'ladi">
            <input className="a-input" value={s.showcase.title} onChange={(e) => set("showcase", { ...s.showcase, title: e.target.value })} />
          </Field>
          <Field label="Kategoriya">
            <select className="a-input" value={s.showcase.category} onChange={(e) => set("showcase", { ...s.showcase, category: e.target.value })}>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || "—"}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Qisqa matn">
          <input className="a-input" value={s.showcase.subtitle} onChange={(e) => set("showcase", { ...s.showcase, subtitle: e.target.value })} />
        </Field>
      </section>

      <section className="a-card">
        <h3>Reytinglar</h3>
        <Toggle
          on={s.showRatings !== false}
          onChange={(v) => set("showRatings", v)}
          label="Tovarlarda yulduz va baholar sonini ko'rsatish"
          hint="Demo raqamlar. Haqiqiy mijozlarga ochishdan oldin o'chiring yoki haqiqiy baholarni ulang — soxta sharhlar xaridorni chalg'itadi."
        />
      </section>

      <section className="a-card">
        <h3>Telegram bildirishnomalar</h3>
        <div className="a-info-row">
          <Icon name="send" />
          <p>
            Har bir yangi buyurtma darhol Telegram botga yuboriladi. Bot tokeni xavfsizlik uchun server sozlamasida (<code>.env.local</code>) turadi va bu yerda
            ko&apos;rsatilmaydi.
          </p>
        </div>
      </section>

      <section className="a-card">
        <h3>Demo ma&apos;lumotlar</h3>
        <p className="a-block__hint">Demo rejimda o&apos;zgarishlar shu brauzerda saqlanadi.</p>
        <div className="a-meter" title={`${fmtBytes(usage)} / ${fmtBytes(QUOTA)}`}>
          <i style={{ width: `${Math.min(100, (usage / QUOTA) * 100)}%` }} />
        </div>
        <small className="muted">
          Ishlatilgan: {fmtBytes(usage)} / ~{fmtBytes(QUOTA)}
        </small>
        <button
          className="btn btn--ghost a-reset"
          onClick={() =>
            confirm(
              "Barcha o'zgarishlar o'chib, demo boshlang'ich holatga qaytadi. Davom etasizmi?",
              () => {
                resetCatalog();
                saveOrders([]);
                location.reload();
              },
              "Tiklash"
            )
          }
        >
          <Icon name="refresh" /> Demo&apos;ni boshlang&apos;ich holatga qaytarish
        </button>
      </section>

      {dirty && (
        <div className="a-savebar">
          <span>Saqlanmagan o&apos;zgarishlar</span>
          <button
            className="btn btn--ghost"
            onClick={() => {
              setS(catalog.settings);
              setCats(catalog.categories);
            }}
          >
            Bekor
          </button>
          <button className="btn btn--primary" onClick={submit}>
            Saqlash
          </button>
        </div>
      )}
    </div>
  );
}
