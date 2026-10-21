#!/usr/bin/env python3
"""Bundle the whole app into ONE html file you can email or drop on any web server.

    python3 tools/build-single-file.py [outfile]

Writes dist/tamil-tutor.html with the CSS and all the JavaScript inlined.
Still no build step for development — this is only for sharing a single file.
"""
import datetime
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "dist")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(OUT_DIR, "tamil-tutor.html")

CSS = ["css/app.css", "css/animations.css"]
JS = [
    "js/lib/util.js",
    "js/lib/sprites.js",
    "js/data/core.js",
    "js/data/nature.js",
    "js/data/food.js",
    "js/data/home.js",
    "js/data/people.js",
    "js/data/mind.js",
    "js/data/play.js",
    "js/lib/audio.js",
    "js/lib/storage.js",
    "js/lib/confetti.js",
    "js/ui.js",
    "js/app.js",
    "js/views/learn.js",
    "js/views/games.js",
    "js/views/stickers.js",
    "js/views/grownup.js",
]


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
        return fh.read()


def build_html(extra_head="", keep_pwa=False):
    """Return the whole app as one HTML string. `extra_head` is injected in <head>.
    `keep_pwa=True` leaves the manifest/icon links in place (the installable
    portable build). Shared by tools/build-portable.py so both builds match."""
    html = read("index.html")

    if not keep_pwa:
        # drop the PWA bits that only make sense when the files are separate
        html = re.sub(r'\s*<link rel="manifest"[^>]*>', "", html)
        html = re.sub(r'\s*<link rel="icon"[^>]*>', "", html)
        html = re.sub(r'\s*<link rel="apple-touch-icon"[^>]*>', "", html)
        html = re.sub(r'\s*<link rel="preload"[^>]*>', "", html)

    for rel in CSS:
        tag = f'<link rel="stylesheet" href="{rel}">'
        assert tag in html, f"stylesheet tag not found for {rel}"
        html = html.replace(
            tag,
            f"<style>\n/* ===== {rel} ===== */\n{read(rel)}\n</style>",
        )

    total_js = 0
    for rel in JS:
        tag = f'<script src="{rel}"></script>'
        assert tag in html, f"script tag not found for {rel}"
        body = read(rel)
        total_js += len(body)
        # a literal </script> inside a string would end the block early
        body = body.replace("</script", "<\\/script")
        html = html.replace(tag, f"<script>\n/* ===== {rel} ===== */\n{body}\n</script>")

    stamp = datetime.date.today().isoformat()
    html = html.replace(
        "<title>",
        f"<!-- Single-file build of தமிழ் Tutor — generated {stamp}. Open it directly, it works with no server. -->\n{extra_head}\n<title>",
        1,
    )
    return html, total_js


def main():
    html, total_js = build_html()

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(html)

    kb = os.path.getsize(OUT) / 1024
    print(f"wrote {os.path.relpath(OUT, ROOT)}  ({kb:.0f} KB, js {total_js/1024:.0f} KB)")
    print("open it straight from disk — double-click and it runs")


if __name__ == "__main__":
    main()
