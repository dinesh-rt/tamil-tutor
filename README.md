# தமிழ் Tutor · Tamil for little ones

A tap-and-hear flashcard app for toddlers learning Tamil. Every word is a big
friendly picture, the Tamil word, the English word, and a voice that says both
out loud. Three little games turn practice into play, and everything a child
does earns stars.

* **702 words** across **29 topics** — animals, food, family, body, feelings,
  actions, vehicles, festivals, manners, numbers, opposites and more
* **Spoken aloud** with the browser's own speech engine — Tamil first, then
  English (or the other way round), repeat as often as you like
* **Four games** — Listen & Pick, Peek-a-boo, Find-them-all, Say it in English
* **Stars and a sticker book** — every star is a word your child met; tap a
  star to hear it again
* **Grown-up corner** — progress report, speech tuning, your own words, backups,
  printable cards
* **Truly offline** — one service worker, no accounts, no ads, no analytics, no
  network calls after the first load. Progress lives in `localStorage` only.

No build step, no framework, no npm dependencies. Plain HTML + CSS + ES2020
JavaScript. Open `index.html` and it runs.

---

## Try it

```bash
cd tamil-tutor
python3 tools/serve.py          # or: npm start
```

Open <http://localhost:8080>. The server prints an address for your phone too —
open it on the same Wi-Fi, then **Share → Add to Home Screen** for a full-screen
app with no browser bar.

Serving over `http://` (not `file://`) is what lets the service worker and
"add to home screen" work. Double-clicking `index.html` also works, minus those
two niceties.

Prefer one file to share?

```bash
python3 tools/build-single-file.py    # → dist/tamil-tutor.html (everything inlined)
python3 tools/build-portable.py       # → dist/portable/ + zip: opens from file:// with voices

npm run verify                        # syntax + word bank + bundle, one command
npm run release                       # ...plus portable/offline builds and a fresh worker stamp
npm test                              # all 9 browser suites in one go
```

---

## Playing around

| Screen | What it does |
| --- | --- |
| 🏠 Home | Greeting from the elephant, five new words for today, "worth another look", all topics |
| 📚 Learn | Pick a topic → flashcards, games, or the whole word wall |
| 🃏 Flashcards | One huge card. Tap the picture to hear the word. Swipe or use the big ◀ ▶ arrows. A star every 5 cards |
| 🎲 Play | **Listen & pick** (hear the word, tap the picture), **Peek-a-boo** (lift the leaves), **Find them all** (tap every picture from this topic), **Say it in English** (hear the Tamil, the child says the English word — you tap the ⭐) |
| ⭐ Stars | The sticker book of every word earned |
| 🔊 / 🧩 | Mute everything · grown-up corner |

Keyboard, for the grown-ups testing on a laptop: `←` `→` move through cards,
`space` repeats the word, `Esc` closes a sheet.

Hidden door: when **Grown-up corner needs a hold** is switched on, the puzzle
button disappears and the corner opens by **pressing and holding the elephant
for 3 seconds** — small fingers rarely manage that.

---

## Books — ten little board-books

`📖 Books` (or `#/library`) is a shelf of ten books built out of the words the
app already knows: a cover, six to eight pages, and a celebration at the end
that leaves one ⭐ on the shelf.

```bash
npm run site -- --check     # also checks every book word has a recording
```

| Page | What happens |
|---|---|
| word | one big card, tap it to hear the recording again |
| hidden | leaves and a `❓` until a finger finds it — peek-a-boo with vocabulary |
| count | “two kites”, that many pictures, the number said in Tamil |
| quiz | one word spoken, three pictures, tap the one you heard |
| end | applause, confetti, and the sticker |

Pages turn with the round buttons, `←` `→`, or `▶▶` which reads the whole book
by itself — useful at bedtime on a laptop, useless on a phone with the screen
off, because iOS Safari stops a web app's audio when the screen sleeps.

**Why these ten are made of word cards.** A book is only worth shipping if the
Tamil on the page and the Tamil in the ear are both right, and this repo has no
authority to invent sentences. So every page quotes an existing word entry, and
the book titles are the word bank's own category names — nothing here needed a
new recording or a new phrase. When real stories arrive (a grandparent on a
phone, a CC-BY publisher), the reader already understands
`{k:'line', ta, en, clip:'books/x/p01.mp3', dur}` and will play them unchanged.

