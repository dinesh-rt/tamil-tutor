#!/usr/bin/env python3
"""Assemble the exact folder that goes to GitHub Pages → site/

    python3 tools/build-site.py              # build site/
    python3 tools/build-site.py --check      # build to a temp dir, report, discard
    python3 tools/build-site.py --out DIR    # build somewhere else (CI uses the default)

This is the *hosted* build, so it is deliberately not the portable one: the
files stay separate (per-file caching, and the worker can refresh quietly in the
background), and the real sw.js is shipped — the one that goes back to the
network instead of trusting a cache with no server behind it.

What it does that `cp -r` does not:
  * allow-list, not "everything" — dist/, tools/, README, OPEN-ME never ship;
  * audio/pack-index.js is left out on purpose: it exists for file:// where
    fetch() is blocked. Over http the app reads audio/manifest.json instead;
  * the recordings are verified against audio/manifest.json, because a site
    without them still works — it just starts speaking with the device voice,
    which is exactly the failure nobody notices until a phone sounds odd;
  * sw.js gets a content-hashed VERSION so every deploy actually replaces the
    cache on installed phones, and an identical rebuild does not.

Stdlib only, like the rest of the tooling.
"""
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, "audio")
DEFAULT_OUT = os.path.join(ROOT, "site")

# everything the browser is allowed to ask for. Anything else stays in git.
FILES = ["index.html", "manifest.webmanifest", "sw.js"]
TREES = ["css", "js", "icons"]
AUDIO_KEEP = re.compile(r"^audio/(?:[a-z]{2}/)?(?:[a-z]+/)?[^/]+\.mp3$")
AUDIO_ALWAYS = ["audio/manifest.json"]

# js/data/library.js points at words by id; every one of them must be a word
# the recordings actually cover, or a book page goes silent on a phone.
BOOK_FILE = os.path.join(ROOT, "js", "data", "library.js")
BOOK_REF = re.compile(r"(?:w|item|num):\s*'([a-z][a-z0-9-]*/[a-z0-9'’-]+)'")


def human(n):
    return "%.1f MB" % (n / 1048576) if n >= 1048576 else "%.0f KB" % (n / 1024)


def copy_tree(src, dst):
    n = 0
    for dirpath, _, files in os.walk(src):
        rel = os.path.relpath(dirpath, src)
        out = os.path.join(dst, rel)
        os.makedirs(out, exist_ok=True)
        for f in files:
            shutil.copy2(os.path.join(dirpath, f), os.path.join(out, f))
            n += 1
    return n


def dir_size(path):
    return sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(path) for f in fs)


def read_pack():
    """audio/manifest.json — the list of recordings the app will ask the server for."""
    p = os.path.join(AUDIO, "manifest.json")
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf-8") as fh:
        return json.load(fh)


def clip_paths(pack):
    """The mp3s audio/manifest.json promises, in the shape js/lib/audio.js asks for."""
    for wid, kinds in pack["files"].items():
        flat = wid.replace("/", "__")
        for kind in kinds:
            yield "audio/" + (("ta/say/" if kind == "say" else kind + "/") + flat + ".mp3")


