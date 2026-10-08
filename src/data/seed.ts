// Boshlang'ich katalog: admin panel birinchi marta ishga tushganda data/catalog.json shundan yaratiladi.
// Keyin barcha o'zgarishlar admin paneldan qilinadi — bu faylni tahrirlash shart emas.
import images from "./images.json";
import type { Catalog, Color, Media, Product } from "@/lib/types";

const SIZES = ["42–44", "46–48", "50–52", "54–56"];
const SET = "To'plam: katta va kichik sumka (2 dona).";

const bag = (id: string, name: string, desc: string, colors: Color[], badge?: Product["badge"]): Product => ({
  id,
  cat: "sumka",
  name,
  desc: `${SET} ${desc}`,
  badge,
  sizes: [],
  colors,
});

const PRODUCTS: Product[] = [
  {
    id: "kardigan",
    featured: true,
    cat: "kardigan",
    name: "Uzun sport kardigan",
    desc: "Yon tomoni kesikli uzun kardigan, yenglarida sport chiziqlar bor. Keng shim va krossovka bilan kundalik obraz uchun.",
    badge: "Xit",
    sizes: SIZES,
    colors: [
      { name: "Jigarrang", hex: "#6b3f2c", photos: ["kardigan-brown-1", "kardigan-brown-2"] },
      { name: "Qora", hex: "#1d1b1e", photos: ["kardigan-black-1"] },
      { name: "Oq-kulrang", hex: "#e3e2de", photos: ["kardigan-white-1", "kardigan-white-2"] },
    ],
  },
  {
    id: "velur",
    featured: true,
    cat: "sport",
    name: "Velur sport kostyum",
    desc: "Yumshoq velur: kapyushonli kofta va keng shim, pushti chiziqlar bilan. Sayr va kundalik kiyish uchun qulay.",
    badge: "Yangi",
    sizes: SIZES,
    colors: [
      { name: "Kulrang", hex: "#9a999c", photos: ["velur-grey-1"] },
      { name: "Qora", hex: "#1d1b1e", photos: ["velur-black-1"] },
      { name: "To'q ko'k", hex: "#1f2340", photos: ["velur-navy-1"] },
    ],
  },
  {
    id: "peplum",
    featured: true,
    cat: "kostyum",
    name: "Peplum kostyum",
    desc: "Beli toraygan peplum kamzul tilla rang tugmalar bilan va to'g'ri bichimli shim. Bayram va tadbirlar uchun.",
    badge: "Xit",
    sizes: SIZES,
    colors: [{ name: "Bordo", hex: "#6d1530", photos: ["peplum-bordo-1"] }],
  },
  {
    id: "tunika",
    featured: true,
    cat: "uy",
    name: "Tunika va keng shim to'plami",
    desc: "Yumshoq trikotaj tunika va keng shim, chetlari kontrast kant bilan. Uyda ham, ko'chada ham qulay.",
    sizes: SIZES,
    colors: [
      { name: "Kulrang", hex: "#8d8b8c", photos: ["tunika-grey-1"] },
      { name: "To'q ko'k", hex: "#1c2340", photos: ["tunika-navy-1"] },
      { name: "Qora", hex: "#1d1b1e", photos: ["tunika-black-1"] },
      { name: "Bordo", hex: "#5e1a2c", photos: ["tunika-bordo-1"] },
    ],
  },
  {
    id: "kombinezon",
    cat: "kostyum",
    name: "Belbog'li kombinezon",
    desc: "Belbog'li kombinezonlar, ko'plab ranglarda. Rangni tanlang yoki Instagramda jonli rasmini so'rang.",
    badge: "Yangi",
    sizes: SIZES,
    colors: [
      { name: "Qora", hex: "#1d1b1e", photos: ["kombinezon-1"] },
      { name: "Bej", hex: "#d9c3a5", photos: [] },
      { name: "Qizil", hex: "#b0182f", photos: [] },
      { name: "Pushti", hex: "#e8a3b8", photos: [] },
      { name: "Ko'k", hex: "#7da7d9", photos: [] },
      { name: "Jigarrang", hex: "#6e4b3a", photos: [] },
    ],
  },
  bag("oy", "Yarim oy qulfli sumka to'plami", "Tilla rang qulf va yumshoq qopqoq. Har kunga ham, mehmonga ham mos.", [
    { name: "Qora", hex: "#2a2a2c", photos: ["oy-black-1"] },
    { name: "Pushti", hex: "#e9b9b3", photos: ["oy-pink-1"] },
    { name: "Jigarrang", hex: "#6b4235", photos: ["oy-brown-1"] },
    { name: "Bej", hex: "#d8c8b0", photos: ["oy-beige-1"] },
  ], "Xit"),
  bag("kroko", "Krokodil teksturali sumka to'plami", "Krokodil teri teksturasi, kumush rang qulf, qovurg'ali yon tomonlar.", [
    { name: "Havorang", hex: "#a9bdd3", photos: ["kroko-blue-1"] },
    { name: "Pushti", hex: "#e7bfc0", photos: ["kroko-pink-1"] },
    { name: "Qora", hex: "#2b2b2d", photos: ["kroko-black-1"] },
    { name: "Krem", hex: "#e9e1d3", photos: ["kroko-cream-1"] },
  ], "Yangi"),
  bag("zanjir", "Zanjirli bordo sumka to'plami", "Yaltiroq bordo qopqoq va tilla rang zanjir bezak. Bayramlar uchun.", [
    { name: "Bordo", hex: "#8e2440", photos: ["zanjir-bordo-1"] },
  ], "Yangi"),
  bag("tor", "To'r naqshli sumka to'plami", "Qopqog'ida nozik to'r naqsh, tilla rang harf bezagi.", [
    { name: "Krem", hex: "#e6e2c8", photos: ["tor-cream-1"] },
    { name: "Pushti", hex: "#f0d6d4", photos: ["tor-pink-1"] },
  ]),
  bag("harf", "Tilla harfli sumka to'plami", "Qopqog'ida katta tilla rang harflar, mustahkam dasta.", [
    { name: "Qora", hex: "#2a2a2c", photos: ["harf-black-1"] },
    { name: "Bej", hex: "#ddd0bd", photos: ["harf-beige-1"] },
  ]),
  bag("oq", "Oq klassik sumka to'plami", "Toza oq rang, tilla rang qulf. Har qanday kiyimga mos.", [
    { name: "Oq", hex: "#f3f1ec", photos: ["oq-white-1", "oq-white-2"] },
  ]),
  bag("egar", "Egar shaklidagi oq sumka", "Egar shaklidagi zamonaviy sumka, tilla rang hoshiya. Bitta katta sumka.", [
    { name: "Oq", hex: "#f3f1ec", photos: ["egar-white-1"] },
  ]),
  bag("toqima", "To'qima naqshli qizil to'plam", "To'qima teksturali yorqin qizil, qovurg'ali yon tomonlar.", [
    { name: "Qizil", hex: "#b3283b", photos: ["toqima-red-1"] },
  ]),
  bag("yorqin", "Yorqin qizil sumka to'plami", "Yorqin qizil rang, tilla rang dasta mahkamlagichlari.", [
    { name: "Qizil", hex: "#d42a2a", photos: ["yorqin-red-1"] },
  ]),
  bag("tolqin", "To'lqin naqshli jigarrang to'plam", "To'lqinsimon naqshli jigarrang, tilla rang qulf.", [
    { name: "Jigarrang", hex: "#a8622f", photos: ["tolqin-brown-1"] },
  ]),
  bag("halqa", "Oltin halqali krokodil to'plam", "Krokodil naqshli qopqoq, oltin rang halqa bezak, bej asos.", [
    { name: "Bej", hex: "#d9c6b5", photos: ["halqa-beige-1"] },
  ]),
  bag("qovurga", "Qovurg'ali qora sumka to'plami", "Qovurg'ali tekstura, yarim doira tilla qulf. Qat'iy va zamonaviy.", [
    { name: "Qora", hex: "#2a2a2c", photos: ["qovurga-black-1"] },
  ]),
];


