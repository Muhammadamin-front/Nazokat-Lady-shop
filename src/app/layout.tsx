import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

// Shrift build vaqtida yuklab olinadi va saytning o'zidan beriladi (Google'ga so'rov ketmaydi).
const display = Fraunces({ subsets: ["latin"], weight: ["600"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Nazokat Lady Shop — Hammasi 75 000 so'm",
  description: "Quvadagi ayollar butigi. Kardiganlar, kostyumlar va uy kiyimlari — hammasi 75 000 so'm. Instagram: @NazokatLadyShop",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Nazokat Lady Shop — Hammasi 75 000 so'm",
    description: "Quva. Kardiganlar, kostyumlar va uy kiyimlari bitta narxda.",
    images: ["/img/kardigan-brown-1-lg.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f2ed",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Birinchi chizilishdan oldin harakat darajasi va tarmoq tezligini belgilaydi
const motionScript = `(function(){try{var d=document.documentElement,c=navigator.connection,
r=matchMedia('(prefers-reduced-motion: reduce)').matches,
slow=!!(c&&(c.saveData||/2g/.test(c.effectiveType))),
weak=(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2);
d.dataset.motion=r?'off':(slow||weak||(c&&c.effectiveType==='3g'))?'lite':'full';
d.dataset.net=slow?'slow':'ok';
if(!r&&location.pathname==='/'&&!sessionStorage.getItem('nazokat:intro'))d.dataset.intro='play';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={display.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