That is also why `playClip` now takes `dur`: the deck's anti-stall timer cut
every clip off at 9 seconds, which is invisible on a 1-second word clip and
would have talked over the middle of every narration page. `tools/build-site.py`
fails the build if a book points at a word the recordings don't cover — the
same class of silent failure as a missing voice pack.

The shelf remembers where each book was left off, and a book pays out its star
once: re-reading it counts, farming it does not.

### Pictures on every page

A story page is the spoken Tamil line first and a picture second — so the
picture is *named*, never listed. Page *n* of a book asks for
`images/books/p-<id>-<nn>.webp`, the same way page *n* asks for
`audio/books/<id>/p<nn>.mp3`. Nothing in `js/data/stories.js` enumerates 83
filenames, and `--promote-pages` can repaint a whole book without one line of
data changing.

```bash
python3 tools/make-story-art.py --pages --only kakku-kudam   # render 9 frames
python3 tools/make-story-art.py --promote-pages kakku-kudam  # flatten to p-<id>-<nn>.webp
npm run check                                                # books: 83 pages, N illustrated
```

Three things keep ten books looking like one shelf rather than a ransom note:

- **the cast is repeated verbatim** in every prompt of a book (`BOOK_CAST`), so
  the crow on page 1 is the crow on page 8 — a two-year-old notices a character
  that changes between pages even when a grown-up does not;
- **one seed per book, not per page**, so the sampler starts from the same noise
  and palette and lighting drift far less across nine frames;
- **`flatten_image` runs after the sampler**, snapping to a 10-colour palette and
  one solid paper colour. No prompt holds a diffusion model to one look across
  83 pages, so the look is imposed afterwards — and `metrics()` measures the same
  two numbers, so a bad batch can be rejected without a human eye on every frame.

A page with no picture is still a finished page: it is narrated and readable, so
a missing webp hides the `<img>` and moves on. One failing request for a book
switches that book's remaining pages off, so a shelf whose art never arrived
stops asking instead of firing 83 404s per read-through. `npm run site` prints
`pages 61 of 83 story pages illustrated` as a report — unlike a missing *cover*,
which fails the build, because an emoji shelf is not a book shelf but a story
without a picture still is.

---

## Adding your own words

Words live in `js/data/*.js`. Open the file for the right group and add a line:

```js
D.words('animals', [
  { en: 'Dog', ta: 'நாய்', ro: 'naai', img: '🐕', mo: 'bounce' },
  // your line:
  { en: 'Kitten', ta: 'பூனைக்குட்டி', ro: 'poonaikkutti', img: '🐈', mo: 'hop',
    say: 'இந்தா பார், ஒரு பூனைக்குட்டி!' }
]);
```

| field | meaning |
| --- | --- |
| `en` | English word *(required)* |
| `ta` | Tamil word in Tamil script *(required)* |
| `ro` | Romanised spelling — used by the voice when the device has no Tamil voice, and shown under the Tamil word |
| `img` | Any emoji, or `svg:name` for the hand-drawn sprites (`papaya`, `pomegranate`, `guava`, `jackfruit`, `idli`, `laddu`, `murukku`, `kuzhal`, `kolam`, `head`, `belly`, `okra`, `bottlegourd`, `seahorse`, `neck`, `star`) |
| `mo` | Optional animation name — see *Motion* below. Leave it out and the picture stays still |
| `say` | Optional short Tamil sentence shown as a 💬 chip; tapping it speaks the whole sentence |
| `q` | For number words: how many pictures to show (`1`–`10`) |
| `sym` | Optional Tamil numeral/digit badge shown on the card |
| `tag` | Optional free-text label |

Then check your work:

```bash
node tools/check-data.js     # or: npm run check
```

It complains about missing fields, duplicate ids, `ta` values that contain no
Tamil letters, `ro` values that are not plain ASCII, emoji that are not emoji,
and `svg:` names that do not exist.

### A new topic

