// Telegram botni sozlashga yordamchi.
//   npm run telegram:setup          — bot ishlayotganini tekshiradi va botga yozgan chatlarning ID sini ko'rsatadi
//   npm run telegram:setup -- --test — TELEGRAM_CHAT_ID ga sinov xabarini yuboradi
// .env.local dagi TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID dan foydalanadi.

const token = process.env.TELEGRAM_BOT_TOKEN;
const api = (m) => `https://api.telegram.org/bot${token}/${m}`;

if (!token) {
  console.error("✗ .env.local da TELEGRAM_BOT_TOKEN yo'q. .env.example ga qarang.");
  process.exit(1);
}

const me = await (await fetch(api("getMe"))).json();
if (!me.ok) {
  console.error("✗ Token noto'g'ri:", me.description);
  process.exit(1);
}
console.log(`✓ Bot: @${me.result.username} (${me.result.first_name})`);

if (process.argv.includes("--test")) {
  const ids = (process.env.TELEGRAM_CHAT_ID ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length) {
    console.error("✗ TELEGRAM_CHAT_ID bo'sh.");
    process.exit(1);
  }
  for (const chat_id of ids) {
    const r = await (
      await fetch(api("sendMessage"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text: "✅ Nazokat Lady Shop: buyurtma xabarlari shu chatga keladi." }),
      })
    ).json();
    console.log(r.ok ? `✓ ${chat_id} ga yuborildi` : `✗ ${chat_id}: ${r.description}`);
  }
  process.exit(0);
}

const upd = await (await fetch(api("getUpdates"))).json();
const chats = new Map();
for (const u of upd.result ?? []) {
  const chat = (u.message ?? u.channel_post ?? u.my_chat_member)?.chat;
  if (chat) chats.set(chat.id, chat);
}
if (!chats.size) {
  console.log(`\nHali hech kim botga yozmagan. Telegramda @${me.result.username} ni oching, /start bosing va qayta ishga tushiring.`);
} else {
  console.log("\nBotga yozgan chatlar:");
  for (const c of chats.values()) console.log(`  ${c.id}  —  ${c.title ?? [c.first_name, c.last_name].filter(Boolean).join(" ")} ${c.username ? "@" + c.username : ""}`);
  console.log("\nKeraklisini .env.local dagi TELEGRAM_CHAT_ID ga yozing, keyin: npm run telegram:setup -- --test");
}
