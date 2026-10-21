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
| `img` | Any emoji, or `svg:name` for the hand-drawn sprites (`papaya`, `pomegranate`, `guava`, `jackfruit`, `idli`, `laddu`, `murukku`, `kuzhal`, `kolam`, `head`, `belly`, `star`) |
| `mo` | Animation name — see *Motion* below |
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

Each word carries a `mo` name (`bounce`, `sway`, `flutter`, `drive`, `steam`,
`stomp`, `sing`, `waddle`, `blink` … — ~140 of them) and `css/animations.css`
maps those names onto ~80 keyframes, so the picture keeps doing something while
the child listens.

Pick a sensible one: an animal bounces, a bird flaps, a car drives, tea steams,
a fan spins, a heart beats. Unknown names simply render still.

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

**Keeping it in git.** Commit the source plus the small `dist/tamil-tutor.html`;
keep `dist/portable/`, the zip and `dist/tamil-tutor-offline.html` out of history
(~49 MB of regeneratable output that git would remember forever). Tag a release and
attach the zip to it — or keep the 14 MB of mp3s in Git LFS / release assets, since
`npm run voices` needs Microsoft's servers and cannot be replayed offline.

## Licence

MIT — do what you like with it. The word list is meant to be extended,
corrected and shared. If you fix a Tamil spelling or add a topic, a pull request
would make a lot of small children happier.
