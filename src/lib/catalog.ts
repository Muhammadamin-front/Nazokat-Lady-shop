// Katalog bilan ishlash uchun sof funksiyalar (server ham, brauzer ham).
import type { Catalog, Product, Settings } from "./types";

export const money = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
export const igUrl = (s: Settings) => `https://instagram.com/${s.instagram}`;
export const igDm = (s: Settings) => `https://ig.me/m/${s.instagram}`;

// DEMO reyting: mahsulot ID sidan barqaror "tasodifiy" qiymat (har safar bir xil): 4.3–4.9 yulduz, 3000+ baho.
// Haqiqiy ishga tushirishdan oldin admin → Sozlamalar → "Reytinglarni ko'rsatish" ni o'chiring yoki haqiqiy baholarni ulang.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function ratingOf(p: Product) {
  const h = hash(p.id);
  return {
    rating: p.rating ?? Math.round((4.3 + (h % 7) / 10) * 10) / 10,
    reviews: p.reviews ?? 3000 + ((h >>> 8) % 6000),
  };
}
export const showRatings = (s: Settings) => s.showRatings !== false;
export const fmtNum = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const priceOf = (c: Catalog, p: Product) => (p.price && p.price > 0 ? p.price : c.settings.price);
export const byId = (c: Catalog, id: string) => c.products.find((p) => p.id === id);
export const allPhotos = (p: Product) => p.colors.flatMap((col) => col.photos);

export function photosOf(p: Product, color: number): string[] {
  const own = p.colors[color]?.photos ?? [];
  return own.length ? own : allPhotos(p);
}

export const productOfPhoto = (c: Catalog, photo: string) => c.products.find((p) => allPhotos(p).includes(photo));

export function colorOfPhoto(p: Product, photo: string): number {
  const i = p.colors.findIndex((col) => col.photos.includes(photo));
  return i < 0 ? 0 : i;
}

export function mediaSrc(c: Catalog, key: string, size: "sm" | "lg" = "sm") {
  const m = c.media[key];
  if (!m) return "";
  return m.src ? m.src[size] : `${m.base}${key}-${size}.${m.ext}`;
}

// Loyiha bilan kelgan katalog yangilansa (seed versiyasi oshsa), admin saqlagan eski katalogga
// faqat YANGI qo'shilgan tovar/video/kategoriyalar qo'shiladi — admin o'chirganlari qaytib chiqmaydi.
export function mergeSeed(stored: Catalog | null, seed: Catalog): Catalog {
  if (!stored) return seed;
  const from = stored.seed ?? 1;
  const to = seed.seed ?? 1;
  if (from >= to) return stored;
  const fresh = <T extends { id: string; since?: number }>(list: T[], have: T[]) =>
    list.filter((x) => (x.since ?? 1) > from && !have.some((h) => h.id === x.id));
  const newProducts = fresh(seed.products, stored.products);
  const cats = seed.categories.filter((c) => !stored.categories.some((s) => s.id === c.id));
  return {
    ...stored,
    seed: to,
    // yangi kategoriyalar seed'dagi tartib bo'yicha oldinga
    categories: [...cats, ...stored.categories],
    products: [...newProducts, ...stored.products],
    reels: [...fresh(seed.reels, stored.reels), ...stored.reels],
    media: { ...seed.media, ...stored.media },
  };
}

// Saytga faqat ko'rinadigan narsalar chiqadi
export function publicCatalog(c: Catalog): Catalog {
  const products = c.products.filter((p) => !p.hidden && allPhotos(p).length);
  const ids = new Set(products.map((p) => p.id));
  const reels = c.reels.filter((r) => !r.hidden && c.media[r.poster] && (!r.product || ids.has(r.product)));
  const used = new Set([...products.flatMap(allPhotos), ...reels.map((r) => r.poster)]);
  const media = Object.fromEntries(Object.entries(c.media).filter(([k]) => used.has(k)));
  const categories = c.categories.filter((cat) => products.some((p) => p.cat === cat.id));
  return { ...c, products, reels, media, categories };
}

// Story guruhlari katalogdan avtomatik: "Yangi" + har bir kategoriya
export function buildStories(c: Catalog) {
  const group = (list: Product[]) => list.flatMap((p) => p.colors.map((col) => col.photos[0]).filter(Boolean)).slice(0, 8);
  const out: { id: string; title: string; cover: string; items: string[] }[] = [];
  const fresh = group(c.products.filter((p) => p.badge === "Yangi"));
  if (fresh.length) out.push({ id: "yangi", title: "Yangi", cover: fresh[0], items: fresh });
  for (const cat of c.categories) {
    const items = group(c.products.filter((p) => p.cat === cat.id));
    if (items.length) out.push({ id: cat.id, title: cat.name, cover: items[0], items });
  }
  return out;
}

// Bosh sahifa carousel'i: "featured" belgilangan mahsulotlar (bo'lmasa — birinchi 5 tasi)
export function heroSlides(c: Catalog) {
  const list = c.products.filter((p) => p.featured);
  return (list.length ? list : c.products.slice(0, 5)).map((p) => ({ product: p.id, photo: allPhotos(p)[0] })).filter((s) => s.photo);
}

export function showcaseItems(c: Catalog) {
  return c.products
    .filter((p) => p.cat === c.settings.showcase.category)
    .flatMap((p) => p.colors.map((col, ci) => ({ k: col.photos[0], p, color: ci, alt: `${p.name} — ${col.name}` })))
    .filter((it) => it.k)
    .slice(0, 10);
}
