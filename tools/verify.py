#!/usr/bin/env python3
"""One command that checks the whole project before you ship it.

    npm run verify                     syntax + word bank + single-file bundle
    npm run verify -- --builds         ...and the portable + offline builds
    npm run verify -- --stamp          ...and refresh the service-worker version
    npm run verify -- --quick          syntax + word bank only

Everything here is stdlib only, like the rest of the tooling.
"""
import argparse
import os
import re
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def sh(cmd, timeout=900):
    """Run a command, return (ok, output_tail, seconds)."""
    t0 = time.time()
    try:
        p = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return False, "timed out after %ds" % timeout, time.time() - t0
    except FileNotFoundError:
        return False, "missing executable: %s" % cmd[0], time.time() - t0
    out = (p.stdout or "") + (p.stderr or "")
    lines = [l for l in out.strip().splitlines() if l.strip()]
    err = [l for l in lines if "Error" in l or "error" in l]
    tail = "\n".join((err or lines)[-4:])
    return p.returncode == 0, tail, time.time() - t0


def js_files():
    files = []
    for base in ("js",):
        for walk_root, _dirs, names in os.walk(os.path.join(ROOT, base)):
            rel = os.path.relpath(walk_root, ROOT)
            files += [os.path.join(rel, n) for n in sorted(names) if n.endswith(".js")]
    tools = ["tools/" + n for n in sorted(os.listdir(os.path.join(ROOT, "tools"))) if n.endswith(".js")]
    return ["sw.js"] + files + tools


def stamp_sw():
    """Point the service worker cache at today's version if any app file changed.

    A stale worker is the quiet way an installed app stops receiving fixes, so
    the stamp is part of the release rather than something you must remember.
    """
    sw = os.path.join(ROOT, "sw.js")
    src = open(sw, encoding="utf-8").read()
    cur = re.search(r"const VERSION = '([^']*)';", src)
    if not cur:
        return False, "no VERSION line found in sw.js"
    today = time.strftime("%Y.%m.%d")
    newest = 0.0
    for rel in js_files() + ["index.html", "css/app.css", "css/animations.css", "manifest.webmanifest"]:
        p = os.path.join(ROOT, rel)
        if os.path.exists(p):
            newest = max(newest, os.path.getmtime(p))
    if time.strftime("%Y.%m.%d", time.localtime(newest)) == cur.group(1) and cur.group(1) == today:
        return False, "already stamped %s" % cur.group(1)
    if newest and time.time() - newest < 86400 * 365:
        new = "v" + today
        if new == cur.group(1):
            new = "v" + today + "b"
        open(sw, "w", encoding="utf-8").write(src.replace(cur.group(0), "const VERSION = '%s';" % new))
        return True, "cache → tamil-tutor-%s" % new.lstrip("v")
    return False, "nothing newer than the current stamp (%s)" % cur.group(1)


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument("--builds", action="store_true", help="also build portable + offline")
    ap.add_argument("--stamp", action="store_true", help="refresh the service worker version")
    ap.add_argument("--quick", action="store_true", help="syntax + word bank only")
    ap.add_argument("-h", "--help", action="store_true")
    a = ap.parse_args()
    if a.help:
        print(__doc__)
        return 0

    fails, notes = [], []
    t0 = time.time()

    def step(label, ok, tail=""):
        print(("  ✓ " if ok else "  ✗ ") + label + (("  " + tail) if tail else ""))
        if not ok:
            fails.append(label)
            if tail:
                print("      " + tail.replace("\n", "\n      "))

    print("\nverify — Tamil Tutor\n")

    # 1. every script must at least parse
    bad = []
    for f in js_files():
        ok, tail, _ = sh(["node", "--check", f], timeout=60)
        if not ok:
            bad.append("%s: %s" % (f, tail.splitlines()[-1] if tail else "check failed"))
    step("syntax — %d scripts parse" % len(js_files()), not bad, " | ".join(bad[:4]))

    # 2. the word bank itself
    ok, tail, _ = sh(["node", "tools/check-data.js"])
    step("word bank — " + (tail.splitlines()[-1] if tail else "checked"), ok, tail if not ok else "")

    if not a.quick:
        # 3. the shareable single file must still build
        ok, tail, _ = sh(["python3", "tools/build-single-file.py"])
        size = ""
        p = os.path.join(ROOT, "dist", "tamil-tutor.html")
        if os.path.exists(p):
            size = " (%.0f KB)" % (os.path.getsize(p) / 1024)
        step("bundle — dist/tamil-tutor.html" + size, ok, tail)

        if a.builds:
            for cmd, label, out in (
                (["python3", "tools/build-portable.py"], "portable folder", "dist/portable/index.html"),
                (["python3", "tools/build-portable.py", "--single"], "offline single file", "dist/tamil-tutor-offline.html"),
            ):
                ok, tail, _ = sh(cmd)
                size = ""
                p = os.path.join(ROOT, out)
                if os.path.exists(p):
                    size = " (%.0f KB)" % (os.path.getsize(p) / 1024)
                step(label + size, ok, tail)

    if a.stamp:
        changed, msg = stamp_sw()
        step("service worker stamp — " + msg, True, "")
        if changed:
            notes.append("sw.js was stamped — commit it so installed apps pick up the new cache")

    print("\n%s  (%.1fs)" % ("✅ all good" if not fails else "❌ %d step(s) failed" % len(fails), time.time() - t0))
    for n in notes:
        print("   ℹ️  " + n)
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
