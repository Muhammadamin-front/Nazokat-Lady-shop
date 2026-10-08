"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Catalog, Order } from "@/lib/types";
import Icon from "../Icon";

export type View = "dash" | "orders" | "products" | "videos" | "settings";

export type Admin = {
  catalog: Catalog;
  save: (next: Catalog, msg?: string) => boolean;
  orders: Order[];
  setOrders: (list: Order[]) => void;
  toast: (msg: string, kind?: "ok" | "err") => void;
  confirm: (text: string, onYes: () => void, danger?: string) => void;
  go: (v: View) => void;
  editProduct: (id: string | "new") => void;
  editReel: (id: string | "new") => void;
};

export const AdminCtx = createContext<Admin | null>(null);
export function useAdmin() {
  const v = useContext(AdminCtx);
  if (!v) throw new Error("useAdmin outside AdminCtx");
  return v;
}

export function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="a-toggle">
      <span>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden="true" />
    </label>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="a-field">
      <span className="a-field__label">{label}</span>
      {children}
      {hint && <small className="a-field__hint">{hint}</small>}
    </label>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="a-seg" role="radiogroup">
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} className={value === o.v ? "is-on" : ""} onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// To'liq ekranli (telefonda) / markaziy (desktopda) tahrirlash oynasi
export function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    document.body.classList.add("lock");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      document.body.classList.remove("lock");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return (
    <div className={`a-sheet ${open ? "is-open" : ""}`}>
      <div className="a-sheet__bg" onClick={onClose} />
      <div className="a-sheet__panel" role="dialog" aria-modal="true" aria-label={title}>
        <header className="a-sheet__head">
          <button className="a-icon-btn" onClick={onClose} aria-label="Yopish">
            <Icon name="close" />
          </button>
          <h2>{title}</h2>
        </header>
        <div className="a-sheet__body">{children}</div>
        {footer && <footer className="a-sheet__foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon: Parameters<typeof Icon>[0]["name"]; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="a-empty">
      <Icon name={icon} className="ico--xl" />
      <b>{title}</b>
      <p>{text}</p>
      {action}
    </div>
  );
}

export const timeAgo = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "hozirgina";
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.round(h / 24);
  return d === 1 ? "kecha" : `${d} kun oldin`;
};

export const fmtPhone = (d: string) => `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
