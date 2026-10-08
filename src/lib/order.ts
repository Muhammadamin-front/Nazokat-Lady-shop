// Buyurtma so'rovi shakli — brauzer ham, server ham shu turlardan foydalanadi.

export type OrderItem = { id: string; color: number; size: string; qty: number; name?: string; colorName?: string };
export type OrderCustomer = { name: string; phone: string; address: string; note: string };

export type OrderRequest = {
  items: OrderItem[];
  customer: OrderCustomer;
  website?: string; // honeypot: odam ko'rmaydigan maydon, bot to'ldirsa — rad etiladi
};

export type OrderResponse = { ok: true; orderId: string } | { ok: false; error: string };

export const LIMITS = {
  name: 60,
  address: 200,
  note: 500,
  items: 30,
  qty: 20,
};
