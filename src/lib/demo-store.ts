// DEMO saqlash: admin paneldagi o'zgarishlar va buyurtmalar shu brauzerning localStorage'ida turadi.
// Haqiqiy ishga tushirishda bu modul server API (ma'lumotlar bazasi + fayl saqlash) bilan almashtiriladi —
// komponentlar faqat shu funksiyalarni chaqiradi.
import type { Catalog, Order } from "./types";

const CATALOG_KEY = "nazokat:admin:catalog";
const ORDERS_KEY = "nazokat:orders";
export const DEMO_EVENT = "nazokat:catalog";

export function loadCatalog(): Catalog | null {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Catalog;
    // DEMO: yuklangan video faqat sessiya davomida (blob:) yashaydi — sahifa yangilangach poster-reel bo'lib qoladi
    c.reels = c.reels.map((r) => (r.video?.startsWith("blob:") ? { ...r, video: undefined } : r));
    return c;
  } catch {
    return null;
  }
}

// Xotira to'lsa (localStorage ~5 MB) xato tashlaydi — admin UI buni ko'rsatadi
export function saveCatalog(c: Catalog) {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(c));
  window.dispatchEvent(new Event(DEMO_EVENT));
}

export function resetCatalog() {
  try {
    localStorage.removeItem(CATALOG_KEY);
  } catch {}
  window.dispatchEvent(new Event(DEMO_EVENT));
}

export function loadOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]") as Order[];
  } catch {
    return [];
  }
}

export function saveOrders(list: Order[]) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {}
}

export function addOrder(o: Order) {
  saveOrders([o, ...loadOrders()]);
}

export function storageUsage() {
  try {
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) n += (localStorage.getItem(localStorage.key(i)!) ?? "").length;
    return n * 2; // UTF-16
  } catch {
    return 0;
  }
}
