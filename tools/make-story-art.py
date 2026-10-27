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


# ─────────────────────────────── page art ────────────────────────────────
#
# A cover is one character posing; a page is a moment in a story, so it needs
# the cast plus whatever prop the line is about. Two things keep the shelf from
# turning into ten different books:
#
#   1. BOOK_CAST is repeated verbatim in every page of a book. The crow in page 1
#      has to be the crow in page 8 — a two-year-old notices a character that
#      changes between pages even when a grown-up does not.
#   2. Every page of a book shares one seed (page_seed), so the sampler starts
#      from the same noise and the palette, weight and lighting drift far less
#      than they would with a fresh seed per frame.
#
# The scenes below are derived from the `ta`/`en` lines in js/data/stories.js —
# page n here is page n there. Edit the story text and you should edit the scene.

BOOK_CAST = {
    "kakku-kudam": "the same brown crow throughout: round body, one big friendly round eye, "
                   "short black beak, small rounded wings",
    "aamai-annangal": "the same small green tortoise with a round patterned shell and a gentle "
                      "smile, and the same two white geese with orange beaks throughout",
    "vanaram-mudalai": "the same cheerful brown monkey with a round belly and the same friendly "
                       "green crocodile with a closed-mouth smile throughout",
    "singam-muyal": "the same big round orange lion with a soft fluffy mane and no teeth showing, "
                    "and the same tiny grey rabbit with long ears throughout",
    "muyal-aamai": "the same light-grey hare with long ears and the same small green tortoise "
                   "with a round patterned shell throughout",
    "singam-eli": "the same big friendly orange lion with a soft mane and the same tiny grey "
                  "mouse with big round ears throughout",
    "kakku-nari": "the same brown crow with a round body and one big friendly eye, and the same "
                  "slim orange fox with a big fluffy tail and a kind face throughout",
    "kazhudhai-singa-udai": "the same grey donkey with a long face, kind eyes and one long ear, "
                            "and the same small orange fox throughout",
    "iru-punai-kurang": "the same two small cats — one ginger, one grey — and the same cheeky "
                        "brown monkey with a round belly throughout",
    "neela-nari": "the same small jackal, painted entirely bright blue with a fluffy tail, and "
                  "the same grey elephant throughout",
}

