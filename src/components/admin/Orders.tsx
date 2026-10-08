"use client";

import { useState } from "react";
import { money } from "@/lib/catalog";
import type { Order, OrderStatus } from "@/lib/types";
import Icon from "../Icon";
import { Empty, fmtPhone, timeAgo, useAdmin } from "./ui";

export const STATUS: Record<OrderStatus, { label: string; next?: OrderStatus; action?: string }> = {
  new: { label: "Yangi", next: "confirmed", action: "Tasdiqlash" },
  confirmed: { label: "Tasdiqlangan", next: "delivered", action: "Yetkazildi" },
  delivered: { label: "Yetkazildi" },
  cancelled: { label: "Bekor qilingan" },
};

const FILTERS: { v: "all" | OrderStatus; label: string }[] = [
  { v: "all", label: "Hammasi" },
  { v: "new", label: "Yangi" },
  { v: "confirmed", label: "Tasdiqlangan" },
  { v: "delivered", label: "Yetkazildi" },
  { v: "cancelled", label: "Bekor" },
];

export default function Orders() {
  const { orders, setOrders, toast, confirm } = useAdmin();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(orders.find((o) => o.status === "new")?.id ?? null);

  const query = q.trim().toLowerCase();
  const list = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (!query || o.customer.name.toLowerCase().includes(query) || o.customer.phone.includes(query.replace(/\D/g, "") || "~") || o.id.toLowerCase().includes(query))
  );

  const setStatus = (o: Order, status: OrderStatus) => {
    setOrders(orders.map((x) => (x.id === o.id ? { ...x, status } : x)));
    toast(`#${o.id} — ${STATUS[status].label.toLowerCase()}`);
  };

  return (
    <div className="a-orders">
      <div className="a-toolbar">
        <label className="a-search">
          <Icon name="search" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ism, telefon yoki raqam" type="search" />
        </label>
      </div>
      <div className="a-chips">
        {FILTERS.map((f) => {
          const n = f.v === "all" ? orders.length : orders.filter((o) => o.status === f.v).length;
          return (
            <button key={f.v} className={`chip ${filter === f.v ? "is-on" : ""}`} onClick={() => setFilter(f.v)}>
              {f.label} <small>{n}</small>
            </button>
          );
        })}
      </div>

      {!list.length ? (
        <Empty icon="receipt" title="Buyurtma topilmadi" text="Filtr yoki qidiruvni o'zgartirib ko'ring." />
      ) : (
        <ul className="a-order-list">
          {list.map((o) => {
            const isOpen = open === o.id;
            const st = STATUS[o.status];
            return (
              <li key={o.id} className={`a-order ${isOpen ? "is-open" : ""} a-order--${o.status}`}>
                <button className="a-order__head" onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen}>
                  <span className={`a-dot a-dot--${o.status}`} />
                  <span className="a-order__who">
                    <b>{o.customer.name}</b>
                    <small>
                      #{o.id} · {timeAgo(o.createdAt)}
                      {o.demo && <em className="a-tag">Demo</em>}
                    </small>
                  </span>
                  <span className="a-order__sum">
                    <b>{money(o.total)}</b>
                    <small className={`a-status a-status--${o.status}`}>{st.label}</small>
                  </span>
                  <Icon name="down" className="a-order__chev" />
                </button>

                {isOpen && (
                  <div className="a-order__body">
                    <div className="a-order__contact">
                      <a className="a-call" href={`tel:+998${o.customer.phone}`}>
                        <Icon name="phone" /> {fmtPhone(o.customer.phone)}
                      </a>
                      <span>
                        <Icon name="pin" /> {o.customer.address}
                      </span>
                      {o.customer.note && (
                        <span className="a-note">
                          <Icon name="chat" /> {o.customer.note}
                        </span>
                      )}
                    </div>
                    <ul className="a-order__items">
                      {o.items.map((it, i) => (
                        <li key={i}>
                          <span>
                            <b>{it.name}</b>
                            <small>{[it.color, it.size].filter(Boolean).join(" · ")}</small>
                          </span>
                          <span>
                            {it.qty} × {money(it.price)}
                          </span>
                        </li>
                      ))}
                      <li className="a-order__total">
                        <span>Jami ({o.count} ta)</span>
                        <b>{money(o.total)}</b>
                      </li>
                    </ul>
                    <div className="a-order__meta">
                      <Icon name="send" />
                      {o.telegram === "sent" ? "Telegram'ga yuborilgan" : o.telegram === "failed" ? "Telegram xatosi" : "Instagram orqali"} ·{" "}
                      {new Date(o.createdAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                    <div className="a-order__actions">
                      {st.next && (
                        <button className="btn btn--primary" onClick={() => setStatus(o, st.next!)}>
                          <Icon name="check" /> {st.action}
                        </button>
                      )}
                      {o.status !== "cancelled" && o.status !== "delivered" && (
                        <button className="btn btn--ghost" onClick={() => confirm(`#${o.id} buyurtmani bekor qilasizmi?`, () => setStatus(o, "cancelled"), "Bekor qilish")}>
                          Bekor qilish
                        </button>
                      )}
                      {(o.status === "cancelled" || o.status === "delivered") && (
                        <button className="btn btn--ghost" onClick={() => setStatus(o, "new")}>
                          <Icon name="refresh" /> Qayta ochish
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
