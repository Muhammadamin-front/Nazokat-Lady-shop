// Katalog (admin paneldan boshqariladi) va buyurtma turlari — server ham, brauzer ham ishlatadi.

export type Media = {
  w: number;
  h: number;
  lqip: string; // ~400 baytlik xira oldindan-ko'rinish (data URL)
  base: string; // "/img/" — loyiha bilan kelgan rasmlar
  ext: "webp" | "jpg";
  src?: { sm: string; lg: string }; // admin (demo) yuklagan rasm — to'g'ridan-to'g'ri URL / data URL
};

export type Color = { name: string; hex: string; photos: string[] };

export type Product = {
  id: string;
  cat: string;
  name: string;
  desc: string;
  badge?: "Xit" | "Yangi";
  colors: Color[];
  sizes: string[]; // bo'sh — o'lcham so'ralmaydi (sumkalar)
  price?: number; // bo'sh — umumiy narx (settings.price)
  hidden?: boolean; // saytda ko'rinmaydi
  soldOut?: boolean; // "Tugagan" — ko'rinadi, lekin buyurtma qilib bo'lmaydi
  featured?: boolean; // bosh sahifadagi katta carousel'da
  rating?: number; // DEMO reyting (bo'sh — avtomatik); haqiqiy versiyada mijozlar baholaridan hisoblanadi
  reviews?: number;
};

export type Reel = {
  id: string;
  product?: string;
  poster: string; // media kaliti
  video?: string; // URL: /videos/... yoki /media/...
  caption: string;
  hidden?: boolean;
};

export type Category = { id: string; name: string };

export type Settings = {
  name: string;
  city: string;
  price: number;
  instagram: string;
  phone: string;
  telegram: string;
  marquee: string[];
  showcase: { title: string; subtitle: string; category: string };
  showRatings?: boolean; // DEMO reytinglarni ko'rsatish (sukut bo'yicha — ha)
};

export type Catalog = {
  version: number;
  settings: Settings;
  categories: Category[];
  products: Product[];
  reels: Reel[];
  media: Record<string, Media>;
};

export type OrderStatus = "new" | "confirmed" | "delivered" | "cancelled";

export type Order = {
  id: string;
  demo?: boolean; // admin demo uchun namunaviy buyurtma
  createdAt: string;
  status: OrderStatus;
  customer: { name: string; phone: string; address: string; note: string };
  items: { id: string; name: string; color: string; size: string; qty: number; price: number }[];
  total: number;
  count: number;
  telegram: "sent" | "failed" | "off";
};
