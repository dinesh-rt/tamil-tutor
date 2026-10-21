#!/usr/bin/env python3
"""Make the Tamil Tutor audio pack — real human-sounding voices, fully offline afterwards.

    python3 tools/make-voice-pack.py                # every word, Tamil + English
    python3 tools/make-voice-pack.py --category animals
    python3 tools/make-voice-pack.py --only ta --jobs 8
    python3 tools/make-voice-pack.py --list-voices

It uses Microsoft Edge's free neural voices through the `edge-tts` package (no
account, no API key). Two Tamil voices are available:

    ta-IN-PallaviNeural   female   (the default — warm, clear, great for toddlers)
    ta-IN-ValluvarNeural  male

Internet is needed only while generating. The app plays the files straight from
disk afterwards, and falls back to the browser's own speech for anything missing
(your own words, new sentences), so a half-finished pack is completely safe.

Files land in  audio/ta/<cat>__<word>.mp3   audio/en/<cat>__<word>.mp3
             audio/ta/say/<cat>__<word>.mp3  (the 💬 sentence chip)
and are described by  audio/manifest.json.
"""
import argparse
import asyncio
import datetime
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, "audio")
VENV = os.path.join(ROOT, "tools", ".venv-tts")
CANDIDATE_VENVS = [VENV, os.path.expanduser("~/ttsvenv"), "/tmp/ttsvenv"]

DEFAULT_TA = "ta-IN-PallaviNeural"
DEFAULT_EN = "en-IN-NeerjaNeural"


# ----------------------------------------------------------------- interpreter
def have_edge_tts():
    try:
        import edge_tts  # noqa: F401
        return True
    except Exception:
        return False


def ensure_edge_tts(bootstrap=True):
    """Re-run this script inside a venv that has edge-tts installed."""
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


def load_words():
    out = subprocess.check_output(["node", os.path.join(ROOT, "tools", "word-list.js")], cwd=ROOT)
    return json.loads(out.decode("utf-8"))


def fname(word_id):
    return word_id.replace("/", "__").replace(" ", "-")


def rel_path(kind, word_id):
    if kind == "say":
        return os.path.join("ta", "say", fname(word_id) + ".mp3")
    return os.path.join(kind, fname(word_id) + ".mp3")


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
            except Exception as exc:  # network blips are normal, retry
                if attempt == tries - 1:
                    return "fail:%s" % exc
                await asyncio.sleep(0.8 * (attempt + 1) ** 2)
    return "fail"


