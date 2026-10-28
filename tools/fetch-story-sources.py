#!/usr/bin/env python3
"""Pull the archived parent texts the stories are told from.

Why this exists: js/data/stories.js used to hold ten retellings that were
written by a model and never sourced, and nothing in the repo said so. A plot
that is three thousand years old belongs to nobody, but a *sentence* somebody
printed does, and the difference is exactly what the `source` field on each
book is for. So the parent text gets fetched, kept, and named — not paraphrased
from memory.

Why ta.wikisource specifically: those pages are proofread against a scanned
book page by page (`<pages index="X.pdf" from="26" to="27"/>`), so the Tamil is
a human having looked at printed type, not OCR of 19th-century lead. That makes
it the only tier worth copying a sentence from. archive.org and Gutenberg are
recorded as references — their Tamil is OCR, which is fine for checking a
reading and not fine for putting in front of a two-year-old.

What we take is the *story*: who is in it, what happens, in what order, and the
idiom. We do not take the register. These books say இருந்தன, வாழ்ந்து வந்தன,
பெய்யாததால் — book Tamil. A toddler hears இருந்துச்சு, வாழ்ந்து வந்துச்சு.
The narrative voice is ours to set, per js/data/*.js; the plot is theirs.

  python3 tools/fetch-story-sources.py            # fetch anything not on disk
  python3 tools/fetch-story-sources.py --force    # refetch everything
  python3 tools/fetch-story-sources.py --list     # show the map, fetch nothing
  python3 tools/fetch-story-sources.py --only aamai-annangal

Fetched text lands in sources/stories/<id>__<slug>.txt with a header naming the
page, the licence and the date. Kept in the repo on purpose: the claim in
stories.js has to be checkable a year from now by someone with no API access.
"""
import datetime
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "sources", "stories")
WS = "https://ta.wikisource.org"

# A polite one-client agent is not decoration: Wikimedia 403s a missing UA, and
# a generic browser UA gets us treated like a scraper.
UA = "tamil-tutor/1.0 (https://github.com/dinesh-rt/tamil-tutor; fetching public-domain story texts)"

P = "பஞ்ச தந்திரக் கதைகள்"      # the Panchathanthram, 57 tales
A = "அறிவுக் கதைகள்"                # wisdom tales, 100
C = "சிறுவர் சிறுமியருக்கு நீதிக் கதைகள்"  # moral tales for small children, 50

# book id -> what to fetch, best first. Several books have two candidates
# because the archived title does not always say plainly which tale it is, and
# reading both is cheaper than guessing wrong and shipping it.
SOURCES = {
    "kakku-kudam": [
        (P, "கரும்பாம்பைக் கொன்ற காகம்"),
        (C, "தண்ணீர் கரையிலேயே உள்ளது"),
        (P, "ஒட்டகத்தைச் கொன்ற காகம்"),
    ],
    "aamai-annangal": [
        (P, "வாயடக்கம் இல்லாத ஆமை"),
    ],
    "vanaram-mudalai": [
        (P, "கிடைத்த குரங்கைக் கைவிட்ட முதலை"),
        (P, "ஆப்புப் பிடுங்கிய குரங்கு"),
    ],
    "singam-muyal": [
        (P, "சிங்கத்தைக் கொன்ற முயல்"),
        (P, "யானையை வென்ற வெள்ளை முயல்"),
    ],
    "muyal-aamai": [
        (P, "மோசம் போன முயலும் மைனாவும்"),
        (P, "நான்கு நண்பர்கள்"),
    ],
    "singam-eli": [
        (C, "யானையை ஏமாற்றிய எலி"),
        (P, "உருவம் மாறிய எலி"),
    ],
    "kakku-nari": [
        (P, "சிங்கத்தின் மோசம் அறிந்த நரி"),
        (A, "நரியும் பூனையும்"),
        (P, "வஞ்சக நரி"),
    ],
    "kazhudhai-singa-udai": [
        (P, "அறிவில்லாமல் ஒழிந்து போன கழுதை"),
        (P, "தன் வாயினால் கெட்ட கழுதை"),
        (A, "திருடனை விரட்டிய கழுதை"),
    ],
    "iru-punai-kurang": [
        (A, "இரு குரங்கின் கைச்சாறு"),
        (A, "குருவிக் கூட்டைக் கலைத்த குரங்கு"),
    ],
    "neela-nari": [
        (P, "சிங்கத்திடம் வளர்ந்த நரிக்குட்டி"),
        (P, "முரசொலி கேட்ட நரி"),
        (A, "நரியும் திராட்சையும்"),
    ],
    # not on the shelf yet; pulled because they are strong toddler tales and
    # are the replacements if an Aesop import turns out to have no Tamil parent
    "_alt_kurangu-kokku": [(P, "குரங்குக்கு அறிவு சொன்ன கொக்கு")],
    "_alt_keeri": [(P, "கீரிப் பிள்ளையைக் கொன்றான்")],
    "_alt_vaathu": [(P, "வாழ்வு தந்த கிழட்டு வாத்து")],
    "_alt_kuruvi": [(P, "கடலை வென்ற சிட்டுக்குருவி")],
}

