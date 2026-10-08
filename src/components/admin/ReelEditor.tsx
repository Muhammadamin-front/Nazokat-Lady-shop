"use client";

import { useRef, useState } from "react";
import { allPhotos, mediaSrc } from "@/lib/catalog";
import { CatalogProvider } from "@/lib/catalog-context";
import type { Media, Reel } from "@/lib/types";
import Img from "../Img";
import Icon from "../Icon";
import { Field, Segmented, Sheet, Toggle, useAdmin } from "./ui";
import { fmtBytes, newKey, processImage, videoPoster } from "./media";

const HEAVY = 15 * 1048576;

export default function ReelEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const { catalog, save, toast } = useAdmin();
  const isNew = id === "new";
  const [r, setR] = useState<Reel>(() => structuredClone(catalog.reels.find((x) => x.id === id) ?? { id: newKey("r"), poster: "", caption: "" }));
  const [kind, setKind] = useState<"video" | "photo">(r.video || isNew ? "video" : "photo");
  const [media, setMedia] = useState<Record<string, Media>>({});
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const videoInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  const view = { ...catalog, media: { ...catalog.media, ...media } };
  const product = r.product ? catalog.products.find((p) => p.id === r.product) : undefined;

  const setPosterFrom = async (blob: Blob) => {
    const k = newKey("poster");
    const m = await processImage(blob);
    setMedia((x) => ({ ...x, [k]: m }));
    setR((x) => ({ ...x, poster: k }));
  };

  const pickVideo = async (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) return toast("Bu video fayl emas", "err");
    setFile({ name: f.name, size: f.size });
    setR((x) => ({ ...x, video: URL.createObjectURL(f) }));
    setBusy("Poster tayyorlanmoqda…");
    const frame = await videoPoster(f);
    if (frame) await setPosterFrom(frame);
    else toast("Videodan kadr olib bo'lmadi — posterni o'zingiz tanlang", "err");
    setBusy("");
  };

  const submit = () => {
    if (kind === "video" && !r.video) return setErr("Video tanlang");
    if (!r.poster) return setErr(kind === "video" ? "Poster rasm kerak" : "Rasm tanlang");
    const clean: Reel = { ...r, caption: r.caption.trim(), video: kind === "video" ? r.video : undefined };
    const newMedia = media[clean.poster] ? { [clean.poster]: media[clean.poster] } : {};
    const reels = isNew ? [clean, ...catalog.reels] : catalog.reels.map((x) => (x.id === clean.id ? clean : x));
    if (save({ ...catalog, reels, media: { ...catalog.media, ...newMedia } }, isNew ? "Video qo'shildi" : "Saqlandi")) onClose();
  };

  return (
    <Sheet
      title={isNew ? "Yangi video" : "Videoni tahrirlash"}
      onClose={onClose}
      footer={
        <>
          {err && <p className="a-form-err">{err}</p>}
          <div className="a-foot-row">
            <button className="btn btn--ghost" onClick={onClose}>
              Bekor qilish
            </button>
            <button className="btn btn--primary" onClick={submit} disabled={!!busy}>
              <Icon name="check" /> Saqlash
            </button>
          </div>
        </>
      }
    >
      <CatalogProvider catalog={view}>
        <div className="a-editor">
          <section className="a-block">
            <Segmented
              value={kind}
              options={[
                { v: "video", label: "Video" },
                { v: "photo", label: "Rasm (sekin harakat)" },
              ]}
              onChange={(v) => {
                setKind(v);
                setErr("");
              }}
            />

            {kind === "video" ? (
              <>
                <div className="a-video-drop">
                  {r.video ? (
                    <video src={r.video} poster={r.poster ? mediaSrc(view, r.poster, "lg") : undefined} controls playsInline muted />
                  ) : (
                    <button className="a-video-drop__empty" onClick={() => videoInput.current?.click()}>
                      <Icon name="upload" />
                      <b>Video tanlash</b>
                      <small>MP4 yoki MOV · tik (9:16) · 15–40 soniya</small>
                    </button>
                  )}
                </div>
                {file && (
                  <p className={`a-filemeta ${file.size > HEAVY ? "is-warn" : ""}`}>
                    {file.name} · {fmtBytes(file.size)}
                    {file.size > HEAVY && " — sekin internet uchun og'ir. Haqiqiy versiyada server avtomatik siqadi (~5 MB)."}
                  </p>
                )}
                <div className="a-row-btns">
                  <button className="btn btn--ghost" onClick={() => videoInput.current?.click()}>
                    <Icon name="upload" /> {r.video ? "Boshqa video" : "Video tanlash"}
                  </button>
                </div>
                <input ref={videoInput} type="file" accept="video/*" hidden onChange={(e) => (pickVideo(e.target.files?.[0]), (e.target.value = ""))} />
                <p className="a-demo-inline">
                  <Icon name="sparkle" /> Demo: yuklangan video faqat shu sessiyada o&apos;ynaydi. Haqiqiy versiyada serverga yuklanadi.
                </p>
              </>
            ) : (
              <>
                <p className="a-block__hint">Rasm saytda sekin kattalashib turadi (Reels uslubida).</p>
                {product && (
                  <div className="a-pick-grid">
                    {allPhotos(product).map((k) => (
                      <button key={k} className={r.poster === k ? "is-on" : ""} onClick={() => setR((x) => ({ ...x, poster: k }))}>
                        <Img k={k} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <section className="a-block">
            <h3>{kind === "video" ? "Poster (video yuklanguncha ko'rinadi)" : "Tanlangan rasm"}</h3>
            <div className="a-poster">
              {r.poster ? <Img k={r.poster} /> : <span className="a-poster__empty">{busy || "Rasm yo'q"}</span>}
              {busy && <span className="a-poster__busy">{busy}</span>}
            </div>
            <button className="btn btn--ghost" onClick={() => posterInput.current?.click()}>
              <Icon name="image" /> {r.poster ? "Rasmni almashtirish" : "Rasm yuklash"}
            </button>
            <input
              ref={posterInput}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setBusy("Siqilmoqda…");
                try {
                  await setPosterFrom(f);
                } catch {
                  toast("Rasmni o'qib bo'lmadi", "err");
                }
                setBusy("");
              }}
            />
          </section>

          <section className="a-block">
            <h3>Matn va bog&apos;lanish</h3>
            <Field label="Izoh" hint={`${r.caption.length}/150`}>
              <textarea className="a-input" rows={2} value={r.caption} onChange={(e) => setR((x) => ({ ...x, caption: e.target.value.slice(0, 150) }))} placeholder="Masalan: Yangi sumkalar keldi — rangini tanlang" />
            </Field>
            <Field label="Qaysi tovar?" hint="Videoda “Xarid” tugmasi shu tovarni ochadi">
              <select className="a-input" value={r.product ?? ""} onChange={(e) => setR((x) => ({ ...x, product: e.target.value || undefined }))}>
                <option value="">— Bog&apos;lanmagan —</option>
                {catalog.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Toggle on={!r.hidden} onChange={(v) => setR((x) => ({ ...x, hidden: !v }))} label="Saytda ko'rinadi" />
          </section>
        </div>
      </CatalogProvider>
    </Sheet>
  );
}
