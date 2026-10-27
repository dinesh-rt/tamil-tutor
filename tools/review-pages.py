#!/usr/bin/env python3
"""Look at every rendered page and say which ones a human should actually check.

This cannot see. It measures. `metrics()` was written for exactly this: a batch
of 83 generated frames is too many for an eye to sit with, so the cheap
objective signals decide who gets looked at, and the flat-cream-background
number (bg_dev) is the one that catches a frame where the model painted a
sunset, a sky or a glow instead of the plain paper the shelf is built on.

  python3 tools/review-pages.py            # report on what is rendered
  python3 tools/review-pages.py --promote  # ...and flatten the good ones to webp

bg_dev is measured on the raw render, *before* flatten_image snaps the paper
to one colour, because that is the only moment a bad background can be caught.
"""
import importlib.util
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOKS = os.path.join(ROOT, "images", "books")

_spec = importlib.util.spec_from_file_location("msa", os.path.join(ROOT, "tools", "make-story-art.py"))
msa = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(msa)

# a render whose paper is not flat is the one failure mode that makes a book
# look generated; everything else is a matter of taste
BG_LIMIT = msa.BG_LIMIT


def fix(bid, key, prompt, tries, w, h, steps):
    """Render one frame until its paper comes out flat, then promote that one.

    The tempting fix is more words in the prompt — "no scenery, no ground, no
    sky" — and the log says that does very little: a prompt the model reads as a
    *place* wins over a negative it reads as an instruction. A different seed
    starts the sampler somewhere else entirely and works far more often, so the
    loop varies the seed and leaves the words alone.

    It stops at the first frame that passes. That is the whole point: a hand
    check of 83 frames is not going to happen, so the objective gate picks.
    """
    base = msa.page_seed(bid)
    for n in range(tries):
        seed = base + (0 if n == 0 else (n * 7919) % 60000)
        got = msa.one(msa.PAGE_STYLE, prompt, w, h, seed, steps, BOOKS,
                      "page_%s_%s" % (bid, key), 900)
        if not got:
            continue
        if msa.promote_page(bid, key, BOOKS, 10, got):
            print("    → %s:%s passed on seed %d" % (bid, key, seed))
            return True
    print("    ✗ %s:%s refused the flat shelf %d times — leaving it unillustrated "
          "(the Tamil line reads fine without a picture)" % (bid, key, tries))
    return False


def raw_of(bid, key):
    cands = sorted(
        [p for p in msa.glob.glob(os.path.join(BOOKS, "page_%s_%s_*.png" % (bid, key)))],
        key=os.path.getmtime)
    return cands[-1] if cands else None


def main():
    promote = "--promote" in sys.argv
    tries = 5
    if "--tries" in sys.argv:
        tries = int(sys.argv[sys.argv.index("--tries") + 1])
    fix_ids = None
    if "--fix" in sys.argv:
        arg = sys.argv[sys.argv.index("--fix") + 1]
        fix_ids = list(msa.PAGE_SCENES) if arg == "all" else [arg]
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]

    ids = [only] if only else list(msa.PAGE_SCENES)
    rows, suspect, absent, bytes_out, promoted = [], [], [], 0, 0
    if fix_ids:
        # the gate has already refused these; re-measure the raw frames, then
        # render them again on new seeds until the paper comes out flat
        again = []
        for bid in fix_ids:
            for key, prompt in msa.page_plan(bid):
                dst = os.path.join(BOOKS, msa.page_art_name(bid, key))
                if os.path.exists(dst):
                    after = (msa.metrics(dst) or {}).get("bg_dev")
                    if after is None or after <= BG_LIMIT:
                        continue          # already on the shelf, and flat
                if not raw_of(bid, key):
                    continue              # never rendered; --pages owns that
                again.append((bid, key, prompt))
        print("▸ %d frame(s) refused by the gate, up to %d seed attempts each" % (len(again), tries))
        saved = sum(1 for bid, key, prompt in again
                    if fix(bid, key, prompt, tries, 1024, 768, 20))
        print("\n%d of %d back on the shelf" % (saved, len(again)))
        promote = True

    for bid in ids:
        for key, _prompt in msa.page_plan(bid):
            src = raw_of(bid, key)
            if not src:
                absent.append("%s:%s" % (bid, key))
                continue
            m = msa.metrics(src) or {}
            bg, ed, co = m.get("bg_dev"), m.get("edges"), m.get("colours")
            dst = os.path.join(BOOKS, msa.page_art_name(bid, key))
            have = os.path.exists(dst)
            rows.append((bid, key, bg, ed, co, os.path.getsize(src), have))
            if bg is not None and bg > BG_LIMIT:
                suspect.append("%s:%s (paper drift %.1f)" % (bid, key, bg))
            if promote:
                msa.promote_page(bid, key, BOOKS, 10, src)
                if os.path.exists(dst):
                    promoted += 1
                    bytes_out += os.path.getsize(dst)

    print("\n%d frames measured, %d never rendered" % (len(rows), len(absent)))
    if rows:
        bg_ok = [r[2] for r in rows if r[2] is not None]
        print("paper flatness: median %.1f  worst %.1f  (limit %.1f)"
              % (sorted(bg_ok)[len(bg_ok) // 2], max(bg_ok), BG_LIMIT))
    if suspect:
        print("\n⚠️  %d frame%s the eye should check:" % (len(suspect), "s" if len(suspect) != 1 else ""))
        for s in suspect:
            print("    " + s)
    else:
        print("\n✓ every frame came out on flat paper")
    if absent:
        print("\nnot rendered yet (%d): %s" % (len(absent), ", ".join(absent[:10])))
    if promote:
        print("\n%d pages promoted, %s of page art on disk"
              % (promoted,
                 "%.1f MB" % (bytes_out / 1048576) if bytes_out else "—"))
        json.dump({"suspect": suspect, "absent": absent},
                  open(os.path.join(ROOT, "images", "books", "page-review.json"), "w"), indent=1)
        print("   flags written to images/books/page-review.json (gitignored)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
