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


// ---------- Qishki kolleksiya (seed v2) ----------
const SHOES = ["36", "37", "38", "39", "40"];
const W = (p: Omit<Product, "since" | "sizes"> & { sizes?: string[] }): Product => ({ sizes: SIZES, ...p, since: 2 });
const c = (name: string, hex: string, ...photos: string[]): Color => ({ name, hex, photos });

const WINTER: Product[] = [
  W({
    id: "palto",
    cat: "ustki",
    name: "Belbog'li klassik palto",
    desc: "Uzun to'g'ri bichimli palto, keng yoqa va belbog' bilan. Botinka va shim bilan ham, uzun yubka bilan ham chiroyli.",
    badge: "Xit",
    featured: true,
    colors: [
      c("Yalpiz", "#a9cfa0", "palto-mint-1", "palto-mint-2", "palto-mint-3"),
      c("Yashil", "#1f9d4a", "palto-green-1", "palto-green-2", "palto-green-3"),
      c("Fuksiya", "#e0187a", "palto-fuchsia-1"),
      c("Qora", "#1d1b1e", "palto-black-1", "palto-black-2"),
      c("Kamel", "#c9a46b", "palto-camel-1"),
      c("Qizil", "#c8202f", "palto-red-1"),
      c("Jigarrang", "#7a4a2c", "palto-brown-1"),
    ],
  }),
  W({
    id: "postin",
    cat: "ustki",
    name: "Mo'yna yoqali po'stin",
    desc: "Yumshoq tukli po'stin, yoqasi va old qismi mo'yna bilan bezatilgan, beli bog'ichli. Qishning sovuq kunlari uchun.",
    badge: "Yangi",
    featured: true,
    colors: [
      c("Jigarrang", "#7b5232", "postin-brown-1", "postin-brown-2"),
      c("Oltin", "#9a7a45", "postin-gold-1"),
      c("Bordo", "#5a1428", "postin-bordo-1"),
      c("Mokko", "#5b4636", "postin-mokko-1"),
      c("Oq-qora", "#d9d9d9", "postin-zebra-1"),
    ],
  }),
  W({
    id: "kurtka",
    cat: "ustki",
    name: "Mo'yna astarli kurtka",
    desc: "Romb tikuvli yengil kurtka, ichi va yoqasi yumshoq oq mo'yna, qiyshiq zamokli.",
    badge: "Yangi",
    featured: true,
    colors: [
      c("Yashil", "#1e9a4c", "kurtka-green-1"),
      c("Pushti", "#e9cfd2", "kurtka-pink-1"),
      c("Zumrad", "#4f8f80", "kurtka-teal-1"),
      c("Olxo'ri", "#5e3048", "kurtka-plum-1"),
      c("Kulrang", "#a9adb7", "kurtka-grey-1"),
    ],
  }),
  W({
    id: "pufer",
    cat: "ustki",
    name: "Belbog'li uzun pufer palto",
    desc: "Uzun tikuvli pufer palto, belbog'li va yoqali. Issiq, lekin yengil.",
    colors: [c("Krem", "#e9dfc8", "pufer-cream-1", "pufer-cream-2"), c("Qora", "#1d1b1e", "pufer-duo-1")],
  }),
  W({
    id: "velpalto",
    cat: "ustki",
    name: "Kapyushonli velur uzun kurtka",
    desc: "Uzun velur kurtka, butun bo'yi zamokli, kapyushoni mo'yna bilan. Ko'chada ham, uyda ham qulay.",
    colors: [c("Olxo'ri", "#4a2232", "velpalto-plum-1", "velpalto-plum-2"), c("Ko'k", "#1f3fb0", "velpalto-blue-1")],
  }),
  W({
    id: "leokurtka",
    cat: "ustki",
    name: "Mo'yna yengli naqshli kurtka",
    desc: "Kalta naqshli kurtka, yeng uchlari va yoqasi mo'ynali, popon bezakli.",
    colors: [c("Jigarrang", "#4a2a26", "leokurtka-brown-1"), c("Qora", "#1d1b1e", "leokurtka-black-1"), c("Bej", "#b49a82", "leokurtka-beige-1")],
  }),
  W({
    id: "set3",
    cat: "kardigan",
    name: "Kardigan, kofta va shim to'plami",
    desc: "3 qismli trikotaj to'plam: uzun rangli kardigan, kofta va keng shim. Issiq va qulay.",
    badge: "Yangi",
    colors: [
      c("Qora-kulrang", "#3a3a3d", "set3-black-1"),
      c("Yashil", "#127a52", "set3-green-1"),
      c("Kulrang", "#6f6f73", "set3-grey-1"),
      c("Bej", "#b9a58f", "set3-beige-1"),
      c("To'q ko'k", "#2a3a66", "set3-navy-1"),
      c("Jigarrang", "#5a2e1c", "set3-brown-1"),
      c("Xantal", "#c99a1e", "set3-mustard-1"),
    ],
  }),
  W({
    id: "uzunkard",
    cat: "kardigan",
    name: "Uzun tugmali trikotaj kardigan",
    desc: "Katakli naqshli uzun trikotaj kardigan, tugmali va cho'ntakli.",
    colors: [
      c("Xaki", "#3f4a2e", "uzunkard-khaki-1", "uzunkard-khaki-2"),
      c("Mokko", "#8a6e60", "uzunkard-mokko-1"),
      c("Terrakota", "#b5541c", "uzunkard-terra-1"),
      c("To'q ko'k", "#1f2a4f", "uzunkard-navy-1"),
    ],
  }),
  W({
    id: "orma",
    cat: "kardigan",
    name: "O'rma naqshli kalta kardigan",
    desc: "Yumshoq momiq ip, o'rma naqsh va yaltiroq tugmalar.",
    colors: [c("Lilak", "#c9a7c0", "orma-lilac-1"), c("Krem", "#efe5cc", "orma-cream-1")],
  }),
  W({
    id: "marjonkard",
    cat: "kardigan",
    name: "Marjon tugmali momiq kardigan",
    desc: "Marjon hoshiyali yoqa va cho'ntaklar, marjon tugmalar. Yumshoq momiq ip.",
    colors: [c("Oq", "#f3f1ec", "marjonkard-white-1"), c("To'q kulrang", "#3b3d44", "marjonkard-grey-1")],
  }),
  W({
    id: "marjon",
    cat: "sviter",
    name: "Marjonli momiq sviter",
    desc: "Yumshoq momiq sviter, yoqasi va yenglari marjon bilan bezatilgan.",
    badge: "Xit",
    colors: [c("Oq", "#f3f1ec", "marjon-white-1"), c("Bej", "#ead9b5", "marjon-beige-1"), c("Kulrang", "#5c5d62", "marjon-grey-1")],
  }),
  W({
    id: "marjonv",
    cat: "sviter",
    name: "Marjon naqshli sviter",
    desc: "Ko'krak qismida V shaklidagi marjon naqsh, yumshoq momiq ip.",
    colors: [c("Qora", "#1d1b1e", "marjonv-1"), c("Oq", "#f3f1ec", "marjonv-1")],
  }),
  W({
    id: "gulli",
    cat: "sviter",
    name: "Gulli marjonli sviter",
    desc: "Hajmli to'qilgan gullar va marjon bezak, keng yeng.",
    colors: [c("Krem", "#efe3cc", "gulli-cream-1"), c("Oq", "#f6f4ef", "gulli-white-1", "gulli-white-2")],
  }),
  W({
    id: "chiziq",
    cat: "sviter",
    name: "Yoqali chiziqli sviter",
    desc: "Keng yoqali, yarim zamokli bo'yin, ko'krak qismida keng rangli chiziq.",
    colors: [c("Bej", "#b8a08a", "chiziq-beige-1", "chiziq-beige-2"), c("Jigarrang", "#8a4a22", "chiziq-brown-1"), c("Zaytun", "#7d7f4a", "chiziq-olive-1")],
  }),
  W({
    id: "jinsi",
    cat: "sviter",
    name: "Jinsi cho'ntakli trikotaj kurtka",
    desc: "Qalin trikotaj kurtka-kofta: jinsi cho'ntaklar va yoqa, old tomoni zamokli.",
    badge: "Yangi",
    colors: [
      c("Krem", "#efe9dc", "jinsi-cream-1", "jinsi-cream-2", "jinsi-cream-3"),
      c("To'q kulrang", "#3a3c43", "jinsi-grey-1", "jinsi-grey-2", "jinsi-grey-3", "jinsi-grey-4"),
    ],
  }),
  W({
    id: "gorlo",
    cat: "sviter",
    name: "Zanjir bezakli gorlo",
    desc: "Yupqa trikotaj gorlo, bo'yni tilla rang zanjir bilan bezatilgan.",
    colors: [c("Lavanda", "#9aa3e0", "gorlo-lav-1"), c("Oq", "#f6f4ef", "gorlo-white-1")],
  }),
  W({
    id: "gorlo2",
    cat: "sviter",
    name: "Yorqin rangli gorlo",
    desc: "Yumshoq trikotaj gorlo, ko'kragida kumush rang yozuv.",
    colors: [c("Fuksiya", "#e0187a", "gorlo-fuchsia-1"), c("Yashil", "#1fae4f", "gorlo-green-1")],
  }),
  W({
    id: "kapkofta",
    cat: "sviter",
    name: "Kapyushonli trikotaj kofta",
    desc: "Kapyushonli yumshoq trikotaj kofta, yoqasi tugmali.",
    colors: [c("Yalpiz", "#a8d8c4", "kapkofta-mint-1")],
  }),
  W({
    id: "yoqali",
    cat: "sviter",
    name: "Cho'ntakli trikotaj kofta",
    desc: "Krem rang trikotaj kofta. Jinsi shim va botinka bilan kundalik obraz.",
    colors: [c("Krem", "#eadfca", "yoqali-cream-1")],
  }),
  W({
    id: "jogger",
    cat: "shim",
    name: "Jinsi jogger shim",
    desc: "Rezinkali bel va bog'ich, pastki qismi yig'ilgan qulay jinsi shim.",
    colors: [c("Qora", "#2a2a2c", "jogger-black-1")],
  }),
  W({
    id: "jeans",
    cat: "shim",
    name: "Klassik jinsi shim",
    desc: "To'g'ri bichimli kulrang jinsi shim, baland bel.",
    colors: [c("Kulrang", "#55565b", "jeans-grey-1")],
  }),
  W({
    id: "botinka",
    cat: "poyabzal",
    name: "Poshnali botinka",
    desc: "O'rta poshnali qisqa botinka. Palto va uzun yubka bilan juda mos.",
    sizes: SHOES,
    colors: [c("Yashil", "#1f7a46", "botinka-green-1"), c("Qora", "#1d1b1e", "botinka-black-1")],
  }),
  W({
    id: "tufli-bant",
    cat: "poyabzal",
    name: "Bantli yumshoq tufli",
    desc: "Tikuvli yumshoq tufli, oldida bant. Yengil va qulay.",
    sizes: SHOES,
    colors: [c("Krem", "#ece3d2", "tufli-bant-1")],
  }),
  W({
    id: "tufli-moyna",
    cat: "poyabzal",
    name: "Mo'ynali yumshoq tufli",
    desc: "Ichi va usti momiq mo'ynali yumshoq tufli — qishda oyoq issiq turadi.",
    sizes: SHOES,
    colors: [c("Qora", "#1d1b1e", "tufli-moyna-1"), c("Kulrang", "#8d8d90", "tufli-moyna-1")],
  }),
  W({
    id: "beret",
    cat: "aksessuar",
    name: "Beret",
    desc: "Klassik beret. Palto bilan chiroyli qishki obraz.",
    sizes: [],
    colors: [c("Yashil", "#7fc3a0", "beret-green-1")],
  }),
  W({
    id: "hijob",
    cat: "aksessuar",
    name: "Tayyor hijob (shapkali)",
    desc: "Ichki shapka va sharf birga tikilgan tayyor hijob. Ko'p ranglarda.",
    sizes: [],
    colors: [
      c("Qora", "#1d1b1e", "hijob-1"),
      c("Kulrang", "#8d8d90", "hijob-1"),
      c("Havorang", "#8fb3d9", "hijob-1"),
      c("Bordo", "#7a1f35", "hijob-1"),
      c("Pushti", "#d9a3b8", "hijob-1"),
      c("Bej", "#d9c6a8", "hijob-1"),
    ],
  }),
];