# page number (or "moral") → what is happening in this one frame.
PAGE_SCENES = {
    "kakku-kudam": {
        "01": "a thirsty crow standing in the heat with its beak open, a big warm sun above, "
              "one tired wing drooping",
        "02": "the crow sitting on the ground beneath a single leafy tree, head turned to one "
              "side, looking around for water",
        "03": "a round terracotta clay pot standing on the ground with a thin layer of blue "
              "water at the very bottom of it, the crow beside it looking down into it",
        "04": "the crow stretching its neck and beak down into the mouth of the clay pot, "
              "unable to reach the water at the bottom, looking sad",
        # "lightbulb" is a trap: the model insists on drawing the glow, and a glow
        # is a gradient, which is the one thing a flat shelf cannot have
        "05": "the crow standing upright with its head lifted and its eye wide, one small flat "
              "yellow lightbulb shape drawn beside its head with no glow and no rays, an idea "
              "arriving. Nothing else in the frame — no sky, no ground line, no gradient",
        "06": "the crow holding one small grey pebble in its beak over the clay pot, three more "
              "pebbles on the ground beside it, ripples in the water below",
        "07": "the crow drinking from the clay pot with its beak in the water, blue water up to "
              "its beak, happy closed eyes",
        "08": "the crow flying with wings spread, looking back down and smiling, the clay pot "
              "and three pebbles small on the ground below",
        "moral": "the crow perched calmly on a low branch, wings folded, one thoughtful eye, "
                 "a small yellow lightbulb glowing gently beside its head",
    },
    "aamai-annangal": {
        "01": "a small green tortoise sitting alone at the edge of a round blue pond, looking "
              "a little lonely",
        "02": "two white geese landing beside the pond with wings spread, greeting the tortoise, "
              "both smiling",
        "03": "the tortoise looking down sadly at its own short stubby legs, one small tear",
        "04": "the two geese carrying a small checked cloth between them with their beaks, "
              "offering it to the happy tortoise",
        "05": "the tortoise held up in the middle of the small cloth, carried through the air by "
              "the two geese each holding one corner, three small clouds around them",
        "06": "one small farmer standing on the ground below, pointing up at the sky with an "
              "open-mouthed amazed face",
        "07": "the tortoise in the cloth high in the air, its mouth open mid-word with a delighted "
              "face, beginning to tip forward, one small motion line",
        "08": "the tortoise sitting safely on a patch of soft green grass, the two geese bending "
              "over it with relief, all three smiling",
        "moral": "the tortoise sitting contentedly on green grass beside the pond with its two "
                 "goose friends, all calm and happy",
    },
    "vanaram-mudalai": {
        "01": "a monkey sitting on a tree branch holding one big yellow mango, a blue river "
              "ribbon below the tree",
        "02": "the monkey on the branch handing down two yellow mangoes to the crocodile who "
              "floats in the water with only its head and eyes showing",
        "03": "the crocodile floating with only its head and round eyes above one simple blue "
              "water band, two yellow mangoes balanced on its snout, the monkey waving from the "
              "top of the frame. Nothing else in the frame — no riverbank, no far shore, no trees",
        "04": "a second crocodile underwater with heart-shaped bubbles, whispering to the first "
              "crocodile who looks worried",
        "05": "the crocodile in the water with a sad drooping eye, one front paw raised asking, "
              "the monkey looking puzzled on the bank",
        "06": "the monkey sitting on the branch with one hand on its chin and a small sparkle by "
              "its eye, thinking cleverly",
        "07": "the monkey high in the tree pointing down at the trunk with both arms, calling "
              "out, the crocodile waiting below",
        "08": "the monkey safe in the tree with arms folded, and the crocodile turning away in "
              "the water, both calm and no longer friends but not angry",
        "moral": "the monkey sitting quietly on a branch with eyes half closed and one hand on "
                 "its chest, calm and thoughtful",
    },
    "singam-muyal": {
        # every prompt in this book needs the hard clause: lion stories want a forest,
        # and a forest is scenery, and scenery is what the shelf does not have
        "01": "a big orange lion standing tall with its mouth closed in a kind roar, three small "
              "animals peeking out from behind its legs. Nothing else in the frame — no forest, "
              "no trees, no grass, no ground line",
        "02": "a tight circle of four small animals — deer, rabbit, goat, monkey — sitting and "
              "looking up with paws together at one seated lion. Nothing else in the frame — no "
              "forest, no trees, no grass, no ground line",
        "03": "a tiny grey rabbit standing alone on the ground facing the big lion, the lion "
              "frowning down at it, size contrast comic and friendly",
        "04": "the rabbit looking up and talking calmly to the lion, one small paw raised "
              "reassuringly, the lion listening with one ear tilted",
        # "well" is the worst word in this book: it summons a stone structure, a rope,
        # a roof and a lawn. Draw the rim as an object, never the place
        "05": "the rabbit standing beside one plain round stone ring standing on its side, "
              "pointing down into the middle of it, the lion behind. Nothing else in the frame — "
              "no well house, no wall, no rope, no bucket, no trees, no grass",
        "06": "a flat blue circle drawn as a mirror showing the lion's own simple mirrored face "
              "inside it, the real lion leaning over the top edge of the circle with shocked "
              "eyes. Nothing else in the frame — no well, no water surface, no stone wall, no "
              "trees, no sky",
        "07": "the little rabbit hopping with joy in the middle while four small animals dance "
              "around it in a circle. Nothing else in the frame — no forest, no trees, no grass, "
              "no ground line",
        "moral": "the small grey rabbit sitting with a knowing smile, one flat yellow lightbulb "
                 "shape drawn beside its head with no glow and no rays, one paw over its mouth. "
                 "Nothing else in the frame",
    },
    "muyal-aamai": {
        "01": "the hare standing puffed up with its chest out and one paw on its hip, bragging, "
              "a cocky grin",
        "02": "the tortoise smiling slowly and kindly with one eye half closed, nodding yes",
        "03": "the hare and the tortoise at a chalk start line, the hare already a blur of speed "
              "with three motion lines, four animals watching from the side",
        "04": "the hare looking back over its shoulder, the tortoise a very small dot far behind, "
              "the hare yawning with a wide mouth",
        "05": "the hare fast asleep curled under a tree with three Zzz above its head, the "
              "tortoise walking steadily past in the foreground",
        "06": "the hare bolting upright awake with wide eyes and ears straight up, sweat drops, "
              "the tortoise just ahead of the finish line ribbon",
        "07": "the tortoise crossing a small red ribbon at the finish line, arms up, four "
              "animals cheering with confetti dots, the hare behind clapping politely",
        "moral": "the tortoise mid-step, one foot in front of the other, steady-eyed and calm, "
                 "a single small forward arrow beside it",
    },
    "singam-eli": {
        "01": "the lion asleep on its side with eyes closed and a small snot bubble, the tiny "
              "mouse standing on top of the lion's big paw mid-games",
        "02": "the lion awake and frowning, holding the tiny mouse gently in one huge paw, "
              "size contrast comic",
        "03": "the mouse with paws together begging, the lion laughing with a wide friendly "
              "open mouth, letting go",
        "04": "the lion tangled in a rope net on the ground, mouth open roaring, rope knots "
              "visible, sad eyes",
        "05": "the tiny mouse biting through one rope of the net with its teeth showing, "
              "determined eyebrows, the lion watching hopefully",
        "06": "the net cut open in a ragged hole, the lion standing up free and stretching, "
              "the rope cut into three pieces on the ground",
        "07": "the big lion lying down with eyes closed smiling and the tiny mouse sitting on "
              "the lion's nose, both at peace",
        "moral": "the tiny grey mouse sitting proudly on the lion's huge round paw, a small "
                 "heart floating between them",
    },
    "kakku-nari": {
        "01": "the crow perched on a branch holding one round golden sesame sweet in its beak, "
              "guarding it jealously",
        "02": "the fox sitting on the ground below the branch looking up with big round admiring "
              "eyes and a sweet smile, tail curled",
        "03": "the fox with one paw raised in flattery and three small hearts floating up, the "
              "crow on the branch puffed up with pleasure",
        "04": "the crow on the branch with its beak wide open mid-caw, eyes shut proudly, the "
              "golden sweet tipping out of its beak and falling, three motion lines",
        "05": "the fox sitting on the ground happily holding the round golden sweet with both "
              "front paws, laughing with closed eyes",
        "06": "the crow alone on the branch with wings folded and one thoughtful eye, looking "
              "down at the empty ground, wiser",
        "moral": "the crow perched calmly on the branch with a small yellow lightbulb beside "
                 "its head and a flat unimpressed expression",
    },
    "kazhudhai-singa-udai": {
        "01": "a grey donkey in the forest looking down at an old lion costume hood lying on "
              "the ground, curious",
        "02": "the grey donkey wearing a loose lion costume hood over its head, one long grey "
              "ear poking out through the mane, standing still and looking shy. Nothing else in "
              "the frame — no forest, no trees, no grass, no ground line",
        "03": "a deer, two ducks and a goat all running away with wide frightened eyes, the "
              "donkey in the lion hood standing behind them smiling",
        "04": "the donkey in the lion hood standing tall with its chest out and chin up, "
              "proudly puffing its cheeks",
        "05": "the lion hood tipping off the donkey's head in a gust of wind shown by three "
              "curved air lines, the donkey braying with its mouth wide open",
        "06": "the small fox sitting and laughing with closed eyes and one paw on its belly, "
              "the plain donkey standing beside it looking embarrassed, hood on the ground",
        "07": "the plain grey donkey walking away with its head low and ears drooping, the "
              "torn lion hood in a heap on the ground, three small animals watching",
        "moral": "the plain grey donkey standing on its own with a small honest smile, no "
                 "costume, ears upright and relaxed",
    },
    "iru-punai-kurang": {
        "01": "two small cats, one ginger one grey, crouched over one round brown bread bun on "
              "the ground between them, both eyeing it",
        "02": "the two cats pulling the bread apart from opposite ends with faces set in an "
              "argument, three anger marks above their heads",
        "03": "a cheeky brown monkey walking up with one paw raised like a judge, the two cats "
              "sitting either side holding the bread",
        "04": "the monkey biting a chunk out of the left piece of bread with its mouth open, "
              "the ginger cat watching, the two pieces unequal",
        "05": "the monkey biting a chunk out of the right piece of bread, the grey cat watching, "
              "crumbs in the air",
        "06": "the monkey patting a very round full belly with a cheeky grin, empty crumbs on "
              "the ground, the two cats sitting with big sad eyes",
        "07": "the ginger and grey cats sitting side by side leaning against each other, one paw "
              "over the other, both smiling, no bread at all",
        "moral": "the two cats sharing one small fish between them peacefully, the monkey "
                 "slinking away in the corner",
    },
    "neela-nari": {
        "01": "a small plain brown jackal running in fear with wide eyes, three animals behind "
              "it chasing with raised paws",
        "02": "the jackal tumbling into a round blue vat of dye, blue splashes flying up, its "
              "face surprised",
        "03": "the jackal standing dripping and entirely bright blue, four animals staring with "
              "round surprised eyes, three blue drops falling",
        "04": "the grey elephant bowing its head down respectfully towards the small blue "
              "jackal, other animals sitting behind the elephant",
        "05": "the blue jackal strutting with its chin up and chest out like a grand person, "
              "tail high, two small animals watching in awe",
        # a hill under a moon is a landscape by definition — hang the moons on the
        # jackals instead of hanging the jackals under a moon
        "06": "three plain brown jackals sitting in a row with their heads tilted straight up "
              "howling, one small flat yellow crescent moon shape drawn above each head with no "
              "glow and no rays. Nothing else in the frame — no hill, no night sky, no stars, "
              "no ground line",
        "07": "the blue jackal in the middle with its head tilted back howling too, mouth open, "
              "the other animals all turning their heads to stare at it",
        "08": "the blue jackal running away with its tail down while four animals chase it off, "
              "the blue paint still bright",
        "moral": "one plain brown jackal sitting quietly alone with a small gentle smile and "
                 "its tail curled around its paws, no blue paint",
    },
}