```js
D.category({
  key: 'temple',              // unique, lowercase
  en: 'Temple',               // English name
  ta: 'கோயில்',               // Tamil name
  icon: '🛕',                 // one emoji for the tile
  color: '#e11d48',           // tile colour, #rrggbb
  desc: 'Things we see'       // one-line description
});

D.words('temple', [ /* … */ ]);
```

Add the file to the `<script>` list in `index.html` (and to `ASSETS` in
`sw.js`, and `JS` in `tools/build-single-file.py`) if it is a brand-new file.
Bump the `CACHE` name in `sw.js` when you ship so waiting clients pick it up.

### Custom words without touching code

Grown-up corner → **Your own words**: English, Tamil, romanisation, an emoji or
`svg:` sprite, and an optional sentence. They land in a **My words** topic and
are saved in `localStorage` — handy for words your family actually uses.

---

## Motion

A picture is **still** unless the word asks for movement. Only things that are
actually doing something move: the 64 verbs in *Actions* and a small set of
always-moving nature words (rain, river, sea, wind, fire, stars, clouds, the
spinning earth, storm, lightning, thunder, snow, breeze, laughing, crying).
Everything else — a mango, a giraffe, a spoon — is shown as a plain picture, so
the screen is calm and the child looks at the *word*, not at the wobble.

To animate a word, give it a `mo` name (`bounce`, `sway`, `flutter`, `drive`,
`steam`, `stomp`, `sing`, `waddle`, `blink` … — ~140 of them) and
`css/animations.css` maps those names onto ~80 keyframes. `tools/check-data.js`
complains if the name has no matching `.mo-…` class, and unknown names simply
render still.

Verbs are the ones worth animating: `swim`, `clap`, `stomp` teach the action
itself, so the animation *is* the meaning. A static noun does not need one.

Motion is switched off automatically for `prefers-reduced-motion`, and manually
with **Grown-up corner → Behaviour → Less motion**.

---

## Speech, voices and the Tamil-voice problem

`js/lib/audio.js` uses the Web Speech API. It scores the installed voices
(local > named-Tamil > "natural/enhanced") and picks the best one for `ta` and
`en-IN`.

If the device has **no Tamil voice**, nothing breaks: the app reads the
`ro` field with an English voice, so `நாய்` comes out as "naai" — close enough
for a toddler, and the real thing appears as soon as a Tamil voice is installed.

* **Android** — Settings → System → Languages → *Text-to-speech output* → install
  Tamil (Google TTS has it)
* **iPhone/iPad** — Settings → Accessibility → Spoken Content → Voices →
  Tamil → download
* **Chrome/Windows** — Settings → Time & languages → Speech → add a Tamil voice,
  or install the *Microsoft Kannan/Leslie* family
* **Linux** — install `speech-dispatcher` + an ESpeak/cato voice pack

Sound effects (taps, pops, cheers, drum, bell) are synthesised with WebAudio —
no audio files anywhere. iOS/Safari needs one tap before any sound can start, so
the first touch of the session unlocks both audio and speech.

---

## The audio pack — real human voices (optional, recommended)

Browser speech is only as good as the voice installed on the device, and for
Tamil that usually means a robotic fallback. The app can instead play real
recordings — generated once on your laptop, then used completely offline.

```bash
npm run voices            # same as: python3 tools/make-voice-pack.py
```

First run creates `tools/.venv-tts` and installs `edge-tts` (Microsoft's free
neural voices — no account, no API key, no key anywhere in the app). You need
the internet **only while generating**. Output:

```
audio/manifest.json                 what the app reads to know what exists
audio/ta/animals__dog.mp3           நாய்   · ta-IN-PallaviNeural (female)
audio/en/animals__dog.mp3           dog     · en-IN-NeerjaNeural
audio/ta/say/animals__dog.mp3       the 💬 sentence chip
```

About **17 MB for all 702 words**, ~4 minutes on a normal connection. Then
reload the app and the cards speak like a person. Grown-up corner → *Real
recordings* shows what was found, can switch recordings off (back to the device
voice), and has **Save all voices for offline** to warm the cache so the app
works with the Wi-Fi switched off.