const REELS = [
  { id: "v1", product: "kardigan", poster: "reel-1", video: "/videos/reel-1.mp4", caption: "Do'kondan jonli: kapyushonli uzun kardiganlar keldi" },
  { id: "v2", product: "oy", poster: "reel-2", video: "/videos/reel-2.mp4", caption: "Yangi sumka to'plamlari ochilmoqda — rangini tanlang" },
  { id: "r1", product: "kardigan", poster: "kardigan-brown-1", caption: "Kuzgi obraz: jigarrang kardigan va keng shim" },
  { id: "r2", product: "velur", poster: "velur-grey-1", caption: "Velur sport kostyum — sayr uchun eng qulayi" },
  { id: "r3", product: "peplum", poster: "peplum-bordo-1", caption: "Bayramga tayyor: bordo peplum kostyum" },
  { id: "r4", product: "kardigan", poster: "kardigan-white-2", caption: "Oq kardigan shahar ko'chalarida" },
  { id: "r5", product: "velur", poster: "velur-navy-1", caption: "To'q ko'k velur, pushti chiziqlar bilan" },
  { id: "r6", product: "tunika", poster: "tunika-bordo-1", caption: "Uy uchun: tunika va keng shim to'plami" },
  { id: "r7", product: "kardigan", poster: "kardigan-black-1", caption: "Qora kardigan — har kunga mos" },
];

export function seedCatalog(): Catalog {
  const media: Record<string, Media> = {};
  for (const [k, m] of Object.entries(images as Record<string, { w: number; h: number; lqip: string }>)) {
    media[k] = { ...m, base: "/img/", ext: "webp" };
  }
  return {
    version: 1,
    settings: {
      name: "Nazokat Lady Shop",
      city: "Quva",
      price: 75000,
      instagram: "NazokatLadyShop",
      phone: "",
      telegram: "",
      marquee: ["Hammasi 75 000 so'm", "Quva bo'ylab yetkazib berish", "Instagram: @NazokatLadyShop", "Kiyim va sumkalar bitta narxda"],
      showRatings: true,
      showcase: {
        title: "Yangi sumka to'plamlari",
        subtitle: "Katta va kichik sumka — 2 dona birga.",
        category: "sumka",
      },
    },
    categories: [
      { id: "sumka", name: "Sumkalar" },
      { id: "kardigan", name: "Kardiganlar" },
      { id: "sport", name: "Sport kostyumlar" },
      { id: "kostyum", name: "Kostyumlar" },
      { id: "uy", name: "Uy kiyimlari" },
    ],
    products: PRODUCTS,
    reels: REELS,
    media,
  };
}
