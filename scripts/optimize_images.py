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