async def generate(words, kinds, voices, rates, jobs):
    import edge_tts
    sem = asyncio.Semaphore(jobs)
    tasks, meta = [], []
    for w in words:
        for kind in kinds:
            if kind == "say" and not w.get("say"):
                continue
            text = {"ta": w["ta"], "en": w["en"], "say": w["say"]}[kind]
            if not text:
                continue
            voice = voices["ta"] if kind in ("ta", "say") else voices["en"]
            rate = rates["ta"] if kind in ("ta", "say") else rates["en"]
            out_file = os.path.join(AUDIO, rel_path(kind, w["id"]))
            tasks.append(synth_one(edge_tts, text, voice, rate, out_file, sem))
            meta.append((w["id"], kind))

    done = skipped = failed = 0
    t0 = datetime.datetime.now()
    for fut in asyncio.as_completed(tasks):
        res = await fut
        if res == "ok":
            done += 1
        elif res == "skip":
            skipped += 1
        else:
            failed += 1
        n = done + skipped + failed
        if n % 25 == 0 or n == len(tasks):
            secs = (datetime.datetime.now() - t0).total_seconds() or 1
            rate_per = n / secs
            eta = int((len(tasks) - n) / rate_per) if rate_per else 0
            print("  %5d/%-5d  new %-4d existing %-5d failed %-4d  %d/s  eta %dm%02ds"
                  % (n, len(tasks), done, skipped, failed, rate_per, eta // 60, eta % 60), flush=True)
    return done, skipped, failed


def write_manifest(words, kinds):
    files = {}
    for w in words:
        entries = []
        for kind in kinds:
            if kind == "say" and not w.get("say"):
                continue
            p = rel_path(kind, w["id"])
            if os.path.exists(os.path.join(AUDIO, p)):
                entries.append(kind)
        if entries:
            files[w["id"]] = entries
    man = {
        "version": 1,
        "generated": datetime.datetime.now().isoformat(timespec="seconds"),
        "voices": {"ta": DEFAULT_TA, "en": DEFAULT_EN},
        "files": files,
    }
    os.makedirs(AUDIO, exist_ok=True)
    with open(os.path.join(AUDIO, "manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(man, fh, ensure_ascii=False, separators=(",", ":"))
    total = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(AUDIO) for f in fs)
    print("\nmanifest : %d words described, %d clips, %.1f MB total"
          % (len(files), sum(len(v) for v in files.values()), total / 1048576))


def list_voices():
    import edge_tts
    vs = asyncio.run(edge_tts.list_voices())
    ta = [v for v in vs if v["Locale"].startswith("ta")]
    en = [v for v in vs if v["ShortName"] in ("en-IN-NeerjaNeural", "en-IN-Neerja:Conversational",
          "en-GB-SoniaNeural", "en-US-AriaNeural", "en-US-JennyNeural")]
    print("\nTamil voices:")
    for v in ta:
        print("   %-24s %-8s %s" % (v["ShortName"], v["Gender"], v["FriendlyName"]))
    print("\nhandy English voices:")
    for v in en:
        print("   %-24s %-8s %s" % (v["ShortName"], v["Gender"], v["FriendlyName"]))


# -------------------------------------------------------------------- command
def main():
    ap = argparse.ArgumentParser(description="Generate the Tamil Tutor audio pack")
    ap.add_argument("--category", help="only this category, e.g. animals")
    ap.add_argument("--only", choices=["ta", "en", "say"], action="append",
                    help="which clips to make (repeatable). default: ta en say")
    ap.add_argument("--jobs", type=int, default=6, help="parallel clips (default 6)")
    ap.add_argument("--limit", type=int, help="stop after N words (for testing)")
    ap.add_argument("--voice-ta", default=DEFAULT_TA)
    ap.add_argument("--voice-en", default=DEFAULT_EN)
    ap.add_argument("--rate-ta", default="-8%", help="speech rate tweak for Tamil (default -8%%)")
    ap.add_argument("--rate-en", default="-5%")
    ap.add_argument("--force", action="store_true", help="re-make clips that already exist")
    ap.add_argument("--manifest-only", action="store_true", help="just rebuild manifest.json")
    ap.add_argument("--list-voices", action="store_true")
    ap.add_argument("--no-bootstrap", action="store_true")
    a = ap.parse_args()

    if a.list_voices:
        ensure_edge_tts(bootstrap=not a.no_bootstrap)
        return list_voices()

    ensure_edge_tts(bootstrap=not a.no_bootstrap)
    words = load_words()
    if a.category:
        words = [w for w in words if w["cat"] == a.category]
    if a.limit:
        words = words[: a.limit]
    kinds = a.only or ["ta", "en", "say"]

    if a.force:
        shutil.rmtree(AUDIO, ignore_errors=True)

    if a.manifest_only:
        return write_manifest(words, kinds)

    print("\nmaking the audio pack")
    print("  words     : %d   clips per word: %s" % (len(words), "+".join(kinds)))
    print("  voices    : %s (Tamil) · %s (English)" % (a.voice_ta, a.voice_en))
    print("  rates     : ta %s · en %s" % (a.rate_ta, a.rate_en))
    print("  into      : %s\n" % os.path.relpath(AUDIO, ROOT))

    voices, rates = {"ta": a.voice_ta, "en": a.voice_en}, {"ta": a.rate_ta, "en": a.rate_en}
    done, skipped, failed = asyncio.run(generate(words, kinds, voices, rates, a.jobs))
    write_manifest(words, kinds)
    print("\ndone: %d new, %d already there, %d failed" % (done, skipped, failed))
    if failed:
        print("rerun the same command — existing clips are kept, missing ones are retried")
    else:
        print("reload Tamil Tutor — the cards now use the recordings (grown-up corner can turn them off)")


if __name__ == "__main__":
    main()