```bash
python3 tools/make-voice-pack.py --category animals      # just one topic
python3 tools/make-voice-pack.py --only ta               # Tamil clips only
python3 tools/make-voice-pack.py --voice-ta ta-IN-ValluvarNeural   # male voice
python3 tools/make-voice-pack.py --list-voices
python3 tools/make-voice-pack.py --force                 # re-make everything
```

It is fully resumable: existing clips are kept, missing ones are retried, and a
half-finished pack is harmless because any word without a clip quietly falls
back to the browser voice. Your own custom words and new sentences always use
the browser voice (generate clips for them with `--category custom`).

The single-file `dist/tamil-tutor.html` has no audio files next to it, so it
simply uses the browser voice — that is expected.

## Portable and completely offline

The app already makes **zero network calls** — no CDN, no web fonts, no
analytics, nothing fetched at runtime. Voices are the device's own, sound
effects are synthesised, and the recordings are local files. So it works with
the Wi-Fi switched off; these builds make it easy to carry around.

```bash
npm run portable          # → dist/portable/ + dist/tamil-tutor-portable.zip
npm run portable -- --single   # → dist/tamil-tutor-offline.html (one file, audio inside)
npm run share             # serve dist/portable on your Wi-Fi → Add to Home Screen
```

| Build | What it is | Recordings | Needs |
|---|---|---|---|
| `dist/portable/` (**recommended**) | one folder: `index.html` + `audio/` + `manifest.webmanifest` + `sw.js` + `icons/` | ✅ plays from the folder | nothing — double-click `index.html`, or `npm run share` to install it on a phone |
| `dist/tamil-tutor-portable.zip` | that folder zipped (14 MB) — email it, put it on a USB stick or school PC | ✅ | unzip + double-click |
| `dist/tamil-tutor-offline.html` | literally **one 20 MB file** with every clip base64'd inside | ✅ decoded lazily into Blob URLs | double-click |
| `dist/tamil-tutor.html` | 266 KB, no audio beside it | ❌ uses the device voice | double-click |
| `site/` | what GitHub Pages serves — the normal files, un-inlined | ✅ served from `/audio/` | `npm run site`, then push (see *Hosted*) |

## Hosted — GitHub Pages (free)

The app is also live at **<https://dinesh-rt.github.io/tamil-tutor/>**. Open it on a
phone, Share → *Add to Home Screen*, and it installs full-screen; once the worker has
the shell and the clips, it opens with the Wi-Fi off. No app store, no Mac, no cost.

```bash
npm run site                      # → site/  (what gets published, nothing else)
npm run site -- --check           # same checks, builds to a temp folder and discards
python3 tools/serve.py 8123 site  # preview the exact published bytes locally
```

`.github/workflows/deploy-pages.yml` publishes `main` on every push: `verify --quick`,
then `tools/build-site.py`, then the Pages deploy. One-time switch, because GitHub
cannot guess that you want Actions to be the publisher: **Settings → Pages → Source →
GitHub Actions**. Before that first deploy the workflow builds green and deploys to
nothing.

`tools/build-site.py` is `cp -r` with opinions, because the two ways this breaks are
both silent:

1. **No recordings.** A site missing `audio/` still opens — it just speaks with the
   device voice, so Tamil sounds odd and nobody can say why. The build cross-checks
   every clip promised by `audio/manifest.json` against the files that actually ship,
   and refuses if one is absent. This is why `audio/` is tracked in git now: Pages
   serves the repo, and Git LFS's free tier caps at 1 GB/month of bandwidth (~60
   installs of a 15 MB pack) where Pages' own 100 GB/month is the gentler limit.
2. **A stale worker.** `sw.js` keeps its hand-bumped `VERSION` in the repo, but each
   deploy stamps the *copy* with a hash of the shell plus `audio/manifest.json`. Every
   real change replaces the cache on every installed phone; an identical rebuild does
   not, so re-deploying cannot churn anyone's cache.

The published files are also checked: every `src`/`href` in `index.html` and every
entry in the worker's `ASSETS` precache list must exist in `site/`, and
`audio/pack-index.js` is deliberately left out — it exists for `file://`, where
`fetch()` is blocked; over http the app reads `audio/manifest.json` instead.

