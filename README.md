# Nazokat Lady Shop

Quvadagi ayollar butigi uchun mobil-birinchi internet do'kon. Hammasi 75 000 so'm. Next.js 16 (statik eksport), React 19, TypeScript.

## Ishga tushirish

```bash
npm install
cp .env.example .env.local   # Telegram sozlamalari (pastga qarang)
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## Buyurtmalar Telegram'ga

Mijoz "Buyurtma berish" ni bosganda, sayt serveri (`src/app/api/order/route.ts`) do'kon egasiga Telegram bot orqali xabar yuboradi:
buyurtma raqami, vaqt, ism, telefon, manzil, izoh, har bir mahsulot (rang, o'lcham, soni) va jami summa.
Bot tokeni faqat serverda turadi va brauzerga chiqmaydi.

**Sozlash (bir marta, 3 daqiqa):**

1. Telegram'da [@BotFather](https://t.me/BotFather) → `/newbot` → nom bering → **token** beradi.
2. `.env.local` faylidagi `TELEGRAM_BOT_TOKEN=` ga tokenni yozing.
3. Do'kon egasi o'z Telegramidan yangi botni ochib **/start** bosadi.
4. `npm run telegram:setup` — botga yozgan chatlarning ID sini ko'rsatadi. Uni `TELEGRAM_CHAT_ID=` ga yozing.
   Bir nechta odamga (masalan, egasi va sotuvchi) yuborish uchun vergul bilan: `TELEGRAM_CHAT_ID=111,222`.
   Guruhga yuborish uchun botni guruhga qo'shing va guruhda biror xabar yozing.
5. `npm run telegram:setup -- --test` — sinov xabari keladi.

Telegram ishlamay qolsa yoki internet uzilsa, mijozning savati o'chmaydi. Unga "Qayta urinish" va "Instagram orqali yuborish" tugmalari chiqadi.

## Admin panel (demo)

Saytda **Boshqa (⋯) → Admin panel** yoki to'g'ridan-to'g'ri `/admin`. Demo parol: `admin`.

- **Bosh panel:** bugungi va 7 kunlik buyurtmalar, yangi buyurtmalar, eng ko'p sotilganlar, tezkor amallar.
- **Buyurtmalar:** holat (Yangi → Tasdiqlangan → Yetkazildi / Bekor), qidiruv, bir bosishda qo'ng'iroq.
- **Tovarlar:** qo'shish/tahrirlash, ranglar va rasmlar (telefonda avtomatik siqiladi), maxsus narx, o'lchamlar,
  "Xit/Yangi" belgisi, sotuvda/tugagan, yashirish, bosh sahifaga chiqarish, tartib.
- **Videolar:** video yuklash (poster avtomatik), izoh, tovarga bog'lash, yashirish, tartib.
- **Sozlamalar:** umumiy narx, do'kon ma'lumotlari, kategoriyalar, yuguruvchi lenta, 3D vitrina, reytinglar.

**Demo cheklovlari:** o'zgarishlar faqat shu brauzerda (localStorage) saqlanadi va boshqa qurilmalarda ko'rinmaydi;
yuklangan video faqat shu sessiyada o'ynaydi; parol himoya emas. Ko'rinadigan namunaviy buyurtmalar "Demo" belgili.
Haqiqiy ishga tushirish uchun `src/lib/demo-store.ts` server API (ma'lumotlar bazasi + fayl saqlash + login) bilan almashtiriladi.

**Reytinglar** (yulduz va baholar soni) hozircha demo raqamlar. Haqiqiy mijozlarga ochishdan oldin
admin → Sozlamalar → "Reytinglarni ko'rsatish" ni o'chiring yoki haqiqiy baholarni ulang.

## Joylash (deploy)

[Vercel](https://vercel.com) (bepul): GitHub'dagi loyihani import qiling, **Settings → Environment Variables** ga
`TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` ni qo'shing, keyin Deploy. Sahifalar statik tayyorlanadi, faqat `/api/order` serverda ishlaydi.

## Kontentni o'zgartirish

| Nima | Qayerda |
| --- | --- |
| Narx, kontaktlar, tovarlar, videolar, kategoriyalar | Admin panel (`/admin`) |
| Boshlang'ich katalog (demo holati) | `src/data/seed.ts` |
| Story guruhlari | kategoriyalardan avtomatik |

### Yangi rasm

1. Rasmni `public/products/` ga tashlang.
2. `scripts/optimize_images.py` dagi `MAP` ga `"fayl.jpeg": "kalit"` qo'shing.
3. `npm run images` — `public/img/` ga 480px va 1080px WebP chiqadi.
4. Kalitni `src/data/seed.ts` dagi rangning `photos` ro'yxatiga yozing (yoki admin panel orqali yuklang).

### Yangi video

```bash
swiftc -O scripts/compress_video.swift -o /tmp/compress
/tmp/compress originals/videos/IMG_XXXX.MOV public/videos/reel-3.mp4 originals/videos/reel-3.jpg 40
```

Keyin posterni `MAP` ga qo'shib `npm run images` qiling va `src/data/seed.ts` dagi `REELS` ga yozing. Asl `.MOV` fayllar `originals/` da turadi (saytga yuklanmaydi).
# Nazokat-Lady-shop
