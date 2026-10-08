"use client";

import { allPhotos, money } from "@/lib/catalog";
import Img from "../Img";
import Icon from "../Icon";
import { timeAgo, useAdmin } from "./ui";
import { STATUS } from "./Orders";

export default function Dashboard() {
  const { catalog, orders, go, editProduct, editReel } = useAdmin();
  const live = orders.filter((o) => o.status !== "cancelled");
  const today = new Date().toDateString();
  const todays = live.filter((o) => new Date(o.createdAt).toDateString() === today);
  const week = live.filter((o) => Date.now() - new Date(o.createdAt).getTime() < 7 * 86400_000);
  const fresh = orders.filter((o) => o.status === "new");
  const onSale = catalog.products.filter((p) => !p.hidden && !p.soldOut).length;
  const soldOut = catalog.products.filter((p) => p.soldOut).length;
  const hidden = catalog.products.filter((p) => p.hidden).length;

  const sold = new Map<string, { name: string; qty: number }>();
  for (const o of live) for (const it of o.items) sold.set(it.id, { name: it.name, qty: (sold.get(it.id)?.qty ?? 0) + it.qty });
  const top = [...sold.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);
  const maxQty = top[0]?.[1].qty ?? 1;

  const hello = new Date().getHours() < 12 ? "Xayrli tong" : new Date().getHours() < 18 ? "Xayrli kun" : "Xayrli kech";

  return (
    <div className="a-dash">
      <section className="a-hello">
        <h2>{hello}! 👋</h2>
        <p>
          {fresh.length ? (
            <>
              Sizni <b>{fresh.length} ta yangi buyurtma</b> kutmoqda.
            </>
          ) : (
            "Yangi buyurtmalar yo'q — hammasi joyida."
          )}
        </p>
        {fresh.length > 0 && (
          <button className="btn btn--primary" onClick={() => go("orders")}>
            Buyurtmalarni ko&apos;rish <Icon name="arrow" />
          </button>
        )}
      </section>

      <section className="a-stats">
        <button className="a-stat" onClick={() => go("orders")}>
          <small>Bugun</small>
          <b>{todays.length} ta</b>
          <span>{money(todays.reduce((s, o) => s + o.total, 0))}</span>
        </button>
        <button className="a-stat a-stat--accent" onClick={() => go("orders")}>
          <small>Yangi buyurtma</small>
          <b>{fresh.length}</b>
          <span>javob kutmoqda</span>
        </button>
        <div className="a-stat">
          <small>7 kunlik tushum</small>
          <b>{money(week.reduce((s, o) => s + o.total, 0))}</b>
          <span>{week.length} ta buyurtma</span>
        </div>
        <button className="a-stat" onClick={() => go("products")}>
          <small>Tovarlar</small>
          <b>{onSale} sotuvda</b>
          <span>
            {soldOut} tugagan · {hidden} yashirin
          </span>
        </button>
      </section>

      <section className="a-card">
        <h3>Tezkor amallar</h3>
        <div className="a-quick">
          <button onClick={() => editProduct("new")}>
            <Icon name="plus" /> Tovar qo&apos;shish
          </button>
          <button onClick={() => editReel("new")}>
            <Icon name="reels" /> Video qo&apos;shish
          </button>
          <button onClick={() => go("settings")}>
            <Icon name="tag" /> Narxni o&apos;zgartirish
          </button>
          <a href="/" target="_blank" rel="noopener">
            <Icon name="external" /> Saytni ko&apos;rish
          </a>
        </div>
      </section>

      <div className="a-cols">
        <section className="a-card">
          <div className="a-card__head">
            <h3>So&apos;nggi buyurtmalar</h3>
            <button className="link" onClick={() => go("orders")}>
              Hammasi <Icon name="right" />
            </button>
          </div>
          <ul className="a-mini-list">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id}>
                <span className={`a-dot a-dot--${o.status}`} />
                <div>
                  <b>
                    {o.customer.name} · #{o.id}
                  </b>
                  <small>
                    {o.count} ta · {timeAgo(o.createdAt)}
                  </small>
                </div>
                <span className="a-mini-list__right">
                  <b>{money(o.total)}</b>
                  <small>{STATUS[o.status].label}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="a-card">
          <div className="a-card__head">
            <h3>Eng ko&apos;p sotilgan</h3>
          </div>
          {top.length ? (
            <ul className="a-top-list">
              {top.map(([id, t]) => {
                const p = catalog.products.find((x) => x.id === id);
                const photo = p ? allPhotos(p)[0] : undefined;
                return (
                  <li key={id}>
                    {photo ? <Img k={photo} className="a-thumb" /> : <span className="a-thumb" />}
                    <div>
                      <b>{t.name}</b>
                      <span className="a-bar">
                        <i style={{ width: `${(t.qty / maxQty) * 100}%` }} />
                      </span>
                    </div>
                    <small>{t.qty} ta</small>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">Hali sotuv yo&apos;q.</p>
          )}
        </section>
      </div>
    </div>
  );
}