Two things to know before you move it:

* **Progress is tied to the URL.** Stars, stickers and custom words live in that
  origin's `localStorage`, so `github.io/tamil-tutor` → your own domain means every
  child starts from zero. Pick the URL you mean to keep, or Export first (🧩 → *Data*).
* **Free Pages is public.** The repo is public, so the site is too — harmless here, but
  a secret family word list is not what a public origin is for. A custom domain is free
  either way: add a `CNAME`, point a `www.` record at the Pages host, tick *Enforce HTTPS*.


How it survives `file://` (where `fetch()` is blocked): the folder build ships
`audio/pack-index.js`, a plain `<script>` that hands the clip list to the app as
`window.TT_AUDIO_PACK`; the one-file build carries the list and the clips in
inert `<script type="application/json">` / `text/plain` blocks. Both paths are
verified to load clips and save progress with no server at all.

**Two honest caveats**
1. *Progress lives in the browser you used.* On your own machine it just
   remembers. On somebody else's computer, use 🧩 → *Data → Export* before you
   leave and *Restore* it at home. (Different browser = different storage.)
2. *Install (Add to Home Screen) needs http(s).* The portable folder now ships
   its own `manifest.webmanifest`, `sw.js` and icons, so `npm run share`
   (→ `http://<your-ip>:8090`) makes it installable on a phone — and once the
   worker has the shell and the clips in its cache, it opens full-screen with
   the Wi-Fi off. Opening the same `index.html` by double-clicking still works;
   the app only registers a worker when it is served over http(s).

Want the strictest possible local-only mode? 🧩 → *Speech & sound →* **Never
speak over the internet** — that bans network voices entirely, so nothing you
type can leave the device. (The recordings make this mostly moot, since they
are the audio the app uses anyway.)

## English-only practice

Two ways to switch, both in the grown-up corner → *Flashcards → Words shown*:

| Mode | Card shows | Speaks |
|---|---|---|
| **Both** (default) | picture + Tamil + English | Tamil then English |
| **Tamil only** | picture + Tamil | Tamil |
| **English only** | picture + English | English |

*English only* is the one for recall practice: the picture is there, the Tamil
is hidden, and the child has to produce the English word. The **Say it in
English** game does the same thing as a game — picture up, Tamil spoken as the
cue, the English answer hidden behind *👀 Show the word*, and you tap **⭐ He
said it** when they say it (a sticker every 3 words).

Want the recordings a different speed? Grown-up corner → *Speech & sound →
Recording speed* (0.70×–1.25×). It changes playback instantly — no need to
regenerate anything. To bake a different rate into the files themselves, use
`python3 tools/make-voice-pack.py --rate-ta +0% --rate-en -12% --force`.

## Progress, stars and the review queue

`js/lib/storage.js` keeps one record per word:

```
{ seen, correct, wrong, first, last }
```

| level | when | meaning |
| --- | --- | --- |
| 0 | never seen | new |
| 1 | seen once | met |
| 2 | seen 4× or 1 right | familiar |
| 3 | 4 right | mastered |

Words also sit in a **Leitner box** (0–4) that decides when they come back. Answer
one right and it moves up — back in **1, 3, 7 or 21 days**; get it wrong and it
drops to box 0, due again today. Overdue words sort wrong-first, then lowest box,
then most overdue, and Home shows them as **மீண்டு பாப்போம் / Today — n words
waiting** with a **▶ Play** button that runs a Listen & Pick round over exactly
those words (`#/play/today`). A deck is 8 words: what is due, plus up to two
brand-new ones, so practice never runs dry or feels like a chore. The same queue
feeds **Play → Practise these**.

Stars are awarded every 5 cards, on correct answers, and for finishing a
Find-them-all round; they collect in the sticker book.

Everything is stored under the `tamil-tutor.v1` key. Grown-up corner can export
JSON, copy to clipboard, restore from a paste, and reset progress, settings or
everything.

---

## Print at home

Grown-up corner → Help → **open a printable sheet** (or `#/print/animals`) gives
a clean grid of cards with picture, Tamil, spelling and English — the browser
bar and tab bar disappear when printing.

---

## Layout of the code

