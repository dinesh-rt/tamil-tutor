#!/usr/bin/env python3
"""Narrate the ten Tamil Tutor story-books, one clip per page.

    python3 tools/make-story-pack.py                  # every story, every page
    python3 tools/make-story-pack.py --only neela-nari
    python3 tools/make-story-pack.py --dry-run        # what would be made, no network
    python3 tools/make-story-pack.py --manifest-only  # re-measure, re-index, no TTS

Edge's neural Tamil voice reads one page per line (the same free pipeline
make-voice-pack.py uses for words), ffprobe measures each clip, and everything
is described by  audio/books/manifest.json — which is also the switch that puts
the stories on the shelf. Until that file exists the ten stories are registered
but hidden, because a story with no audio is a silent screen a two-year-old taps
at, and no amount of pretty art fixes that.

Files land in  audio/books/<id>/p01-<hash>.mp3 … p-moral-<hash>.mp3

The hash is the first four of the line's text, so re-narrating a page that was
edited produces a *new filename*. That matters: the worker caches /audio/
forever by URL, so a clip that keeps its name would keep its old voice on every
installed phone for the rest of time. New text, new name, new download.

Stdlib + edge-tts (installed into tools/.venv-tts on first run).
"""
import argparse
import asyncio
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOKS = os.path.join(ROOT, "audio", "books")
MANIFEST = os.path.join(BOOKS, "manifest.json")
VENV = os.path.join(ROOT, "tools", ".venv-tts")
CANDIDATE_VENVS = [VENV, os.path.expanduser("~/ttsvenv"), "/tmp/ttsvenv", "/tmp/tt-tts"]

DEFAULT_TA = "ta-IN-PallaviNeural"
DEFAULT_RATE = "-15%"          # story time, not word time


# ----------------------------------------------------------------- interpreter
def have_edge_tts():
    try:
        import edge_tts  # noqa: F401
        return True
    except Exception:
        return False


def ensure_edge_tts(bootstrap=True):
    if have_edge_tts():
        return
    for cand in CANDIDATE_VENVS:
        py = os.path.join(cand, "bin", "python")
        if os.path.exists(py) and subprocess.call(
            [py, "-c", "import edge_tts"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        ) == 0:
            os.execv(py, [py] + sys.argv)
    if not bootstrap:
        sys.exit("edge-tts is not installed. Run: python3 -m venv tools/.venv-tts "
                 "&& tools/.venv-tts/bin/pip install edge-tts")
    print("first run — creating tools/.venv-tts and installing edge-tts (~15 s)")
    if not os.path.isdir(VENV):
        subprocess.check_call([sys.executable, "-m", "venv", VENV])
    subprocess.check_call([os.path.join(VENV, "bin", "pip"), "install", "--quiet", "--upgrade", "edge-tts"])
    os.execv(os.path.join(VENV, "bin", "python"), [os.path.join(VENV, "bin", "python")] + sys.argv)


def load_stories():
    out = subprocess.check_output(["node", os.path.join(ROOT, "tools", "story-list.js")], cwd=ROOT)
    return json.loads(out.decode("utf-8"))


def duration(path):
    try:
        out = subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
            stderr=subprocess.DEVNULL).decode().strip()
        return round(float(out), 2)
    except Exception:
        return 0.0


def clip_name(page, i):
    text = (page.get("ta") or "").strip()
    h = hashlib.sha1((text + "|" + page["k"]).encode("utf-8")).hexdigest()[:4]
    base = "p-moral" if page["k"] == "moral" else "p%02d" % (i + 1)
    return "%s-%s.mp3" % (base, h)


# ------------------------------------------------------------------- generator
async def synth_one(edge_tts, text, voice, rate, out_file, sem, tries=3):
    if os.path.exists(out_file) and os.path.getsize(out_file) > 800:
        return "skip"
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    async with sem:
        for attempt in range(tries):
            try:
                com = edge_tts.Communicate(text, voice=voice, rate=rate)
                await com.save(out_file)
                if os.path.exists(out_file) and os.path.getsize(out_file) > 400:
                    return "ok"
                raise RuntimeError("empty file")
            except Exception as exc:
                if attempt == tries - 1:
                    return "fail:%s" % exc
                await asyncio.sleep(0.8 * (attempt + 1) ** 2)
    return "fail"


