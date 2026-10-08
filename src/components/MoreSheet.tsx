"use client";

import { useEffect, useState } from "react";
import { igDm } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useUI } from "@/lib/ui";
import Icon, { type IconName } from "./Icon";
import Flower from "./Flower";

// "Boshqa" menyusi: Aloqa, Admin panel va boshqalar — pastdan chiqadigan qisqa ro'yxat
export default function MoreSheet({ onClose }: { onClose: () => void }) {
  const { go, toast } = useUI();
  const SHOP = useCatalog().settings;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const share = async () => {
    const url = location.origin + location.pathname;
    try {
      if (navigator.share) await navigator.share({ title: SHOP.name, text: `${SHOP.name} — ${SHOP.city}`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Havola nusxalandi");
      }
    } catch {}
    onClose();
  };

  const Row = ({ icon, title, sub, onClick, href }: { icon: IconName; title: string; sub: string; onClick?: () => void; href?: string }) => {
    const inner = (
      <>
        <span className="more__ico">
          <Icon name={icon} />
        </span>
        <span className="more__txt">
          <b>{title}</b>
          <small>{sub}</small>
        </span>
        <Icon name="right" className="more__go" />
      </>
    );
    return href ? (
      <a className="more__row" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" onClick={onClose}>
        {inner}
      </a>
    ) : (
      <button className="more__row" onClick={onClick}>
        {inner}
      </button>
    );
  };

  return (
    <div className={`modal more ${open ? "is-open" : ""}`}>
      <div className="modal__bg" onClick={onClose} />
      <div className="more__panel" role="dialog" aria-modal="true" aria-label="Boshqa">
        <div className="more__grab" aria-hidden="true" />
        <div className="more__head">
          <span className="more__logo">
            <Flower />
          </span>
          <div>
            <b>{SHOP.name}</b>
            <small>{SHOP.city} · @{SHOP.instagram}</small>
          </div>
        </div>
        <Row
          icon="pin"
          title="Aloqa"
          sub="Manzil, Instagram, savollar"
          onClick={() => {
            onClose();
            go("info");
          }}
        />
        <Row icon="insta" title="Instagramda yozish" sub={`@${SHOP.instagram}`} href={igDm(SHOP)} />
        <Row icon="share" title="Saytni ulashish" sub="Do'stlaringizga yuboring" onClick={share} />
        <div className="more__sep" />
        <Row icon="shield" title="Admin panel" sub="Tovarlar, buyurtmalar, videolar" href="/admin" />
      </div>
    </div>
  );
}
