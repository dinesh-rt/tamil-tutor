#!/usr/bin/env python3
"""Make the PNG app icons (no external assets needed).

    python3 tools/make-icons.py

Draws the same friendly elephant as icons/icon.svg with plain PIL shapes at
4x, then downsamples for clean edges.
"""
import os
import math

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "icons")


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def vertical_gradient(size, top, bottom, radius):
    """Rounded square with a soft diagonal gradient."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    n = 48  # build the gradient small, then blow it up — smooth and fast
    base = Image.new("RGB", (n, n))
    pd = base.load()
    for y in range(n):
        for x in range(n):
            pd[x, y] = lerp(top, bottom, (x + y) / (2.0 * (n - 1)))
    base = base.resize((size, size), Image.BILINEAR)
    d = ImageDraw.Draw(base)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    img.paste(base, (0, 0), mask)
    return img


def draw_icon(size):
    s = size / 512.0
    img = vertical_gradient(size, (255, 232, 150), (255, 178, 205), int(112 * s))
    d = ImageDraw.Draw(img)

    def circle(cx, cy, r, fill):
        d.ellipse([(cx - r) * s, (cy - r) * s, (cx + r) * s, (cy + r) * s], fill=fill)

    # sun
    circle(410, 96, 54, (255, 243, 196, 230))
    circle(410, 96, 34, (255, 207, 63, 255))

    # ears
    circle(150, 230, 92, (140, 118, 220, 255))
    circle(362, 230, 92, (140, 118, 220, 255))
    circle(150, 230, 58, (246, 184, 205, 255))
    circle(362, 230, 58, (246, 184, 205, 255))

    # head
    d.rounded_rectangle([146 * s, 238 * s, 366 * s, 418 * s], radius=90 * s, fill=(105, 84, 190, 255))

    # trunk: a curve of shrinking circles
    for i in range(26):
        t = i / 25.0
        x = 256 + 42 * math.sin(t * 1.9)
        y = 330 + 118 * t
        r = 30 - 18 * t
        circle(x, y, r, (90, 70, 165, 255))

    # tusk
    d.line([(232 * s, 372 * s), (228 * s, 424 * s), (252 * s, 440 * s)], fill=(255, 255, 255, 235), width=int(17 * s), joint="curve")

    # eyes + shine
    circle(206, 296, 19, (36, 26, 61, 255))
    circle(306, 296, 19, (36, 26, 61, 255))
    circle(212, 290, 6, (255, 255, 255, 255))
    circle(312, 290, 6, (255, 255, 255, 255))

    # cheeks
    circle(176, 344, 18, (249, 115, 22, 90))
    circle(336, 344, 18, (249, 115, 22, 90))

    # marigold dots along the bottom
    for cx, cy, r, c in [(118, 440, 17, (22, 163, 74, 255)), (158, 452, 13, (239, 68, 68, 255)), (196, 440, 15, (14, 165, 233, 255))]:
        circle(cx, cy, r, c)

    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    big = draw_icon(512 * 4)
    for target in (512, 192, 180, 152, 144, 96, 72, 48):
        img = big.resize((target, target), Image.LANCZOS)
        path = os.path.join(OUT, f"icon-{target}.png")
        img.save(path, "PNG", optimize=True)
        print("wrote", os.path.relpath(path, ROOT))
    big.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, "icon-512.png"), "PNG", optimize=True)
    # a maskable version with extra padding
    maskable = Image.new("RGBA", (512, 512), (255, 241, 199, 255))
    art = big.resize((380, 380), Image.LANCZOS)
    maskable.alpha_composite(art, (66, 66))
    maskable.save(os.path.join(OUT, "icon-maskable-512.png"), "PNG", optimize=True)
    print("wrote", os.path.relpath(os.path.join(OUT, "icon-maskable-512.png"), ROOT))


if __name__ == "__main__":
    main()
