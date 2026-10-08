import { byId, money, priceOf } from "@/lib/catalog";
import { seedCatalog } from "@/data/seed";
import { LIMITS, type OrderRequest, type OrderResponse } from "@/lib/order";

// Mijoz buyurtmasini qabul qiladi va do'kon egasiga Telegram bot orqali xabar yuboradi.
// Token va chat ID faqat serverda (env) — brauzerga chiqmaydi.
// Narx va mahsulot nomlari serverdagi katalogdan olinadi, mijozdan kelgan summaga ishonilmaydi.

const TELEGRAM_API = process.env.TELEGRAM_API_BASE || "https://api.telegram.org";

// Oddiy spam himoyasi: bitta IP dan 10 daqiqada ko'pi bilan 5 ta buyurtma
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

function reply(status: number, body: OrderResponse) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!token || !chatIds.length) {
    console.error("[order] TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan");
    return reply(503, { ok: false, error: "not_configured" });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return reply(429, { ok: false, error: "too_many" });

  const raw = await request.text();
  if (raw.length > 10_000) return reply(413, { ok: false, error: "too_large" });

  let body: OrderRequest;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400, { ok: false, error: "bad_json" });
  }

  // Bot (honeypot to'ldirilgan) — jim "muvaffaqiyat" qaytaramiz, xabar yubormaymiz
  if (body.website) return reply(200, { ok: true, orderId: "0" });

  const c = body.customer ?? ({} as OrderRequest["customer"]);
  const name = clean(c.name, LIMITS.name);
  const phone = typeof c.phone === "string" ? c.phone.replace(/\D/g, "") : "";
  const address = clean(c.address, LIMITS.address);
  const note = clean(c.note, LIMITS.note);
  if (name.length < 2 || phone.length !== 9 || address.length < 3) return reply(400, { ok: false, error: "bad_customer" });

  if (!Array.isArray(body.items) || !body.items.length || body.items.length > LIMITS.items) {
    return reply(400, { ok: false, error: "bad_items" });
  }

  // DEMO: server katalogi — loyiha bilan kelgan (seed). Haqiqiy ishga tushirishda ma'lumotlar bazasidan o'qiladi.
  const catalog = seedCatalog();
  const SHOP = catalog.settings;
  const origin = new URL(request.url).origin;
  let total = 0;
  const lines: string[] = [];
  let count = 0;
  for (const [i, it] of body.items.entries()) {
    const qty = Math.floor(Number(it?.qty));
    const size = typeof it?.size === "string" ? it.size.slice(0, 20) : "";
    if (!(qty >= 1 && qty <= LIMITS.qty)) return reply(400, { ok: false, error: "bad_items" });
    const p = byId(catalog, String(it?.id));
    let name: string, colorName: string, price: number, link = "";
    if (p) {
      const color = p.colors[Number(it?.color)];
      const sizeOk = p.sizes.length ? p.sizes.includes(size) : size === "";
      if (!color || !sizeOk || p.soldOut) return reply(400, { ok: false, error: "bad_items" });
      name = p.name;
      colorName = color.name;
      price = priceOf(catalog, p);
      link = `${origin}/#p/${p.id}/${it.color}`;
    } else {
      // DEMO: admin panelda (shu brauzerda) qo'shilgan, serverga hali saqlanmagan mahsulot — umumiy narxda qabul qilinadi
      name = clean(it?.name, 120);
      colorName = clean(it?.colorName, 40);
      if (!name) return reply(400, { ok: false, error: "bad_items" });
      price = SHOP.price;
    }
    count += qty;
    total += price * qty;
    const opts = [colorName && `Rang: ${colorName}`, size && `O'lcham: ${size}`].filter(Boolean).join(" · ");
    lines.push(
      `${i + 1}. ${link ? `<a href="${link}">${esc(name)}</a>` : esc(name)}\n` +
        (opts ? `    ${esc(opts)}\n` : "") +
        `    ${qty} × ${money(price)} = <b>${money(price * qty)}</b>`
    );
  }

  const orderId = "N" + Date.now().toString(36).toUpperCase().slice(-6);
  const when = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const text = [
    `🛍 <b>Yangi buyurtma #${orderId}</b>`,
    `🕒 ${when}`,
    "",
    `👤 <b>Mijoz:</b> ${esc(name)}`,
    `📞 <b>Telefon:</b> +998${phone}`,
    `📍 <b>Manzil:</b> ${esc(SHOP.city)}, ${esc(address)}`,
    ...(note ? [`📝 <b>Izoh:</b> ${esc(note)}`] : []),
    "",
    `📦 <b>Mahsulotlar:</b>`,
    ...lines,
    "",
    `💰 <b>Jami: ${count} ta — ${money(total)}</b>`,
  ].join("\n");

  const results = await Promise.allSettled(
    chatIds.map((chat_id) =>
      fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
        signal: AbortSignal.timeout(10_000),
      }).then(async (r) => {
        if (!r.ok) throw new Error(`telegram ${r.status}: ${(await r.text()).slice(0, 200)}`);
      })
    )
  );
  results.forEach((r) => r.status === "rejected" && console.error("[order]", r.reason));
  if (!results.some((r) => r.status === "fulfilled")) return reply(502, { ok: false, error: "telegram_failed" });

  return reply(200, { ok: true, orderId });
}