async def generate(stories, voice, rate, jobs, force):
    import edge_tts
    sem = asyncio.Semaphore(jobs)
    tasks, meta = [], []
    for b in stories:
        for i, p in enumerate(b["pages"]):
            if not (p.get("ta") or "").strip():
                continue
            name = clip_name(p, i)
            out_file = os.path.join(BOOKS, b["id"], name)
            if force and os.path.exists(out_file):
                os.remove(out_file)
            tasks.append(synth_one(edge_tts, p["ta"], voice, rate, out_file, sem))
            meta.append((b["id"], name))

    done = skipped = failed = 0
    failures = []
    t0 = datetime.datetime.now()
    for fut in asyncio.as_completed(tasks):
        res = await fut
        if res == "ok":
            done += 1
        elif res == "skip":
            skipped += 1
        else:
            failed += 1
            failures.append(res)
        n = done + skipped + failed
        if n % 10 == 0 or n == len(tasks):
            secs = (datetime.datetime.now() - t0).total_seconds() or 1
            per = n / secs
            eta = int((len(tasks) - n) / per) if per else 0
            print("  %4d/%-4d  new %-4d existing %-5d failed %-4d  %.2f/s  eta %dm%02ds"
                  % (n, len(tasks), done, skipped, failed, per, eta // 60, eta % 60), flush=True)
    for f in failures[:5]:
        print("   ✗ " + f)
    return done, skipped, failed


def write_manifest(stories, voice, rate):
    """Index what is actually on disk — a half-made story stays half-made."""
    out = {}
    missing = []
    for b in stories:
        rows, ok = [], True
        for i, p in enumerate(b["pages"]):
            name = clip_name(p, i)
            f = os.path.join(BOOKS, b["id"], name)
            have = os.path.exists(f) and os.path.getsize(f) > 400
            if not have:
                ok = False
                missing.append("%s/%s" % (b["id"], name))
            # always a row, even when the clip is absent: the app matches pages
            # to entries by position, so a skipped row would shift every page
            # after it onto the wrong voice
            rows.append({"file": name, "k": p["k"], "dur": duration(f) if have else 0,
                         "chars": len((p.get("ta") or "").strip())})
        if rows:
            out[b["id"]] = {"title": b["ta"], "en": b["en"], "complete": ok, "pages": rows}
        # an incomplete story is described but not trusted — see library.js
    man = {
        "version": 1,
        "generated": datetime.datetime.now().isoformat(timespec="seconds"),
        "voice": voice,
        "rate": rate,
        "books": out,
    }
    os.makedirs(BOOKS, exist_ok=True)
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        json.dump(man, fh, ensure_ascii=False, indent=1)
    return man, missing


def human(n):
    return "%.1f MB" % (n / 1048576) if n >= 1048576 else "%.0f KB" % (n / 1024)


def total_size():
    return sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(BOOKS) for f in fs)


def prune(stories, man):
    """Delete clips the manifest does not name.

    Re-narrating an edited page produces a new filename by design — the worker
    caches /audio/ forever by URL, so an edited line has to change its name or
    every installed phone keeps the old voice for the rest of time. That is
    correct for the cache and messy for the disk: the previous generation of
    clips just sits there, and build-site.py copies whatever is in the folder,
    so a re-narrated book ships two readings of every page and the service
    worker precaches both.

    Only a clip-shaped filename goes, only inside a book's own folder, and only
    when the manifest is not asking for it. The manifest always carries a row
    for every page even when the clip is missing, so "not named" genuinely means
    "nothing on this shelf refers to it".
    """
    want = {b: {r["file"] for r in man["books"].get(b, {}).get("pages", [])}
            for b in man.get("books", {})}
    gone = kept = bytes_gone = 0
    for bid in os.listdir(BOOKS):
        d = os.path.join(BOOKS, bid)
        if not os.path.isdir(d):
            continue
        for f in sorted(os.listdir(d)):
            if not re.match(r"^p(-moral|\d\d)-[0-9a-f]{4}\.mp3$", f):
                continue
            p = os.path.join(d, f)
            if f in want.get(bid, set()):
                kept += 1
                continue
            bytes_gone += os.path.getsize(p)
            os.remove(p)
            gone += 1
    return gone, kept, bytes_gone


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="one story id")
    ap.add_argument("--voice", default=DEFAULT_TA)
    ap.add_argument("--rate", default=DEFAULT_RATE, help="e.g. -15%% for story time, 0%% for news-reader speed")
    ap.add_argument("--jobs", type=int, default=6)
    ap.add_argument("--force", action="store_true", help="re-narrate even if the clip exists")
    ap.add_argument("--manifest-only", action="store_true", help="no network: re-measure and rewrite the manifest")
    ap.add_argument("--prune", action="store_true",
                    help="after indexing, delete clip files the manifest does not name "
                         "(the old generation left behind by re-narrating an edited line)")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    stories = load_stories()
    if a.only:
        stories = [b for b in stories if b["id"] == a.only]
        if not stories:
            sys.exit("no such story: %s" % a.only)

    lines = sum(len(b["pages"]) for b in stories)
    chars = sum(len((p.get("ta") or "").strip()) for b in stories for p in b["pages"])
    print("%d stories, %d lines, %d characters of Tamil" % (len(stories), lines, chars))

    if a.dry_run:
        for b in stories:
            print("\n%s  %s  (%d pages)" % (b["icon"], b["ta"], len(b["pages"])))
            for i, p in enumerate(b["pages"]):
                print("   %-14s %s" % (clip_name(p, i), (p["ta"] or "")[:64]))
        return

    if not a.manifest_only:
        ensure_edge_tts()

    if not a.manifest_only:
        done, skipped, failed = asyncio.get_event_loop().run_until_complete(
            generate(stories, a.voice, a.rate, a.jobs, a.force))
        print("narrated %d new, %d already there, %d failed" % (done, skipped, failed))

    man, missing = write_manifest(stories, a.voice, a.rate)
    ready = [k for k, v in man["books"].items() if v["complete"]]
    secs = sum(p["dur"] for v in man["books"].values() for p in v["pages"])
    print("\naudio/books/manifest.json")
    print("  voice     %s  rate %s" % (man["voice"], man["rate"]))
    print("  stories   %d complete of %d described" % (len(ready), len(man["books"])))
    print("  audio     %s  ·  %.0f min of narration" % (human(total_size()), secs / 60))
    if missing:
        print("  ⚠️  %d clips absent — those stories stay off the shelf, e.g. %s"
              % (len(missing), missing[0]))
    else:
        print("\n✅ every page narrated — the ten stories appear on the shelf at #/library")

    if a.prune:
        gone, kept, bytes_gone = prune(stories, man)
        print("\nprune       %d clips kept, %d old clips deleted (%s reclaimed)"
              % (kept, gone, human(bytes_gone)))
        if gone == 0:
            print("            nothing to reclaim — every clip on disk is the current reading")


if __name__ == "__main__":
    main()
