// Admin yuklagan rasmni brauzerning o'zida siqadi: katta (800px) va kichik (420px) WebP/JPEG,
// hamda ~400 baytlik xira LQIP. Serverga hech narsa kerak emas va sekin internetda yuklash yengil bo'ladi.
// DEMO: natija data URL ko'rinishida localStorage'da saqlanadi; haqiqiy versiyada shu fayllar serverga yuboriladi.
import type { Media } from "@/lib/types";

type Source = { src: CanvasImageSource; w: number; h: number; done: () => void };

async function decode(file: Blob): Promise<Source> {
  if ("createImageBitmap" in window) {
    try {
      const b = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { src: b, w: b.width, h: b.height, done: () => b.close() };
    } catch {}
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();
  return { src: img, w: img.naturalWidth, h: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
}

function render(s: Source, maxW: number) {
  const scale = Math.min(1, maxW / s.w);
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(s.w * scale));
  c.height = Math.max(1, Math.round(s.h * scale));
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(s.src, 0, 0, c.width, c.height);
  return c;
}

// Safari WebP kodlay olmasa, avtomatik JPEG
function encode(c: HTMLCanvasElement, q: number): { url: string; ext: Media["ext"] } {
  const webp = c.toDataURL("image/webp", q);
  if (webp.startsWith("data:image/webp")) return { url: webp, ext: "webp" };
  return { url: c.toDataURL("image/jpeg", q + 0.05), ext: "jpg" };
}

export async function processImage(file: Blob): Promise<Media> {
  const s = await decode(file);
  try {
    const lg = encode(render(s, 800), 0.72);
    const sm = encode(render(s, 420), 0.72);
    const lqip = render(s, 12).toDataURL("image/jpeg", 0.5);
    return { w: s.w, h: s.h, lqip, base: "", ext: lg.ext, src: { sm: sm.url, lg: lg.url } };
  } finally {
    s.done();
  }
}

// Videoning 0.5-soniyasidan poster kadr. Brauzer videoni o'qiy olmasa (masalan HEVC) — null.
export async function videoPoster(file: Blob): Promise<Blob | null> {
  const url = URL.createObjectURL(file);
  const v = document.createElement("video");
  v.muted = true;
  v.playsInline = true;
  v.preload = "auto";
  v.src = url;
  const once = (ev: string) =>
    new Promise<void>((res, rej) => {
      const t = window.setTimeout(() => rej(new Error("timeout")), 8000);
      v.addEventListener(ev, () => (window.clearTimeout(t), res()), { once: true });
      v.addEventListener("error", () => (window.clearTimeout(t), rej(new Error("decode"))), { once: true });
    });
  try {
    await once("loadeddata");
    v.currentTime = Math.min(0.5, (v.duration || 1) / 2);
    await once("seeked");
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    return await new Promise((res) => c.toBlob((b) => res(b), "image/jpeg", 0.85));
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const newKey = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const fmtBytes = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
