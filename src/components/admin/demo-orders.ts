// DEMO: admin panel bo'sh ko'rinmasligi uchun namunaviy buyurtmalar ("Demo" belgisi bilan ko'rsatiladi).
import { priceOf } from "@/lib/catalog";
import type { Catalog, Order, OrderStatus } from "@/lib/types";

const PEOPLE = [
  { name: "Dilnoza", phone: "901234567", address: "Navbahor mahallasi, 12-uy", note: "Kechqurun qo'ng'iroq qiling" },
  { name: "Mohira", phone: "937771122", address: "Mustaqillik ko'chasi, 45", note: "" },
  { name: "Gulnora", phone: "915550033", address: "Bozor yonida, 3-dom, 18-xonadon", note: "Sovg'aga, chiroyli qadoqlang" },
  { name: "Sevara", phone: "998887766", address: "Qo'qon yo'li, 7", note: "" },
  { name: "Madina", phone: "946662211", address: "Yangiobod, 21-uy", note: "" },
  { name: "Nilufar", phone: "905553311", address: "Markaz, 2-mavze, 9", note: "Ertalab yetkazib bering" },
];

const PLAN: { hoursAgo: number; status: OrderStatus; items: [string, number, number][] }[] = [
  { hoursAgo: 0.4, status: "new", items: [["oy", 1, 1], ["kardigan", 0, 1]] },
  { hoursAgo: 2, status: "new", items: [["kroko", 0, 1]] },
  { hoursAgo: 5, status: "confirmed", items: [["velur", 2, 1], ["tunika", 3, 1]] },
  { hoursAgo: 26, status: "delivered", items: [["peplum", 0, 1]] },
  { hoursAgo: 30, status: "delivered", items: [["zanjir", 0, 2]] },
  { hoursAgo: 52, status: "cancelled", items: [["harf", 1, 1]] },
];

export function demoOrders(c: Catalog): Order[] {
  const now = Date.now();
  return PLAN.flatMap((plan, i) => {
    const items = plan.items.flatMap(([id, color, qty]) => {
      const p = c.products.find((x) => x.id === id);
      if (!p) return [];
      return [{ id, name: p.name, color: p.colors[color]?.name ?? "", size: p.sizes[1] ?? "", qty, price: priceOf(c, p) }];
    });
    if (!items.length) return [];
    return [
      {
        id: `D${(0x1a2b + i * 97).toString(36).toUpperCase()}`,
        demo: true,
        createdAt: new Date(now - plan.hoursAgo * 3600_000).toISOString(),
        status: plan.status,
        customer: PEOPLE[i % PEOPLE.length],
        items,
        total: items.reduce((s, it) => s + it.price * it.qty, 0),
        count: items.reduce((s, it) => s + it.qty, 0),
        telegram: "sent" as const,
      },
    ];
  });
}
