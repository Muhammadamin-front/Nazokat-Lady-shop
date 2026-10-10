"use client";

import { igDm, igUrl, money } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import type { Settings } from "@/lib/types";
import Flower from "./Flower";
import Icon from "./Icon";

const faq = (SHOP: Settings) => [
  { q: "Narx qancha?", a: `Do'konimizdagi barcha mahsulotlar bir xil narxda — ${money(SHOP.price)}.` },
  {
    q: "Qanday buyurtma beraman?",
    a: "Mahsulotni savatga qo'shing, ma'lumotlaringizni yozing va \"Buyurtma berish\" ni bosing. Buyurtma darhol bizga yetib boradi va biz qo'ng'iroq qilib tasdiqlaymiz.",
  },
  { q: "Yetkazib berasizlarmi?", a: `Ha, ${SHOP.city} bo'ylab yetkazib beramiz. Aniq shartlar buyurtma tasdiqlanganda aytiladi.` },
  { q: "O'lchamni qanday tanlayman?", a: "Instagramda yozing — bo'yingiz va vazningizga qarab mos o'lchamni aytib beramiz." },
];

export default function InfoView() {
  const { settings: SHOP, categories: cats } = useCatalog();
  const FAQ = faq(SHOP);
  return (
    <section className="info">
      <div className="info__head">
        <span className="info__logo">
          <Flower />
        </span>
        <h2>{SHOP.name}</h2>
        <p>
          Ayollar uchun {cats.slice(0, 5).map((c) => c.name.toLowerCase()).join(", ")}
          {cats.length > 5 ? " va boshqalar" : ""}. <b>Hammasi {money(SHOP.price)}.</b>
        </p>
      </div>

      <ul className="contacts">
        <li>
          <Icon name="pin" />
          <div>
            <small>Manzil</small>
            {SHOP.city} shahri, Farg&apos;ona viloyati
          </div>
        </li>
        <li>
          <Icon name="insta" />
          <div>
            <small>Instagram</small>
            <a href={igUrl(SHOP)} target="_blank" rel="noopener">
              @{SHOP.instagram}
            </a>
          </div>
        </li>
        {SHOP.phone && (
          <li>
            <Icon name="phone" />
            <div>
              <small>Telefon</small>
              <a href={`tel:${SHOP.phone}`}>{SHOP.phone}</a>
            </div>
          </li>
        )}
        {SHOP.telegram && (
          <li>
            <Icon name="send" />
            <div>
              <small>Telegram</small>
              <a href={`https://t.me/${SHOP.telegram}`} target="_blank" rel="noopener">
                @{SHOP.telegram}
              </a>
            </div>
          </li>
        )}
      </ul>

      <a className="btn btn--insta btn--lg" href={igDm(SHOP)} target="_blank" rel="noopener">
        <Icon name="insta" /> Instagramda yozish
      </a>

      <h3 className="faq-h">Ko&apos;p so&apos;raladigan savollar</h3>
      <div className="faq">
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>
              {f.q}
              <Icon name="plus" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
