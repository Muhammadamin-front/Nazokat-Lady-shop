"use client";

import Img from "../Img";
import Icon from "../Icon";
import { Empty, useAdmin } from "./ui";

export default function Videos() {
  const { catalog, save, editReel, confirm } = useAdmin();
  const reels = catalog.reels;

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= reels.length) return;
    const arr = [...reels];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    save({ ...catalog, reels: arr }, "Tartib o'zgardi");
  };

  return (
    <div className="a-videos">
      <div className="a-toolbar">
        <p className="a-toolbar__text">
          Saytdagi <b>Reels</b> lentasi va &quot;Videolar&quot; tugmasi shu ro&apos;yxatdan. Birinchisi — eng yuqorida.
        </p>
        <button className="btn btn--primary" onClick={() => editReel("new")}>
          <Icon name="plus" /> <span>Video qo&apos;shish</span>
        </button>
      </div>

      {!reels.length ? (
        <Empty icon="reels" title="Hali video yo'q" text="Do'kondan qisqa video yuklang — mijozlar Instagram'dagidek ko'radi." />
      ) : (
        <ul className="a-reel-grid">
          {reels.map((r, i) => {
            const p = r.product ? catalog.products.find((x) => x.id === r.product) : undefined;
            return (
              <li key={r.id} className={`a-reel ${r.hidden ? "is-hidden" : ""}`}>
                <button className="a-reel__media" onClick={() => editReel(r.id)} aria-label="Tahrirlash">
                  <Img k={r.poster} />
                  <span className={`a-reel__type ${r.video ? "is-video" : ""}`}>
                    <Icon name={r.video ? "play" : "image"} /> {r.video ? "Video" : "Rasm"}
                  </span>
                  {r.hidden && <span className="a-reel__hidden">Yashirin</span>}
                </button>
                <div className="a-reel__body">
                  <p>{r.caption || <span className="muted">Izohsiz</span>}</p>
                  <small>{p ? p.name : "Mahsulotga bog'lanmagan"}</small>
                </div>
                <div className="a-reel__actions">
                  <button className="a-icon-btn" onClick={() => move(i, -1)} aria-label="Oldinga" disabled={i === 0}>
                    <Icon name="left" />
                  </button>
                  <button className="a-icon-btn" onClick={() => move(i, 1)} aria-label="Orqaga" disabled={i === reels.length - 1}>
                    <Icon name="right" />
                  </button>
                  <button
                    className="a-icon-btn"
                    onClick={() => save({ ...catalog, reels: reels.map((x) => (x.id === r.id ? { ...x, hidden: !x.hidden } : x)) }, r.hidden ? "Saytda ko'rinadi" : "Yashirildi")}
                    aria-label={r.hidden ? "Ko'rsatish" : "Yashirish"}
                  >
                    <Icon name={r.hidden ? "eyeOff" : "eye"} />
                  </button>
                  <button
                    className="a-icon-btn a-icon-btn--danger"
                    onClick={() => confirm("Bu videoni o'chirasizmi?", () => save({ ...catalog, reels: reels.filter((x) => x.id !== r.id) }, "Video o'chirildi"))}
                    aria-label="O'chirish"
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