```
index.html              app shell, loads everything in order
css/app.css             layout, colours, day/night themes, print styles
css/animations.css      every word animation + reduced-motion rules
js/lib/util.js          DOM helpers, random/clone/debounce, haptics, fullscreen
js/lib/sprites.js       hand-drawn SVG pictures for things emoji cannot do
js/lib/audio.js         speech queue, voice scoring, WebAudio sound effects
js/lib/storage.js       settings + progress in localStorage, stars, review queue
js/lib/confetti.js      canvas confetti and star bursts
js/data/core.js         the word registry (categories, words, search, shuffle)
js/data/nature.js       animals · birds · sea · bugs · nature · weather
js/data/food.js         fruits · veggies · food · drinks
js/data/home.js         home · kitchen · clothes
js/data/people.js       family · jobs · body · feelings
js/data/mind.js         colours · numbers · shapes · opposites · manners · time
js/data/play.js         actions · toys · music · vehicles · festivals · school
js/ui.js                the flash card, tiles, sheets, toasts — shared parts
js/app.js               chrome, hash router, home, topic pages, search, boot
js/views/learn.js       flashcard deck (swipe, autoplay, stars)
js/views/games.js       the three games + practice mode
js/views/stickers.js    sticker book
js/views/grownup.js     parent panel, custom words, data tools, print view
tools/check-data.js     word-bank linter
tools/serve.py          dev server with caching off
tools/build-single-file.py  inline everything into one shareable html file
tools/build-portable.py     offline folder + zip, or one file with the audio inside
tools/verify.py             one-command health check + service-worker stamping
tools/run-tests.js          runs the browser suites in one go
tools/make-icons.py     regenerate the PNG app icons
manifest.webmanifest    PWA manifest
sw.js                   cache-first service worker
```

Routing is plain hashes: `#/`, `#/learn`, `#/cat/animals`, `#/cards/animals`,
`#/wall/animals`, `#/play`, `#/play/animals/listen`, `#/stickers`, `#/search`,
`#/grownup`, `#/print/all`.

---

## Tips for grown-ups

* **Two minutes a day beats one long sitting.** The star counter and sticker
  book do the persuading.
* **Tamil first** is the default. Switch to *English first* if your child
  already knows the English word and you want to bridge across.
* **Auto-advance** (hands-free) is good for car rides: cards turn themselves
  over every N seconds.
* **Guess, then tap to flip** turns flashcards into a game for a slightly older
  child — picture first, word after a tap.
* Add the words your family actually says — *apa*, *kuzhandai*, the pet's name —
  in *Your own words*. Children light up at those.
* If something is odd on a phone, don't guess: **Grown-up corner → Check on this
  device → 🩺 Run checks**. One line per thing that can go wrong — no Tamil voice,
  recordings not found, browser refusing to save, offline copy missing, tap
  targets too small — each with what to do about it. **📋 Copy report** puts the
  whole thing on the clipboard so you can paste it to someone who can help.

### If the app is silent

Usually one of these, in order of how often it happens:

1. **No Tamil voice installed** — the app still speaks, using the sounding-out
   letters. Either install the voice (check-up tells you where) or use the
   recordings, which sound better anyway.
2. **The phone is waiting for a tap** — browsers will not let any page make sound
   until you touch it once. Tap the 📢 button, or any card.
3. **🔇 got pressed** — the speaker in the top corner mutes everything, sounds and
   speech alike.
4. **The recordings are switched off, or missing** — Grown-up corner → *Speech &
   sound*, and the check-up panel will say which it is.

### The ழ sound

ழ is the Tamil letter with no equivalent in any other language — a sound made by
curling the tongue back, usually written **zh**. An English voice has never seen
those two letters together and produces a squelch, which is what "the app sounds
distorted" usually turns out to be. So when the device has no Tamil voice *and*
the recordings are off, the app stops handing `kazhuthai` to an English voice and
asks for a spelling it can manage — **Grown-up corner → Speech & sound → The
Tamil "zh" sound**:

| choice | the donkey comes out as |
|---|---|
| as "l" *(default)* | ka-**lu**-thai — closest to the real thing on an Indian English voice |
| as "r" | ka-**ru**-thai |
| as "zh" | exactly as written (the old behaviour) |

