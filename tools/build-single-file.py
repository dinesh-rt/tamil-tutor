#!/usr/bin/env python3
"""Bundle the whole app into ONE html file you can email or drop on any web server.

    python3 tools/build-single-file.py [outfile]

Writes dist/tamil-tutor.html with the CSS and all the JavaScript inlined.
Still no build step for development — this is only for sharing a single file.
"""
import datetime
import os
import re
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "dist")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(OUT_DIR, "tamil-tutor.html")

def from_index():
    """Which css and js go into the bundle is read out of index.html.

    This list used to be written out a second time here. When the Books tab
    landed it was added to the app and not to this copy, so the shareable
    single-file build silently shipped with no shelf at all — double-clicking
    the file gave you a Tamil tutor you could not read books in, and no tool
    complained. One list, in the file the browser already obeys.
    """
    html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    js = [s for s in re.findall(r'<script[^>]*src="([^"]+)"', html, re.I) if s.endswith(".js")]
    css = [s for s in re.findall(r'<link[^>]*href="([^"]+)"', html, re.I) if s.endswith(".css")]
    if not js or not css:
        sys.exit("index.html handed me nothing to inline — have its tags changed shape?")
    return css, js


CSS, JS = from_index()


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

    # script preloads name files a bundle does not have — and they are wrong for
    # both builds, since both inline their scripts. Only icon preloads survive,
    # and only in the installable build.
    html = re.sub(r'\s*<link[^>]*rel="preload"[^>]*as="script"[^>]*>', "", html)
    html = re.sub(r'\s*<link[^>]*as="script"[^>]*rel="preload"[^>]*>', "", html)

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
    # The bundle is one file: it has no images beside it, so tell the app not to
    # go looking. Without this the shelf asks for ten covers that cannot exist,
    # falls back to the emoji as designed, and leaves ten console errors behind
    # — noise that hides the failures worth reading.
    html, total_js = build_html('<script>window.TT_SINGLE_FILE = true;</script>')

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(html)

    kb = os.path.getsize(OUT) / 1024
    print(f"wrote {os.path.relpath(OUT, ROOT)}  ({kb:.0f} KB, js {total_js/1024:.0f} KB)")
    print("open it straight from disk — double-click and it runs")


if __name__ == "__main__":
    main()
