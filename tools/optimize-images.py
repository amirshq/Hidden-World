#!/usr/bin/env python3
"""Build responsive copies of every photo in assets/ into assets/opt/.

For each source JPEG it writes WebP + JPEG at 800 / 1600 / 2400 px wide,
skipping any width larger than the original (never upscales) and adding the
original width when it falls between steps. Portraits also get a 400 px copy.

    python3 tools/optimize-images.py

Re-run after adding or replacing a photo in assets/.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets"
OUT = SRC / "opt"
STEPS = (800, 1600, 2400)
SMALL = {"ali", "amir"}          # portraits: shown small, so add 400 px


def widths_for(name, w):
    steps = ((400,) if name in SMALL else ()) + STEPS
    out = [s for s in steps if s <= w]
    if w < STEPS[-1] and w not in out:
        out.append(w)
    return sorted(set(out))


def main():
    OUT.mkdir(exist_ok=True)
    for src in sorted(SRC.glob("*.jpg")):
        name = src.stem
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        w, h = im.size
        ws = widths_for(name, w)
        for tw in ws:
            th = round(h * tw / w)
            r = im if tw == w else im.resize((tw, th), Image.LANCZOS)
            r.save(OUT / f"{name}-{tw}.webp", "WEBP", quality=80, method=6)
            r.save(OUT / f"{name}-{tw}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
        print(f"{name:16} {w}x{h}  ->  {', '.join(map(str, ws))}")


if __name__ == "__main__":
    main()
