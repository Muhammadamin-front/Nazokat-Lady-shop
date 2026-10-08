import type { NextConfig } from "next";

// Sahifalar build vaqtida statik tayyorlanadi; /api/order esa serverda ishlaydi
// (Telegram bot tokeni brauzerga hech qachon chiqmasligi uchun). Hosting: Vercel yoki istalgan Node server.
const nextConfig: NextConfig = {
  images: { unoptimized: true },
};

export default nextConfig;