const REELS = [
  { id: "w1", product: "palto", poster: "palto-green-1", caption: "Qishki kolleksiya: belbog'li paltolar 7 xil rangda", since: 2 },
  { id: "w2", product: "postin", poster: "postin-brown-1", caption: "Mo'yna yoqali po'stinlar keldi — sovuqqa tayyormisiz?", since: 2 },
  { id: "w3", product: "kurtka", poster: "kurtka-pink-1", caption: "Ichi mo'ynali yengil kurtkalar", since: 2 },
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
    seed: 2,
    settings: {
      name: "Nazokat Lady Shop",
      city: "Quva",
      price: 75000,
      instagram: "NazokatLadyShop",
      phone: "",
      telegram: "",
      marquee: ["Hammasi 75 000 so'm", "Qishki kolleksiya keldi", "Quva bo'ylab yetkazib berish", "Instagram: @NazokatLadyShop"],
      showRatings: true,
      showcase: {
        title: "Yangi sumka to'plamlari",
        subtitle: "Katta va kichik sumka — 2 dona birga.",
        category: "sumka",
      },
    },
    categories: [
      { id: "ustki", name: "Palto va kurtkalar" },
      { id: "sviter", name: "Sviter va koftalar" },
      { id: "kardigan", name: "Kardiganlar" },
      { id: "sumka", name: "Sumkalar" },
      { id: "poyabzal", name: "Poyabzal" },
      { id: "shim", name: "Shimlar" },
      { id: "aksessuar", name: "Aksessuarlar" },
      { id: "sport", name: "Sport kostyumlar" },
      { id: "kostyum", name: "Kostyumlar" },
      { id: "uy", name: "Uy kiyimlari" },
    ],
    products: [...WINTER, ...PRODUCTS],
    reels: REELS,
    media,
  };
}
