"""Mahsulot rasmlarini sayt uchun tayyorlaydi.

public/products/ dagi asl rasmlardan public/img/ ga ikki o'lchamdagi WebP
(480px — kartochka, 1080px — to'liq ko'rinish) va src/data/images.json ga
o'lcham + juda kichik xira oldindan-ko'rinish (LQIP) yozadi.

Yangi rasm qo'shish: faylni public/products/ ga tashlang, quyidagi MAP ga
"fayl nomi": "kalit" qo'shing, `npm run images` ni ishga tushiring va
kalitni src/lib/products.ts dagi rangga yozing.
"""

import base64
import io
import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "products"
OUT = ROOT / "public" / "img"
DATA = ROOT / "src" / "data" / "images.json"

MAP = {
    "photo_2026-10-08 17.17.43.jpeg": "kardigan-brown-1",
    "1.jpg": "kardigan-brown-2",
    "2.jpg": "kardigan-black-1",
    "photo_2026-10-08 17.17.48.jpeg": "kardigan-white-1",
    "photo_2026-10-08 17.17.50.jpeg": "kardigan-white-2",
    "photo_2026-10-08 17.17.56.jpeg": "peplum-bordo-1",
    "photo_2026-10-08 17.18.01.jpeg": "kombinezon-1",
    "photo_2026-10-08 17.18.03.jpeg": "velur-grey-1",
    "photo_2026-10-08 17.18.06.jpeg": "velur-black-1",
    "photo_2026-10-08 17.18.08.jpeg": "velur-navy-1",
    "photo_2026-10-08 17.18.11.jpeg": "tunika-grey-1",
    "photo_2026-10-08 17.18.14.jpeg": "tunika-navy-1",
    "photo_2026-10-08 17.18.17.jpeg": "tunika-black-1",
    "photo_2026-10-08 17.18.20.jpeg": "tunika-bordo-1",
    # sumkalar (2 dona to'plam)
    "photo_2026-10-08 17.25.51.jpeg": "oy-black-1",
    "photo_2026-10-08 17.25.58.jpeg": "oy-pink-1",
    "photo_2026-10-08 17.26.01.jpeg": "oy-brown-1",
    "photo_2026-10-08 17.26.02.jpeg": "oy-beige-1",
    "photo_2026-10-08 17.26.06.jpeg": "kroko-blue-1",
    "photo_2026-10-08 17.26.08.jpeg": "kroko-pink-1",
    "photo_2026-10-08 17.26.12.jpeg": "kroko-black-1",
    "photo_2026-10-08 17.26.13.jpeg": "kroko-cream-1",
    "photo_2026-10-08 17.26.05.jpeg": "oq-white-1",
    "photo_2026-10-08 17.26.09.jpeg": "oq-white-2",
    "photo_2026-10-08 17.26.03.jpeg": "egar-white-1",
    "photo_2026-10-08 17.25.57.jpeg": "harf-black-1",
    "photo_2026-10-08 17.26.10.jpeg": "harf-beige-1",
    "photo_2026-10-08 17.26.17.jpeg": "tor-cream-1",
    "photo_2026-10-08 17.26.19.jpeg": "tor-pink-1",
    "photo_2026-10-08 17.26.20.jpeg": "zanjir-bordo-1",
    "photo_2026-10-08 17.25.55.jpeg": "toqima-red-1",
    "photo_2026-10-08 17.26.16.jpeg": "yorqin-red-1",
    "photo_2026-10-08 17.26.15.jpeg": "tolqin-brown-1",
    "photo_2026-10-08 17.25.49.jpeg": "halqa-beige-1",
    "photo_2026-10-08 17.25.59.jpeg": "qovurga-black-1",
    # video posterlari (scripts/compress_video.swift chiqaradi) — loyiha ildiziga nisbatan yo'l
    "originals/videos/reel-1.jpg": "reel-1",
    "originals/videos/reel-2.jpg": "reel-2",
    # qishki kolleksiya (2024-12 rasmlari) — #79 #38 ning nusxasi, olinmadi
    "photo_2024-12-17_15-16-45.jpg": "postin-brown-2",
    "photo_2024-12-18_10-16-05.jpg": "postin-gold-1",
    "photo_2024-12-18_10-16-06.jpg": "postin-brown-1",
    "photo_2024-12-18_10-16-08.jpg": "postin-bordo-1",
    "photo_2024-12-18_10-16-10.jpg": "postin-mokko-1",
    "photo_2024-12-18_10-16-12.jpg": "postin-zebra-1",
    "photo_2024-12-18_10-18-11.jpg": "set3-black-1",
    "photo_2024-12-18_10-18-13.jpg": "set3-green-1",
    "photo_2024-12-18_10-18-14.jpg": "set3-grey-1",
    "photo_2024-12-18_10-18-16.jpg": "set3-beige-1",
    "photo_2024-12-18_10-18-17.jpg": "set3-navy-1",
    "photo_2024-12-18_10-18-24.jpg": "set3-brown-1",
    "photo_2024-12-18_10-18-25.jpg": "set3-mustard-1",
    "photo_2024-12-18_10-28-24.jpg": "kurtka-green-1",
    "photo_2024-12-18_10-28-28.jpg": "kurtka-pink-1",
    "photo_2024-12-18_10-28-31.jpg": "kurtka-teal-1",
    "photo_2024-12-18_10-28-33.jpg": "kurtka-plum-1",
    "photo_2024-12-18_10-28-36.jpg": "kurtka-grey-1",
    "photo_2024-12-18_10-33-12.jpg": "velpalto-plum-1",
    "photo_2024-12-18_10-33-15.jpg": "velpalto-plum-2",
    "photo_2024-12-18_10-33-18.jpg": "velpalto-blue-1",
    "photo_2024-12-18_10-43-46.jpg": "leokurtka-brown-1",
    "photo_2024-12-18_10-43-50.jpg": "leokurtka-black-1",
    "photo_2024-12-18_10-43-54.jpg": "leokurtka-beige-1",
    "photo_2024-12-18_12-30-41.jpg": "uzunkard-khaki-1",
    "photo_2024-12-18_12-30-50.jpg": "uzunkard-mokko-1",
    "photo_2024-12-18_12-30-51.jpg": "uzunkard-khaki-2",
    "photo_2024-12-18_12-30-52.jpg": "uzunkard-terra-1",
    "photo_2024-12-18_12-30-53.jpg": "uzunkard-navy-1",
    "photo_2024-12-18_15-33-18.jpg": "tufli-bant-1",
    "photo_2024-12-18_15-38-35.jpg": "tufli-moyna-1",
    "photo_2024-12-19_12-50-57.jpg": "pufer-cream-1",
    "photo_2024-12-19_12-51-00.jpg": "pufer-duo-1",
    "photo_2024-12-19_12-51-15.jpg": "pufer-cream-2",
    "photo_2024-12-20_09-15-07.jpg": "chiziq-beige-1",
    "photo_2024-12-20_09-15-08.jpg": "chiziq-brown-1",
    "photo_2024-12-20_09-15-10.jpg": "chiziq-olive-1",
    "photo_2024-12-20_09-27-40.jpg": "palto-red-1",
    "photo_2024-12-20_09-34-51.jpg": "jinsi-cream-3",
    "photo_2024-12-20_09-34-54.jpg": "jinsi-cream-2",
    "photo_2024-12-20_09-34-55.jpg": "jinsi-cream-1",
    "photo_2024-12-20_09-47-29.jpg": "jinsi-grey-1",
    "photo_2024-12-20_09-47-30.jpg": "jinsi-grey-3",
    "photo_2024-12-20_09-47-33 (2).jpg": "jinsi-grey-4",
    "photo_2024-12-20_09-47-33.jpg": "jinsi-grey-2",
    "photo_2024-12-20_09-55-13.jpg": "kapkofta-mint-1",
    "photo_2024-12-20_09-55-15.jpg": "orma-lilac-1",
    "photo_2024-12-20_09-55-17.jpg": "orma-cream-1",
    "photo_2024-12-20_10-46-48.jpg": "marjon-white-1",
    "photo_2024-12-20_10-46-52.jpg": "marjon-beige-1",
    "photo_2024-12-20_10-46-53.jpg": "marjon-grey-1",
    "photo_2024-12-20_10-46-54.jpg": "marjonv-1",
    "photo_2024-12-20_11-10-56.jpg": "jogger-black-1",
    "photo_2024-12-20_11-11-12.jpg": "jeans-grey-1",
    "photo_2024-12-20_11-57-37.jpg": "marjonkard-white-1",
    "photo_2024-12-20_11-57-40.jpg": "marjonkard-grey-1",
    "photo_2024-12-20_15-39-05.jpg": "chiziq-beige-2",
    "photo_2024-12-20_15-47-23.jpg": "yoqali-cream-1",
    "photo_2024-12-22_09-57-47.jpg": "palto-mint-1",
    "photo_2024-12-22_09-57-48.jpg": "palto-mint-3",
    "photo_2024-12-22_09-57-49.jpg": "palto-mint-2",
    "photo_2024-12-22_10-00-54.jpg": "palto-green-2",
    "photo_2024-12-22_10-02-09.jpg": "palto-green-1",
    "photo_2024-12-22_10-02-10.jpg": "palto-green-3",
    "photo_2024-12-22_10-02-11.jpg": "botinka-green-1",
    "photo_2024-12-22_10-03-44.jpg": "palto-fuchsia-1",
    "photo_2024-12-22_10-05-31.jpg": "palto-black-1",
    "photo_2024-12-22_10-05-32.jpg": "palto-black-2",
    "photo_2024-12-22_10-07-43.jpg": "palto-camel-1",
    "photo_2024-12-22_10-08-51.jpg": "gulli-cream-1",
    "photo_2024-12-22_10-08-52.jpg": "gulli-white-1",
    "photo_2024-12-22_10-08-53.jpg": "gulli-white-2",
    "photo_2024-12-22_10-08-56.jpg": "gorlo-lav-1",
    "photo_2024-12-22_10-08-57.jpg": "gorlo-fuchsia-1",
    "photo_2024-12-22_10-09-00.jpg": "gorlo-green-1",
    "photo_2024-12-22_10-09-02.jpg": "gorlo-white-1",
    "photo_2024-12-22_10-13-10.jpg": "botinka-black-1",
    "photo_2024-12-22_10-13-11.jpg": "beret-green-1",
    "photo_2024-12-22_10-23-12.jpg": "palto-brown-1",
    "photo_2024-12-22_10-23-40.jpg": "hijob-1",
}
SIZES = {"sm": 480, "lg": 1080}


def lqip(im: Image.Image) -> str:
    small = im.copy()
    small.thumbnail((12, 16))
    buf = io.BytesIO()
    small.save(buf, "JPEG", quality=50)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    DATA.parent.mkdir(parents=True, exist_ok=True)
    meta = {}
    for name, key in MAP.items():
        path = ROOT / name if "/" in name else SRC / name
        im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        for suffix, width in SIZES.items():
            out = im.copy()
            if out.width > width:
                out = out.resize((width, round(out.height * width / out.width)), Image.LANCZOS)
            out.save(OUT / f"{key}-{suffix}.webp", "WEBP", quality=72, method=6)
        meta[key] = {"w": im.width, "h": im.height, "lqip": lqip(im)}
        print(f"{key:20} {im.width}x{im.height}")
    DATA.write_text(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main()