Choosing one speaks the donkey straight away, so you can hear the difference on
the phone in your hand rather than argue about it. **The letters printed on the
card never change** — `zh` is the spelling schools use and it stays. A Tamil voice,
or a real recording, always wins over all of this: the recordings in the portable
and offline builds pronounce ழ properly, so the fake is never used at all.

The same care covers sentences: with no Tamil voice, a Tamil sentence is not read
as Tamil script by an English voice — that is pure noise — the app says the word
instead.

---

## Making changes safely

**Check before you ship**

```bash
npm run verify             # every script parses · word bank is sane · bundle builds
npm run verify -- --quick  # skip the bundle while you are iterating
npm run release            # verify + portable + offline + stamps sw.js VERSION
npm test                   # 9 Playwright suites (smoke, extra, practice, audio pack,
                           # file://, portable, PWA, infrastructure, layout audit)
```

`npm test` looks for Playwright in `/tmp/pwtest` (override with `TT_TEST_DIR`) and
starts the little servers a suite needs. If Playwright isn't installed the runner
says what to do and exits cleanly — the app itself still has zero dependencies.

**Progress survives your own upgrades.** Saves carry a `version`, and
`js/lib/storage.js` keeps a `MIGRATIONS` table, so a save made months ago is
stepped forward instead of quietly discarded. Add a step there whenever you change
the shape of settings or word records:

```js
var MIGRATIONS = {
  2: function (db) { /* normalise word records */ return db; },
  3: function (db) { /* your next change goes here */ return db; }
};
```

Every load also copies the save to `tamil-tutor.v1.bak`, so a half-written save
(private mode, storage full, phone died mid-write) is repaired from the last good
copy — and 🧩 → *Data* says plainly when the browser refuses to store anything,
instead of losing it silently.

**Installed apps update themselves.** When a new `sw.js` appears the app offers
*🆕 New version ready · Refresh*, and `npm run release` stamps the cache name so a
release is actually picked up. Old caches are deleted on activate.

**Keeping it in git.** Commit the source, the small `dist/tamil-tutor.html` and the
voice pack; keep `dist/portable/`, the zip and `dist/tamil-tutor-offline.html` out of
history (~49 MB of regeneratable output that git would remember forever). The mp3s are
the exception — 15 MB is cheap, they are the app's actual content, `npm run voices`
needs Microsoft's servers so they cannot be re-made offline, and GitHub Pages serves
the site straight out of the repo (see *Hosted*). Attach the zips to a GitHub
**Release** rather than committing them.

## Keeping a copy somewhere safe

Right now the app lives on one disk, and the 1,400-odd recordings can only be
re-made with an internet connection. A private repo fixes the first half in two
commands (create `tamil-tutor` on GitHub first, **without** a README or licence,
since this repo already has both):

```bash
git remote add origin https://github.com/<you>/tamil-tutor.git   # already set for dinesh-rt
git push -u origin master --follow-tags
```

What does and doesn't go up: source, tests-as-documentation, the small shareable
`dist/tamil-tutor.html` and — since GitHub Pages serves the site out of the repo — the
~15 MB `audio/` voice pack are tracked. `dist/portable/`, the zip and the offline file
stay ignored; attach those to a GitHub **Release** instead — the text to paste in is
already written, in `RELEASE-NOTES.md`. Its checksum block refers to the build it was
written
against; anything you rebuild changes them, so re-print the current ones with
`sha256sum dist/*` (or re-run the snippet at the bottom of that file). GitHub Actions
runs `python3 tools/verify.py` on every push: syntax, word bank and a bundle, with
no npm install and no network, and `deploy-pages.yml` publishes the site (see
*Hosted*). The browser suites are not in CI on purpose — run `npm test` on your own
machine.

If you later decide the recordings belong in history, install `git-lfs`,
uncomment the `*.mp3` line in `.gitattributes`, and move them in with
`git lfs migrate`.

## Licence

MIT — do what you like with it. The word list is meant to be extended,
corrected and shared. If you fix a Tamil spelling or add a topic, a pull request
would make a lot of small children happier.
