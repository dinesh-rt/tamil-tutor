#!/usr/bin/env python3
"""Story art for Tamil Tutor — talks to the local ComfyUI on :8188.

    python3 tools/make-story-art.py --style papercut --prompt "a brown crow beside a clay pot" --seed 7
    python3 tools/make-story-art.py --candidates                 # three styles, same scene
    python3 tools/make-story-art.py --style papercut --dry-run   # print the graph, no GPU

Stdlib only (urllib), like the rest of tools/. The graph is the Qwen-Image 2.1
one that already works on this Spark: INT8 unet + qwen3vl-8b text encoder +
bf16 vae, euler/simple, cfg 1.

Art lands in images/_candidates/ so nothing ships until a human has looked at
it — which matters more than it sounds: the model is happy to draw a crow with
four feathers and an extra leg, and a two-year-old notices a character that
changes between pages even when a grown-up does not.

Style is fixed per book by --style plus a fixed --seed, because ten books in
ten styles is a ransom note, not a shelf.
"""
import argparse
import glob
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

COMFY = os.environ.get("COMFY_URL", "http://127.0.0.1:8188")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DEFAULT = os.path.join(ROOT, "images", "_candidates")

UNET = "qwen_image_2.1_int8_convrot.safetensors"
CLIP = "qwen3vl_8b_int8_convrot.safetensors"
VAE = "qwen_image_2.1_vae_bf16.safetensors"

# One shared look for the whole shelf, spelled three ways to choose between.
STYLES = {
    "papercut": {
        "style": "flat paper-cut children's picture book illustration, thick clean outlines, "
                 "simple rounded shapes, limited warm palette (terracotta, turmeric yellow, "
                 "leaf green, indigo), flat colours with no gradients, plain pale cream background, "
                 "lots of empty space, gentle friendly faces, no text, no words, no letters",
        "negative": "photograph, photorealistic, 3d render, realistic fur, detailed texture, "
                    "cluttered background, busy scene, text, words, letters, watermark, signature, "
                    "scary, sharp teeth, deformed, extra limbs, extra legs, mutation",
    },
    "watercolour": {
        "style": "soft watercolour children's storybook illustration, warm cream paper texture, "
                 "gentle rounded shapes, muted pastel palette, thin brown ink outline, hand-painted "
                 "feel, calm and cosy, plain background, no text, no words, no letters",
        "negative": "photograph, photorealistic, 3d render, hard vector edges, neon colours, "
                    "cluttered background, busy scene, text, words, letters, watermark, signature, "
                    "scary, dark, deformed, extra limbs, extra legs",
    },
    # Dinesh chose "sticker" (bold kawaii, heaviest line of the six) and "cartoon"
    # next. Its one measurable problem was a painted background — that preset
    # asked for "a simple background with one small sun", and the sun came back
    # as scenery. These two keep the sticker shapes and take the scenery away:
    # same line weight, same palette energy, subject floating on plain paper.
    "stickerflat": {
        "style": "bold kawaii vector sticker illustration, very thick rounded dark outlines, "
                 "bright flat primary colours, big friendly eyes with highlights, simple happy "
                 "smile, solid colour fills, no shading, no gradients, no texture, screen-printed "
                 "poster look, 8 colour palette, plain solid cream background, subject centred "
                 "with lots of empty space, toddler board book art, no text, no words, no letters",
        "negative": "photograph, photorealistic, 3d render, realistic, fur texture, shading, "
                    "gradient, scenery, landscape, trees, sky, sun, clouds, ground texture, "
                    "cluttered background, busy scene, text, words, letters, watermark, signature, "
                    "scary, sharp teeth, deformed, extra limbs, extra legs, mutation",
    },
    "stickerwhite": {
        "style": "bold kawaii vector sticker illustration, very thick rounded dark outlines, "
                 "bright flat primary colours, big friendly eyes with highlights, solid colour "
                 "fills, screen-printed poster, 8 colour palette, plain pure white background, "
                 "subject centred, lots of empty space, toddler board book art, no text, no words, "
                 "no letters",
        "negative": "photograph, photorealistic, 3d render, realistic, fur texture, shading, "
                    "gradient, scenery, landscape, trees, sky, sun, clouds, ground, shadows, "
                    "cluttered, busy, text, words, letters, watermark, scary, sharp teeth, "
                    "deformed, extra limbs, extra legs",
    },
    # Dinesh picked the cartoonish ones off the contact sheet. These two keep
    # the cartoon shapes but borrow the screen-print discipline from the flat
    # look, because "cartoon" on its own renders with a painted background the
    # metric can see and a toddler's eye follows away from the subject.
    "cartoon": {
        "style": "cute cartoon children's picture book illustration, big round friendly shapes, "
                 "large sparkling eyes, thick dark brown outlines, solid colour fills, no shading, "
                 "no gradients, no texture, screen-printed poster look, 10 colour limited palette, "
                 "plain solid cream background, toddler board book art, adorable, warm and friendly, "
                 "no text, no words, no letters",
        "negative": "photograph, photorealistic, 3d render, realistic fur, detailed texture, "
                    "shading, gradients, cluttered background, busy scene, scenery, landscape, "
                    "text, words, letters, watermark, signature, scary, sharp teeth, deformed, "
                    "extra limbs, extra legs, mutation",
    },
    "cartoon2": {
        "style": "kawaii toddler app mascot illustration, super rounded huggable character, tiny "
                 "stubby limbs, big gentle eyes with highlights, simple happy smile, thick rounded "
                 "outline, flat solid colours, screen-printed poster, 8 colour warm palette, plain "
                 "solid pale background, centred subject with lots of empty space, no text, no "
                 "words, no letters",
        "negative": "photograph, photorealistic, 3d render, realistic, fur texture, shading, "
                    "gradients, background scenery, busy, cluttered, text, words, letters, "
                    "watermark, scary, sharp teeth, deformed, extra limbs, extra legs",
    },
    "sticker": {
        "style": "bold kawaii vector sticker illustration, very thick rounded dark outlines, "
                 "bright flat primary colours, big friendly eyes, simple background with one "
                 "small sun, toddler board book art, no gradients, no text, no words, no letters",
        "negative": "photograph, photorealistic, 3d render, realistic, muted colours, grey, "
                    "cluttered, busy, text, words, letters, watermark, scary, sharp teeth, "
                    "deformed, extra limbs, extra legs",
    },
}

