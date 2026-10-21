# Tamil Tutor v1.0.0

The whole thing in files you can keep on a pen drive: **702 words in 29 topics**, each
with a picture, the Tamil word, the English word and a recording of a person saying
it — plus four games, a sticker book, and a grown-up corner. No account, no ads, no
tracking, and no internet needed after the download. Nothing the child does ever
leaves the device.

## Which file do I want?

| file | size | for |
|---|---|---|
| **`tamil-tutor-portable.zip`** | 14 MB | **start here.** Unzip it, keep the folder, double-click `index.html`. Tamil + English voices inside, works with the Wi-Fi off. |
| `tamil-tutor-offline.html` | 20 MB | genuinely one file, recordings baked in — mail it to yourself, open it from a pen drive |
| `tamil-tutor.html` | 290 KB | small enough to message; uses the phone/laptop's own voices, so Tamil depends on what is installed |

All three are the same app. Only where the voices come from changes.

### On a phone — the way that actually works
On a laptop, in the project folder:

```bash
npm run share          # or: python3 tools/serve.py 8090 dist/portable
```

Open the printed `http://192.168.x.x:8090` on the phone (same Wi-Fi), then the
browser menu → **Add to Home screen**. It becomes a full-screen app that keeps
working with the Wi-Fi off — that's the version a toddler actually uses.

Double-clicking a local `.html` works fine on a **laptop**. On phones: Chrome on
Android offers to *download* local HTML instead of opening it (Firefox and Samsung
Internet open it happily), and iOS Safari needs a local-server app such as Koder.
Use the install route above instead of fighting either.

## What's inside

* **29 topics, 702 words** — animals, food, body, family, feelings, colours,
  numbers, vehicles, festivals, temple, market, beach, farm, insects, tools and more.
* **1,434 recordings** — the Tamil word, the English word and, for some words, a
  whole sentence. Every word also speaks with the browser's own voice if you switch
  the recordings off.
* **Flashcards** with Tamil, English and sounding-out letters; tap to flip, tap the
  speaker to hear it again, auto-advance for car rides.
* **Four games** — Listen & pick, Peek-a-boo, Find them all, and *Say it in English*
  (grown-up reads the word, child answers in English).
* **Today's review** — words you got wrong come back today; ones you know come back
  in 1, 3, 7 then 21 days. Home says *n words waiting*, one button plays the round.
* **Sticker book and stars** — the persuasion system.
* **Grown-up corner** (multiplication gate) — speech, voices, speeds, flashcard
  modes, your own family words, backup/export, print sheet, and
  **🩺 Check on this device** for when the phone goes quiet.
* **Accessibility** — reduced motion, mute-everything, high-contrast themes, big
  targets, no timed pressure anywhere.

## First run, two things

1. **Tap once anywhere.** Browsers will not let any page make sound until you touch
   it. This is a browser rule, not a bug.
2. **If Tamil sounds English-y**, either install a Tamil voice on the device or just
   use the recordings that came in the zip. 🧩 → *Check on this device* will tell you
   which one you are missing, in words rather than codes.

## Private by construction

Progress lives in your browser's own storage. No servers, no analytics, no accounts,
no ads, nothing uploaded. The only network use anywhere is opt-in and only on a
laptop: regenerating the recordings (`npm run voices`) and the update check an
installed app makes when a new version exists.

## Honest limits of this version

* Sentences exist for 30 of 702 words — the rest say the word alone.
* The review queue needs a few days of use before the boxes get interesting.
* Real-device checks (Android Chrome with a Tamil voice, iOS Safari gesture unlock)
  are still being done by hand; 🩺 exists precisely because nobody could test every
  phone on earth from a laptop.
* Add-to-Home-Screen needs HTTP(S) — opening a file directly can't install, though
  it runs fine as a page.

## For the curious

Plain HTML, CSS and JavaScript, no framework, no build step, no dependencies.

```bash
npm run share      # serve for a phone
npm run voices     # regenerate recordings (needs internet)
npm run release    # verify + build all three files + stamp the offline copy
npm test           # 11 browser suites
```

Source layout, how the recordings are found, storage migrations, and how to change
things safely: see `README.md`.

### Checksums for the files attached to this release

```
034bdc38ed38bbaf6c1d9f41f8cd781eb1e3b9b858b58cb850eedc60a4b93e0c  tamil-tutor-portable.zip  (14.2 MB)
b5609390acb2b4132896f7a705ca6f4f92c685aaed0b4a23c039f04a9308cdcb  tamil-tutor-offline.html  (20.0 MB)
0b1fa3425541b97a584eb376d3e8b84ef1c3e1c9a8100b3c32d68e334afe6f7e  tamil-tutor.html  (0.3 MB)
```