PAGE_TAIL = ("storybook page illustration for a toddler board book, one clear frozen moment, "
             "the characters doing exactly this one thing and nothing else, the whole scene "
             "readable at a glance from across the room, warm and friendly, nothing scary, "
             "plain solid cream background, lots of empty space around the subject, "
             "no border, no text, no words, no letters")

# The shelf is stickerflat; pages must match it or the book looks like two books.
PAGE_STYLE = "stickerflat"


def page_seed(book_id):
    """One seed per book, not per page: same noise, so the look holds still."""
    return 500 + int(hashlib.sha1(("page:" + book_id).encode()).hexdigest()[:5], 16) % 90000


def page_art_name(book_id, key):
    return "p-%s-%s.webp" % (book_id, key)


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


# A frame whose paper is not flat is the one failure mode that makes a whole
# book look generated, so promotion refuses it outright rather than shipping a
# sunset behind a toddler's line of Tamil. Measured AFTER flatten_image, because
# flatten is supposed to be what fixes the paper — when it does not, the frame
# came back with scenery painted right across it and there is nothing left to
# rescue. Covers pass this at 0.1; a page over the limit is a different picture.
BG_LIMIT = 3.0


def promote_page(book_id, key, out, colours, src=None, force=False):
    """Flatten an approved page render to the stable name stories.js points at.

    Same deal as a cover: the generated filename carries a content hash, which is
    right in a cache and useless in a data file, so the app only ever names
    p-<book>-<nn>.webp and re-promoting swaps the picture behind it.
    """
    from PIL import Image
    if not src:
        cands = sorted(glob.glob(os.path.join(out, "page_%s_%s_*.png" % (book_id, key))),
                       key=os.path.getmtime)
        if not cands:
            print("   ✗ no render for %s page %s yet — --pages --only %s --page %s"
                  % (book_id, key, book_id, key))
            return None
        src = cands[-1]
    before = metrics(src) or {}
    flat = flatten_image(Image.open(src), colours)
    dst = os.path.join(out, page_art_name(book_id, key))
    flat.save(dst, "WEBP", quality=90, method=6)
    after = (metrics(dst) or {}).get("bg_dev")
    if after is not None and after > BG_LIMIT and not force:
        os.remove(dst)
        print("   ✗ %s p%s  refused — paper still %s after flatten (limit %.1f). "
              "The model painted scenery; render it again on a different seed."
              % (book_id, key, after, BG_LIMIT))
        return None
    print("   ✓ %s  %d KB  (colours %s → %s, background %s → %s)"
          % (dst, os.path.getsize(dst) // 1024, before.get("colours"),
             (metrics(dst) or {}).get("colours"), before.get("bg_dev"), after))
    return dst