def copy_audio(out, pack):
    """Copy the clips the manifest promises. Returns (files, bytes, missing)."""
    want = sorted(set(clip_paths(pack)))
    n, missing = 0, []
    for rel in want:
        src = os.path.join(ROOT, rel)
        if not os.path.exists(src):
            missing.append(rel)
            continue
        dst = os.path.join(out, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        n += 1
    for rel in AUDIO_ALWAYS:
        src = os.path.join(ROOT, rel)
        if os.path.exists(src):
            dst = os.path.join(out, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            n += 1
    return n, dir_size(os.path.join(out, "audio")) if os.path.isdir(os.path.join(out, "audio")) else 0, missing


def content_version(out):
    """Short hash over the app shell + the clip list.

    Deliberately excludes the mp3s themselves (they never change once made, and
    the worker caches them forever) but includes audio/manifest.json, so a
    regenerated voice pack still forces every device to refetch.
    """
    h = hashlib.sha256()
    targets = ["index.html", "manifest.webmanifest", "sw.js", "audio/manifest.json"]
    for tree in TREES:
        for dirpath, _, files in os.walk(os.path.join(ROOT, tree)):
            rel = os.path.relpath(dirpath, ROOT)
            targets += [os.path.join(rel, f) for f in sorted(files) if f.endswith((".js", ".css"))]
    for rel in sorted(targets):
        p = os.path.join(ROOT, rel)
        if not os.path.exists(p):
            continue
        h.update(rel.encode("utf-8"))
        with open(p, "rb") as fh:
            h.update(fh.read())
    return h.hexdigest()[:10]


def stamp_sw(out, version):
    """Rewrite VERSION in the *copy* — the working tree stays clean.
    Returns the old stamp, or None if the line wasn't there to find."""
    p = os.path.join(out, "sw.js")
    src = open(p, encoding="utf-8").read()
    cur = re.search(r"const VERSION = '([^']*)';", src)
    if not cur:
        return None
    open(p, "w", encoding="utf-8").write(src.replace(cur.group(0), "const VERSION = '%s';" % version))
    return cur.group(1)


def check_index(out):
    """Every <script src> / <link href> in index.html must exist in the folder."""
    html = open(os.path.join(out, "index.html"), encoding="utf-8").read()
    refs = set(re.findall(r'(?:src|href)="([^":#?]+)"', html))
    missing = [r for r in sorted(refs) if not os.path.exists(os.path.join(out, r.split("#")[0]))]
    return [r for r in missing if not r.startswith(("http", "data:", "mailto:"))]


def check_worker_precache(out):
    """The ASSETS list the worker precaches on install must all be real files."""
    src = open(os.path.join(out, "sw.js"), encoding="utf-8").read()
    m = re.search(r"const ASSETS = \[(.*?)\];", src, re.S)
    if not m:
        return []
    refs = re.findall(r"'([^']+)'", m.group(1))
    return [r for r in refs if not os.path.exists(os.path.join(out, r.rstrip("/") or "."))]


def check_books(pack):
    """Books reference word ids; the pack must have a clip for every one."""
    if not os.path.exists(BOOK_FILE):
        return ["js/data/library.js is missing — the shelf has nothing to show"]
    have = set(pack["files"].keys()) if pack else set()
    refs = sorted(set(BOOK_REF.findall(open(BOOK_FILE, encoding="utf-8").read())))
    if not refs:
        return ["no pages found in js/data/library.js — did the book list survive an edit?"]
    silent = [r for r in refs if r not in have]
    out = []
    if silent:
        out.append("%d of %d book words have no recording: %s"
                   % (len(silent), len(refs), ", ".join(silent[:6])))
    return out, len(refs)


def build(out, check_only=False):
    tmp = None
    if check_only:
        tmp = tempfile.mkdtemp(prefix="tt-site-")
        out = tmp
    elif os.path.isdir(out):
        shutil.rmtree(out)
    os.makedirs(out, exist_ok=True)

    fails = []

    for rel in FILES:
        src = os.path.join(ROOT, rel)
        if not os.path.exists(src):
            fails.append("missing %s" % rel)
            continue
        shutil.copy2(src, os.path.join(out, rel))
    for tree in TREES:
        src = os.path.join(ROOT, tree)
        if not os.path.isdir(src):
            fails.append("missing %s/" % tree)
            continue
        copy_tree(src, os.path.join(out, tree))

    pack = read_pack()
    if pack:
        clips, abytes, missing = copy_audio(out, pack)
        promised = sum(len(k) for k in pack["files"].values())
        if missing:
            fails.append("%d of %d promised recordings are absent (e.g. %s)"
                         % (len(missing), promised, missing[0]))
    else:
        clips, abytes, promised, missing = 0, 0, 0, []
        print("\n⚠️  no audio/manifest.json — this build has NO recordings.")
        print("   The app will fall back to the device voice. Make them with:")
        print("     python3 tools/make-voice-pack.py   then rebuild\n")

    bad_refs = check_index(out)
    if bad_refs:
        fails.append("index.html points at files that are not in the build: " + ", ".join(bad_refs[:5]))
    bad_assets = check_worker_precache(out)
    if bad_assets:
        fails.append("sw.js precaches files that are not in the build: " + ", ".join(bad_assets[:5]))

    book_refs = 0
    if pack:
        bad_books = check_books(pack)
        if isinstance(bad_books, tuple):
            bad_books, book_refs = bad_books
        for f in bad_books:
            fails.append("books: " + f)

    version = content_version(out)
    stamp_sw(out, "v" + version)

    total = dir_size(out)
    print("\n%s → %s" % ("check" if check_only else "site", os.path.relpath(out, ROOT) if not check_only else "(temp)"))
    print("  shell     index.html + css/ + js/ + %d icons + manifest.webmanifest"
          % len(os.listdir(os.path.join(out, "icons"))))
    print("  worker    sw.js  VERSION = 'v%s'   (cache tamil-tutor-v%s)" % (version, version))
    print("  audio     %d files, %s  (%d clips / %d words)"
          % (clips, human(abytes), promised, len(pack["files"]) if pack else 0))
    if book_refs:
        print("  books     %d word references checked against the pack" % book_refs)
    print("  total     %s" % human(total))

    if fails:
        print("\n❌ %d problem(s)" % len(fails))
        for f in fails:
            print("   ✗ " + f)
    else:
        print("\n✅ ready to publish — https://<user>.github.io/<repo>/")

    if tmp:
        shutil.rmtree(tmp, ignore_errors=True)
    return 1 if fails else 0


def main():
    args = sys.argv[1:]
    out = DEFAULT_OUT
    if "--out" in args:
        i = args.index("--out")
        if i + 1 >= len(args):
            print("--out needs a folder"); return 2
        out = os.path.abspath(args[i + 1])
    return build(out, check_only="--check" in args)


if __name__ == "__main__":
    sys.exit(main())