# References we deliberately do NOT copy sentences from, recorded so the
# provenance trail is complete and so nobody re-does this search.
REFERENCES = {
    "archive.org": "54 items under தமிழ் + கதைகள்; colonial-era printed collections "
                   "(e.g. 'Select Tamil Tales: With Free Translations in English', 1839) — Tamil is OCR, "
                   "use to confirm a reading, not to quote",
    "gutenberg": "ebook 57468, 'A Group of Eastern Romances and Stories from the Persian, Tamil and Urdu' "
                 "— English translations; useful for gloss tone, not for Tamil",
    "tntextbooks.in": "TN board primary books, plain by design; licence to check before use",
}

SLEEP = 2.0  # their API throttles anything faster than this comfortably


def api(**p):
    """One MediaWiki call, retried with backoff. Never in parallel — see SLEEP."""
    p.setdefault("format", "json")
    url = WS + "/w/api.php?" + urllib.parse.urlencode(p)
    last = None
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return json.load(urllib.request.urlopen(req, timeout=40))
        except Exception as e:                       # 429/503 come and go
            last = e
            time.sleep(4 * (attempt + 1))
    print("      ! %s" % last)
    return None


def wikitext(title):
    d = api(action="query", prop="revisions", rvprop="content", rvslots="main", titles=title)
    if not d:
        return None
    for pg in d.get("query", {}).get("pages", {}).values():
        rev = (pg.get("revisions") or [{}])[0]
        return rev.get("slots", {}).get("main", {}).get("*") or rev.get("*")
    return None


def clean(t):
    """Strip proofreading markup, keep the sentence."""
    t = re.sub(r"<ref[^>]*>.*?</ref>|<ref[^/>]*/>", " ", t, flags=re.S)
    t = re.sub(r"__NOTOC__|__NOEDITSECTION__|\{\{[^}]*\}\}", " ", t)
    t = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", t)
    t = re.sub(r"'''|''", " ", t)
    return " ".join(t.split())


def story_text(collection_title, tale):
    """Resolve a tale's <pages index from to/> into the proofread Page: text."""
    full = "%s/%s" % (collection_title, tale)
    wrapper = wikitext(full)
    if wrapper is None:
        return None, full, None
    spans = re.findall(r'index="([^"]+)"\s+from="(\d+)"\s+to="(\d+)"', wrapper)
    parts = []
    for index, frm, to in spans:
        for n in range(int(frm), int(to) + 1):
            page = wikitext("Page:%s/%d" % (index, n))
            if page:
                parts.append(clean(page))
            time.sleep(SLEEP)
    # the wrapper's own head (author, source book) is provenance worth keeping
    head = clean(re.sub(r"<pages[^>]*/?>.*?</pages>|<pages[^>]*/>", " ", wrapper, flags=re.S))
    body = " ".join(" ".join(parts).split())
    if not body:
        body = clean(wrapper)
    return body, full, head


def fetch(book_id, picks, force=False):
    written = []
    for coll, tale in [p for p in picks if p and p[1]]:
        slug = re.sub(r"[^\w\u0B80-\u0BFF]+", "-", tale).strip("-")[:48]
        dst = os.path.join(OUT, "%s__%s.txt" % (book_id.replace("_alt_", ""), slug))
        if os.path.exists(dst) and not force:
            print("   = %s (cached)" % os.path.basename(dst))
            written.append(dst)
            continue
        print("   … %s / %s" % (coll, tale))
        body, full, head = story_text(coll, tale)
        if not body:
            print("     ✗ nothing came back for %s" % tale)
            continue
        stamp = datetime.date.today().isoformat()
        hdr = ("source : %s — %s\n"
               "url    : %s\n"
               "book   : %s\n"
               "fetched: %s\n"
               "note   : proofread against the scanned book page-by-page; take the\n"
               "         plot and the idiom from this, NOT the register — it is book\n"
               "         Tamil. See js/data/stories.js for the spoken rendering.\n"
               "%s\n\n") % (coll, tale, WS + "/wiki/" + urllib.parse.quote(full.replace(" ", "_")),
                            (head or "")[:300], stamp, "-" * 68)
        with open(dst, "w", encoding="utf-8") as fh:
            fh.write(hdr + body + "\n")
        print("     ✓ %s  [%d chars]" % (os.path.basename(dst), len(body)))
        written.append(dst)
        time.sleep(SLEEP)
    return written


def main():
    force = "--force" in sys.argv
    if "--list" in sys.argv:
        for bid, picks in SOURCES.items():
            print("%-24s %s" % (bid, " | ".join("%s/%s" % (c, t) for c, t in picks if t)))
        print("\nreferences (recorded, not quoted from):")
        for k, v in REFERENCES.items():
            print("  %-14s %s" % (k, v))
        return 0

    os.makedirs(OUT, exist_ok=True)
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
    ids = [only] if only else list(SOURCES)
    if only and only not in SOURCES:
        print("no such book id: %s (have: %s)" % (only, ", ".join(SOURCES)))
        return 1
    total = 0
    for bid in ids:
        print("\n▸ %s" % bid)
        total += len(fetch(bid, SOURCES[bid], force))
    print("\n%d texts in %s" % (total, OUT))
    print("→ read them, then set each book's `source` in js/data/stories.js")
    return 0


if __name__ == "__main__":
    sys.exit(main())