def page_plan(book_id, only=None):
    """(key, prompt) pairs for one book, in reading order."""
    scenes = PAGE_SCENES[book_id]
    cast = BOOK_CAST[book_id]
    keys = sorted(scenes, key=lambda k: (k == "moral", k))
    if only:
        want = {x.strip() for x in only.split(",") if x.strip()}
        unknown = want - set(keys)
        if unknown:
            print("   no such page(s) %s in %s — have %s"
                  % (", ".join(sorted(unknown)), book_id, ", ".join(keys)))
            sys.exit(1)
        keys = [k for k in keys if k in want]
    out = []
    for k in keys:
        # cast last but one: the sampler weighs the tail hardest, and the tail is
        # the part that must not change between books (flat cream, no text).
        prompt = "%s. Cast: %s. %s" % (scenes[k], cast, PAGE_TAIL)
        out.append((k, prompt))
    return out


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
    ap.add_argument("--only", help="one story id, for --covers/--pages")
    ap.add_argument("--pages", action="store_true",
                    help="render the interior page art (73 story pages + 10 morals) in the shelf style")
    ap.add_argument("--page", help="page number(s) for --pages, e.g. 03 or 01,02,moral")
    ap.add_argument("--promote-pages", metavar="STORY_ID",
                    help="flatten every rendered page of one book into p-<id>-<nn>.webp")
    ap.add_argument("--promote-pages-all", action="store_true", help="promote every page rendered so far")
    ap.add_argument("--page-list", action="store_true", help="print the page plan and exit (no GPU)")
    ap.add_argument("--seed", type=int, default=None,
                    help="override the per-book seed — a frame that will not sit flat "
                         "usually needs a different start, not more words")
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

    if a.page_list:
        ids = [a.only] if a.only else list(PAGE_SCENES)
        n = 0
        for i in ids:
            print("\n%s  seed %d" % (i, page_seed(i)))
            for k, pr in page_plan(i, a.page):
                print("  %s  %s" % (k, pr[:110] + "…"))
                n += 1
        print("\n%d pages planned across %d books" % (n, len(ids)))
        return

    if a.pages:
        ids = [a.only] if a.only else list(PAGE_SCENES)
        for i in ids:
            if i not in PAGE_SCENES:
                print("no such story id: %s (have: %s)" % (i, ", ".join(PAGE_SCENES)))
                sys.exit(1)
        style = "stickerflat" if a.style == "papercut" else a.style
        out = a.out if a.out != OUT_DEFAULT else os.path.join(ROOT, "images", "books")
        plan = [(i, k, p) for i in ids for k, p in page_plan(i, a.page)]
        print("▸ %d pages, style %s, %d×%d, ~%.1f h at 95s each"
              % (len(plan), style, a.w, a.h, len(plan) * 95 / 3600))
        made, failed = 0, []
        for i, k, prompt in plan:
            sd = a.seed if a.seed is not None else page_seed(i)
            print("  %s p%s  seed %d" % (i, k, sd))
            got = one(style, prompt, a.w, a.h, sd, a.steps, out,
                      "page_%s_%s" % (i, k), a.timeout, a.dry_run, a.skip_existing)
            if got is None and not a.dry_run:
                failed.append("%s/%s" % (i, k))
            else:
                made += 1
        print("\n%d pages %s into %s" % (made, "planned" if a.dry_run else "rendered", out))
        if failed:
            print("❌ %d failed: %s" % (len(failed), ", ".join(failed[:8])))
            print("   re-run with --skip-existing to retry only those")
        if not a.dry_run:
            print("\n→ review them, then:  --promote-pages <id>   (or --promote-pages-all)")
        return

    if a.promote_pages or a.promote_pages_all:
        from PIL import Image  # noqa: F401
        out = a.out if a.out != OUT_DEFAULT else os.path.join(ROOT, "images", "books")
        ids = list(PAGE_SCENES) if a.promote_pages_all else [a.promote_pages]
        n, total = 0, 0
        for i in ids:
            for k, _ in page_plan(i, a.page):
                if promote_page(i, k, out, a.colours):
                    n += 1
                    total += os.path.getsize(os.path.join(out, page_art_name(i, k)))
        print("\n%d pages promoted, %s of page art on disk" % (n, human(total)))
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