# The page we audition styles on: the thirsty crow, page 5 (the pebbles).
AUDITION = {
    "prompt": "A brown crow standing next to a round terracotta clay pot filled with water, "
              "small grey pebbles scattered on the ground, the crow dropping a pebble into the "
              "pot with its beak, a mango tree behind, warm morning light",
    "character": "one brown crow with a round body, a friendly round eye and a short beak",
}


def human(n):
    return "%.1f MB" % (n / 1048576) if n >= 1048576 else "%.0f KB" % (n / 1024)


def slug(text):
    """A style string can be a paragraph; a filename cannot."""
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:28].rstrip("-") or "style"


def graph(prompt, negative, w, h, seed, steps):
    return {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": UNET, "weight_dtype": "default"}},
        "2": {"class_type": "QwenImage21Cache", "inputs": {"model": ["1", 0], "device": "auto", "dtype": "default"}},
        "3": {"class_type": "CLIPLoader", "inputs": {"clip_name": CLIP, "type": "qwen_image", "device": "default"}},
        "4": {"class_type": "VAELoader", "inputs": {"vae_name": VAE}},
        "5": {"class_type": "TextEncodeQwenImage21", "inputs": {
            "clip": ["3", 0], "prompt": prompt, "negative_prompt": negative, "resolution": max(w, h)}},
        "6": {"class_type": "EmptyLatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},
        "7": {"class_type": "KSampler", "inputs": {
            "model": ["2", 0], "positive": ["5", 0], "negative": ["5", 1], "latent_image": ["6", 0],
            "seed": seed, "control_after_generate": "fixed", "steps": steps, "cfg": 1.0,
            "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0}},
        "8": {"class_type": "VAEDecode", "inputs": {"samples": ["7", 0], "vae": ["4", 0]}},
        "9": {"class_type": "SaveImage", "inputs": {"images": ["8", 0], "filename_prefix": "tamiltutor/art"}},
    }


# The shelf is the first thing a two-year-old scans, so a cover is one character,
# big, centred, looking back at them — never the whole scene of the story. The
# crow is described in the same words in both crow books, because the crow must
# be the same crow; every cover shares SEEDS so a re-run is reproducible and
# --skip-existing actually means something.
COVER_SUBJECTS = {
    "kakku-kudam":      "a brown crow with a round body and one big friendly eye, dropping a small grey pebble into a round terracotta clay pot half full of water",
    "aamai-annangal":   "a small green tortoise with a round patterned shell smiling, held up gently in the air by two white geese who each hold one end of a small cloth in their beaks",
    "vanaram-mudalai":  "a cheerful brown monkey sitting upright holding one big yellow mango with both hands, and beside it a friendly green crocodile with a gentle closed-mouth smile looking up, no tree, no water, no riverbank",
    "singam-muyal":     "a big round friendly orange lion with a soft fluffy mane and no teeth showing, sitting calmly beside a tiny grey rabbit with long ears",
    "muyal-aamai":      "a grey hare and a small green tortoise side by side at the end of a short race, the tortoise in front, both happy and never mean",
    "singam-eli":       "a big friendly orange lion lying down with eyes closed smiling, and a tiny grey mouse standing bravely on the lion's huge round paw",
    "kakku-nari":       "a brown crow with a round body perched upright holding one round golden sesame sweet in its beak, and below it a slim orange fox sitting and looking up sweetly, no tree, no branches, no leaves",
    "kazhudhai-singa-udai": "a grey donkey wearing a loose lion costume hood, looking shy and funny, with one long ear poking out of the lion mane",
    "iru-punai-kurang":  "two small cats, one ginger and one grey, sitting opposite each other looking sad, and between them a cheeky brown monkey holding a torn piece of bread",
    "neela-nari":       "a small jackal painted entirely bright blue, standing proudly in the middle, with a grey elephant on one side bowing its head respectfully",
}

COVER_TAIL = ("storybook cover illustration, one clear main subject centred and large, looking at "
              "the viewer with a kind expression, full body visible, warm and welcoming, nothing "
              "else in the frame")


def cover_seed(book_id):
    return 1000 + int(hashlib.sha1(book_id.encode()).hexdigest()[:5], 16) % 90000


def post(path, payload):
    req = urllib.request.Request(COMFY + path, data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def get(path):
    with urllib.request.urlopen(COMFY + path, timeout=60) as r:
        return json.loads(r.read())


def alive():
    try:
        get("/system_stats")
        return True
    except Exception as exc:
        print("⚠️  ComfyUI not reachable at %s (%s)" % (COMFY, exc))
        print("   start it:  cd ~/comfy-h3 && ./ComfyUI/venv/bin/python ... --lowvram")
        return False


def wait(pid, timeout):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            h = get("/history/" + pid)
            if pid in h:
                out = h[pid].get("outputs", {})
                for node in out.values():
                    for img in node.get("images", []):
                        return img
                err = h[pid].get("status", {}).get("messages")
                raise RuntimeError("no image in history: %s" % err)
        except urllib.error.HTTPError:
            pass
        time.sleep(5)
    raise RuntimeError("timeout after %ds waiting for %s" % (timeout, pid))


def download(img, dest):
    q = urllib.parse.urlencode({"filename": img["filename"], "subfolder": img.get("subfolder", ""),
                                "type": img.get("type", "output")})
    with urllib.request.urlopen(COMFY + "/view?" + q, timeout=120) as r:
        data = r.read()
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "wb") as fh:
        fh.write(data)
    return len(data)


def metrics(path):
    """Crude but real: is it a flat illustration or a photoreal mess?

    A toddler page wants few colours, a calm background and bold edges. These
    three numbers separate those two shapes of image well enough to reject a
    run without a human eye — the human still makes the call.
    """
    try:
        from PIL import Image
    except ImportError:
        return None
    im = Image.open(path).convert("RGB")
    small = im.resize((96, 96))
    colours = len(small.getcolors(96 * 96) or [])
    quant = small.quantize(16).convert("RGB")
    palette_spread = len(quant.getcolors(96 * 96) or [])
    # border strip = the background the subject sits on
    w, h = small.size
    strip = list(small.crop((0, 0, w, 6)).getdata()) + list(small.crop((0, h - 6, w, h)).getdata())
    mean = [sum(c[i] for c in strip) / len(strip) for i in range(3)]
    bg_dev = (sum(sum((c[i] - mean[i]) ** 2 for i in range(3)) for c in strip) / len(strip)) ** 0.5
    from PIL import ImageFilter
    grey = im.convert("L").resize((64, 64)).filter(ImageFilter.FIND_EDGES)
    edges = sum(grey.getdata()) / 4096.0
    return {"colours": colours, "buckets16": palette_spread, "bg_dev": round(bg_dev, 1), "edges": round(edges, 1)}


def flatten_image(im, colours=10, tol=42):
    """The consistency lock, applied after the sampler had its opinion.

    No prompt holds a diffusion model to one look across ninety pages, so the
    look is imposed afterwards: quantise down to a handful of flat colours and
    snap the background to one solid value. The same op is what `metrics`
    measures, so you can watch the numbers go the right way — few colours,
    background deviation near zero — and reject a batch without a human eye on
    every frame. The human still decides whether the crow looks right.
    """
    from PIL import Image
    pal = im.convert("RGB").quantize(colors=colours, method=Image.Quantize.MEDIANCUT).convert("RGB")

    # the dominant colour of the border strip is the "paper"; make it exactly one colour
    w, h = pal.size
    strip = list(pal.crop((0, 0, w, max(2, h // 40))).getdata()) + \
            list(pal.crop((0, h - max(2, h // 40), w, h)).getdata()) + \
            list(pal.crop((0, 0, max(2, w // 40), h)).getdata()) + \
            list(pal.crop((w - max(2, w // 40), 0, w, h)).getdata())
    counts = {}
    for px in strip:
        counts[px] = counts.get(px, 0) + 1
    paper = max(counts, key=counts.get)

    out = Image.new("RGB", pal.size)
    op = out.load()
    pp = pal.load()
    for y in range(h):
        for x in range(w):
            r, g, b = pp[x, y]
            if abs(r - paper[0]) + abs(g - paper[1]) + abs(b - paper[2]) <= tol:
                op[x, y] = paper
            else:
                op[x, y] = (r, g, b)
    return out


def flatten(src, dst, colours=10, tol=42):
    from PIL import Image
    flatten_image(Image.open(src), colours, tol).save(dst, optimize=True)
    return os.path.getsize(dst)


def promote(book_id, out, colours, src=None):
    """Turn an approved render into the one stable filename the app points at.

    Generated filenames carry a content hash, which is exactly what you want in
    a cache and useless in a data file that has to name its picture. So the
    chosen render is flattened to the shelf palette and copied under a fixed
    name: re-running this swaps the cover without a line of app code changing,
    and stories.js can say cover-<id>.webp and be true.
    """
    from PIL import Image
    if not src:
        cands = sorted(glob.glob(os.path.join(out, "cover_%s_*.png" % book_id)), key=os.path.getmtime)
        if not cands:
            print("   ✗ nothing rendered for %s yet — --covers --only %s" % (book_id, book_id))
            return None
        src = cands[-1]
    im = Image.open(src)
    before = metrics(src) or {}
    flat = flatten_image(im, colours)
    dst = os.path.join(out, "cover-%s.webp" % book_id)
    flat.save(dst, "WEBP", quality=90, method=6)
    print("   ✓ %s  %d KB  from %s  (colours %s → %s, background %s → %s)"
          % (dst, os.path.getsize(dst) // 1024, os.path.basename(src),
             before.get("colours"), (metrics(dst) or {}).get("colours"),
             before.get("bg_dev"), (metrics(dst) or {}).get("bg_dev")))
    return dst


def one(style, prompt, w, h, seed, steps, out, prefix, timeout, dry=False, skip=False):
    preset = STYLES[style] if style in STYLES else {"style": style, "negative": ""}
    full = prompt.strip() + ". " + preset["style"]
    g = graph(full, preset["negative"], w, h, seed, steps)
    tag = "%s_%s_%s" % (prefix, slug(style), hashlib.sha1((prompt + str(seed)).encode()).hexdigest()[:6])
    dest = os.path.join(out, tag + ".png")
    if skip and os.path.exists(dest):
        print("   · already have %s" % dest)
        return dest
    if dry:
        print(json.dumps(g, indent=1)[:1400])
        print("\n→ would write %s" % dest)
        return None
    if not alive():
        sys.exit(2)
    t0 = time.time()
    try:
        pid = post("/prompt", {"prompt": g, "client_id": "tamil-tutor"}).get("prompt_id")
    except urllib.error.HTTPError as e:
        print("❌ rejected:", e.read().decode()[:600])
        sys.exit(1)
    print("   queued %s …" % pid)
    img = wait(pid, timeout)
    n = download(img, dest)
    m = metrics(dest)
    print("   ✓ %s  %d KB  %.0fs%s" % (dest, n // 1024, time.time() - t0,
          ("  " + json.dumps(m)) if m else ""))
    return dest


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--style", default="papercut", help="papercut | watercolour | sticker, or your own style text")
    ap.add_argument("--prompt", default=None)
    ap.add_argument("--w", type=int, default=1024)
    ap.add_argument("--h", type=int, default=1024)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--steps", type=int, default=25)
    ap.add_argument("--out", default=OUT_DEFAULT)
    ap.add_argument("--prefix", default="audition")
    ap.add_argument("--timeout", type=int, default=1200)
    ap.add_argument("--candidates", action="store_true", help="the same scene in all three styles")
    ap.add_argument("--promote", metavar="STORY_ID", help="flatten the chosen cover into the stable name the app uses")
    ap.add_argument("--promote-all", action="store_true", help="promote every cover rendered so far")
    ap.add_argument("--flatten", metavar="DIR", help="post-process every png in DIR to a flat palette + solid background")
    ap.add_argument("--colours", type=int, default=10, help="palette size for --flatten (default 10)")
    ap.add_argument("--covers", action="store_true", help="render the ten book covers in the locked style")
    ap.add_argument("--only", help="one story id, for --covers")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--skip-existing", action="store_true", help="don't re-render what is already on disk")
    a = ap.parse_args()

    if a.covers:
        ids = [a.only] if a.only else list(COVER_SUBJECTS)
        for i in ids:
            if i not in COVER_SUBJECTS:
                print("no such story id: %s (have: %s)" % (i, ", ".join(COVER_SUBJECTS)))
                sys.exit(1)
        out = a.out if a.out != OUT_DEFAULT else os.path.join(ROOT, "images", "books")
        print("▸ %d covers, style %s, %d×%d" % (len(ids), a.style, a.w, a.h))
        for i in ids:
            prompt = COVER_SUBJECTS[i] + ". " + COVER_TAIL
            print("  %s  seed %d" % (i, cover_seed(i)))
            one(a.style, prompt, a.w, a.h, cover_seed(i), a.steps, out, "cover_" + i, a.timeout,
                a.dry_run, a.skip_existing)
        if not a.dry_run:
            print("\n→ %s\nTen covers, one style, one seed each. Eyes on these before the eighty pages." % out)
        return

    if a.promote or a.promote_all:
        from PIL import Image  # noqa: F401
        out = a.out if a.out != OUT_DEFAULT else os.path.join(ROOT, "images", "books")
        ids = COVER_SUBJECTS if a.promote_all else [a.promote]
        n = 0
        for i in ids:
            if promote(i, out, a.colours):
                n += 1
        total = sum(os.path.getsize(f) for f in glob.glob(os.path.join(out, "cover-*.webp")))
        print("\n%d covers promoted, %s total on the shelf" % (n, human(total)))
        return

    if a.flatten:
        from PIL import Image  # noqa: F401  (fail early if pillow is missing)
        files = sorted(f for f in os.listdir(a.flatten) if f.lower().endswith(".png"))
        if not files:
            print("nothing to flatten in " + a.flatten)
            return
        for f in files:
            src = os.path.join(a.flatten, f)
            dst = os.path.join(a.flatten, f[:-4] + "_flat.png")
            before = metrics(src)
            n = flatten(src, dst, a.colours)
            print("✓ %s\n    before %s\n    after  %s  (%d KB)" % (f, before, metrics(dst), n // 1024))
        return

    if a.candidates:
        made = []
        for s in STYLES:
            print("\n▸ %s" % s)
            made.append(one(s, AUDITION["prompt"], a.w, a.h, a.seed, a.steps, a.out, a.prefix, a.timeout,
                            a.dry_run, a.skip_existing))
        if not a.dry_run:
            print("\nSame scene, same seed, three looks. Pick one — it is the look of all ten books.")
            print("Scene: %s" % AUDITION["prompt"][:90] + "…")
        return

    if not a.prompt:
        ap.error("--prompt is required (or use --candidates)")
    one(a.style, a.prompt, a.w, a.h, a.seed, a.steps, a.out, a.prefix, a.timeout, a.dry_run)


if __name__ == "__main__":
    main()
