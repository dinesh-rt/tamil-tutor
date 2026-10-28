#!/usr/bin/env node
/* Asset audit — run with:  node tools/audit-assets.js  (or npm run audit)

   check-data.js asks "is the data well formed". This asks the question right
   behind it: "does the thing the data names actually exist, and does anything
   on disk still believe it is wanted?" Those are different failure modes, and
   the second one is invisible to the first.

   Why it exists. Two things were found by asking, on a repo that had a green
   `npm run verify` the whole time:

     · re-narrating the stories left eighty clips of the previous generation on
       disk and nothing noticed — build-site.py copies whatever a folder holds,
       so a re-record quietly doubles a pack;
     · audio/manifest.json had 702 rows all marked ['ta'] while 702 English
       clips and 30 sentence clips sat on disk unmentioned. The app asks for
       those clips by name; the manifest is the hosted loader's whole idea of
       what exists; so 7.9 MB of audio nobody had to generate was doing nothing,
       and every English tap fell back to the phone's own voice without anyone
       seeing a warning.

   So: two directions, both necessary.
     forward  — the data/manifest names a file; is it there?     (child taps, gets silence)
     reverse  — a file is on disk; does anything name it?        (ships forever, precached)

   Nothing in here fails the build on purpose. A missing clip is a designed
   fallback to the device voice, not a broken app. This is a report about what
   the app will actually do on a phone in a room with no network, which is the
   point of the project.

   Naming, because it bit me first: clips are `audio/<kind>/<cat>__<slug>.mp3`
   — the word id with its slash replaced by a double underscore. audio.js gets
   `/` in ids and the generator flattens it. Anything that guesses `cat/slug`
   reports total failure and total orphans simultaneously, which is how you can
   tell a broken audit from a broken app.
*/
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FILES = [
  'js/lib/util.js', 'js/lib/sprites.js',
  'js/data/core.js', 'js/data/nature.js', 'js/data/food.js', 'js/data/home.js',
  'js/data/people.js', 'js/data/mind.js', 'js/data/play.js',
  'js/data/library.js', 'js/data/stories.js'
];

const sandbox = {
  window: {},
  document: {
    createElement: () => ({ style: {}, classList: { add() {} }, dataset: {}, appendChild() {}, addEventListener() {} }),
    createTextNode: () => ({}), documentElement: { dataset: {} }, addEventListener() {}
  },
  navigator: { vibrate() {}, clipboard: null, serviceWorker: null, userAgent: 'node' },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  console, setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: () => 0, matchMedia: () => ({ matches: false, addEventListener() {} })
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
FILES.forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f }));

const D = sandbox.TT.data;
const B = sandbox.TT.books;
const SPRITES = sandbox.TT.spriteKeys || [];
const words = D.allWords();
const tales = B.shelf().filter((b) => b.story);

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')); } catch (e) { return null; } };
const readText = (p) => { try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch (e) { return ''; } };
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const ls = (dir, re) => { try { return fs.readdirSync(path.join(ROOT, dir)).filter((f) => !re || re.test(f)); } catch (e) { return []; } };
const size = (p) => { try { return fs.statSync(path.join(ROOT, p)).size; } catch (e) { return 0; } };
const mb = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB');
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const flat = (id) => id.replace('/', '__');

const rows = [];
function head(t) { console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(0, 66 - t.length))); }
/** one measured line; `n` is the number that matters, everything after is context */
function line(label, n, note) {
  rows.push(label);
  console.log(`  ${String(n).padStart(5)}  ${label}${note ? '   ' + note : ''}`);
}
function list(items, n) {
  if (items.length) console.log('          ' + items.slice(0, n || 8).join(', ')
    + (items.length > (n || 8) ? ` … +${items.length - (n || 8)} more` : ''));
}
function verdict(ok, good, bad) { console.log(`        ${ok ? '✓ ' + good : '⚠️  ' + bad}`); }

/* ── 1. the word bank ───────────────────────────────────────────────────── */
const withSay = words.filter((w) => w.say);
const withNote = words.filter((w) => w.note);
const svgWords = words.filter((w) => String(w.img).startsWith('svg:'));
const animated = words.filter((w) => w.mo);

head('word bank');
line('words', words.length, `${D.allCategories().length} categories`);
line('with a say-this sentence', withSay.length, `${pct(withSay.length, words.length)}% — each one is a clip of its own`);
line('with a parent note', withNote.length, `${pct(withNote.length, words.length)}%`);
line('drawn as an svg sprite', svgWords.length, 'the rest are emoji, which is a fallback that shipped');
line('animated', animated.length, 'everything else is a still picture on purpose');

/* ── 2. word audio, both directions ─────────────────────────────────────── */
const man = readJson('audio/manifest.json') || { files: {} };
const rows_ = Object.entries(man.files || {});
const KIND_DIR = { ta: 'audio/ta', en: 'audio/en', say: 'audio/ta/say' };

/* forward: every clip the manifest promises must be on disk */
const promised = [];
rows_.forEach(([id, kinds]) => (Array.isArray(kinds) ? kinds : []).forEach((k) => {
  if (KIND_DIR[k]) promised.push(`${KIND_DIR[k]}/${flat(id)}.mp3`);
}));
const promisedMissing = promised.filter((p) => !exists(p));

/* reverse: every clip on disk must be promised by the manifest */
const disk = [];
Object.entries(KIND_DIR).forEach(([k, dir]) => ls(dir, /\.mp3$/).forEach((f) => disk.push(`${dir}/${f}`)));
const promisedSet = new Set(promised);
const orphans = disk.filter((p) => !promisedSet.has(p));

/* the row itself: a word with no row is invisible to the loader even if its
   clip is sitting on disk — which is exactly the shape of the stale-manifest
   bug this file was written to catch */
const wordIds = new Set(words.map((w) => w.id));
const noRow = words.filter((w) => !man.files[w.id]);
const ghostRows = Object.keys(man.files).filter((id) => !wordIds.has(id));
const noTa = words.filter((w) => !(man.files[w.id] || []).includes('ta'));
const noEn = words.filter((w) => !(man.files[w.id] || []).includes('en'));
const sayNoClip = withSay.filter((w) => !(man.files[w.id] || []).includes('say'));

head('word audio — forward and reverse');
line('words', words.length);
line('manifest rows', rows_.length);
line('clips promised', promised.length, mb(promised.reduce((a, p) => a + size(p), 0)));
line('clips on disk', disk.length, mb(disk.reduce((a, p) => a + size(p), 0)));
verdict(promisedMissing.length === 0, 'manifest and disk agree exactly',
  `${promisedMissing.length} promised clip(s) missing: ${promisedMissing.slice(0, 4).join(', ')}`);
verdict(orphans.length === 0, 'nothing on disk is unreferenced',
  `${orphans.length} orphan clip(s) — build-site copies these anyway: ${orphans.slice(0, 3).map((p) => p.split('/').pop()).join(', ')}`);
line('words with NO manifest row', noRow.length, noRow.length ? 'invisible to the hosted loader' : 'every word is describable');
line('manifest rows with no word', ghostRows.length, ghostRows.slice(0, 4).join(', '));
line('words with no tamil clip', noTa.length, noTa.length ? 'falls back to the device voice — silent offline' : '100%');
line('words with no english clip', noEn.length, noEn.length ? 'English taps use the phone voice' : '100%');
line('say-sentences with no clip', sayNoClip.length, sayNoClip.map((w) => w.id).slice(0, 6));

const tiny = disk.filter((p) => size(p) < 1024);
verdict(tiny.length === 0, 'no clip is empty or truncated',
  `${tiny.length} clip(s) under 1 KB — a failed take: ${tiny.slice(0, 4).map((p) => p.split('/').pop()).join(', ')}`);

/* ── 3. story audio ─────────────────────────────────────────────────────── */
const bman = readJson('audio/books/manifest.json') || { books: {} };
const bpromised = [], bdisk = [];
Object.entries(bman.books || {}).forEach(([id, rec]) => (rec.pages || []).forEach((r) => bpromised.push(`audio/books/${id}/${r.file}`)));
ls('audio/books').forEach((bid) => ls(`audio/books/${bid}`, /\.mp3$/).forEach((f) => bdisk.push(`audio/books/${bid}/${f}`)));
const bOrphans = bdisk.filter((p) => !new Set(bpromised).has(p));
const bMissing = bpromised.filter((p) => !exists(p));
const incomplete = Object.entries(bman.books || {}).filter(([, r]) => !r.complete).map(([id]) => id);

head('story audio');
line('page clips promised', bpromised.length);
line('page clips on disk', bdisk.length, mb(bdisk.reduce((a, p) => a + size(p), 0)));
verdict(bMissing.length === 0, 'every narrated page is present', `${bMissing.length} missing: ${bMissing.slice(0, 3).join(', ')}`);
verdict(bOrphans.length === 0, 'every clip is the current reading',
  `${bOrphans.length} orphan(s) — an old generation after a re-narration: run make-story-pack.py --prune`);
line('books not fully narrated', incomplete.length, incomplete.join(', '));

/* ── 4. pictures ────────────────────────────────────────────────────────── */
const usedSprites = new Set(svgWords.map((w) => String(w.img).slice(4)));
const unusedSprites = SPRITES.filter((s) => !usedSprites.has(s));
const artWant = tales.flatMap((b) => [b.art].concat(b.pages.map((p) => p.art))).filter(Boolean);
const artDisk = ls('images/books', /\.webp$/);
const artMissing = artWant.filter((a) => !exists(a));
const artOrphans = artDisk.filter((f) => !new Set(artWant.map((a) => a.split('/').pop())).has(f));
const rawLeft = ls('images/books', /\.(png|jpg|jpeg)$/);

head('pictures');
line('sprites defined', SPRITES.length);
line('sprites used by a word', usedSprites.size);
line('sprites nobody uses', unusedSprites.length, unusedSprites.join(', '));
line('art named by the data', artWant.length);
line('art on disk', artDisk.length);
verdict(artMissing.length === 0, 'every named picture exists', `${artMissing.length} named but absent (page art degrades to text)`);
verdict(artOrphans.length === 0, 'no stray webp in images/books', `${artOrphans.length} stray: ${artOrphans.slice(0, 5).join(', ')}`);
if (rawLeft.length) console.log(`         ${rawLeft.length} raw png/jpg kept for re-promotion (${mb(rawLeft.reduce((a, f) => a + size('images/books/' + f), 0))}), gitignored and not copied`);

/* ── 5. the generated indices the loader reads ──────────────────────────── */
head('generated indices');
[
  ['audio/manifest.json', /"files"\s*:\s*{/, 'what the hosted loader believes exists'],
  ['audio/books/manifest.json', /"books"\s*:\s*{/, 'what gates a story onto the shelf'],
  ['audio/pack-index.js', /TT_AUDIO_PACK/, 'the file:// fallback for word clips'],
  ['audio/books/pack-index.js', /TT_STORY_PACK/, 'the file:// fallback for story clips']
].forEach(([f, re, why]) => {
  const raw = readText(f);
  console.log(`  ${raw ? String(mb(raw.length)).padStart(8) : '  MISSING'}  ${f.padEnd(30)} ${re.test(raw) ? '' : '⚠️  unexpected shape  '}${raw ? '' : '(nothing)'} — ${why}`);
});

/* ── 6. is the deployable folder current? ─────────────────────────────────
   mtime proves nothing here: build-site copies with copy2, so every copied
   file carries its source's timestamp and a months-old build looks brand new.
   Compare presence and size against the manifest instead — that is what the
   loader will actually request. */
head('site/ vs what the loader will ask for');
if (!exists('site/index.html')) {
  console.log('  ⚠️  no site/index.html — nothing has been built');
} else {
  const siteAudio = promised.filter((p) => !exists('site/' + p));
  const siteSay = promised.filter((p) => p.includes('/say/'));
  const siteBooks = bpromised.filter((p) => !exists('site/' + p));
  line('promised clips', promised.length + bpromised.length);
  line('missing from site/', siteAudio.length + siteBooks.length,
    (siteAudio.length + siteBooks.length) ? 'run npm run site' : 'complete');
  if (siteSay.length && siteAudio.length) console.log(`          (${siteSay.length} of them are the say/ clips)`);
  const srcJs = ls('js', /\.js$/).length;
  console.log(`        ${exists('site/sw.js') ? '✓' : '⚠️ '}  sw.js ${exists('site/sw.js') ? 'present' : 'MISSING'} — without it the app is not offline at all`);
}

/* ── 7. things only visible across two files ────────────────────────────── */
head('cross-data');
const byTa = new Map();
words.forEach((w) => { const k = w.ta.trim(); if (!byTa.has(k)) byTa.set(k, []); byTa.get(k).push(w); });
const dupTa = [...byTa.entries()].filter(([, v]) => v.length > 1);
line('same Tamil spelling, >1 entry', dupTa.length,
  dupTa.length ? 'usually a real homograph (ஆறு river/six) — read them, do not delete them' : 'none');
/* The one worth a human look: same spelling AND the same English gloss, twice.
   Deliberate topical repeats look exactly like accidents — ஆரஞ்சு as the fruit
   and as the colour, பொங்கல் as the dish and as the festival, both defensible,
   both worth a second entry. So this is a nudge to decide on purpose, not a
   warning: a word bank where nobody ever looked at the overlaps is one where
   the overlaps arrived by accident either way. */
const sameBoth = dupTa.filter(([, v]) => new Set(v.map((w) => w.en.toLowerCase())).size === 1);
line('…of which same word AND same English', sameBoth.length,
  sameBoth.map(([k, v]) => `${k} [${v.map((w) => w.cat).join('/')}]`).join(', '));
if (sameBoth.length) {
  console.log('        • decide these on purpose: ஆரஞ்சு as fruit and as colour is a good'
    + '\n          second entry; the same word twice in neighbouring topics with one\n'
    + '          meaning is just two clips and two stars for one thing');
}

const dupRo = [...words.reduce((m, w) => {
  const k = w.ro.trim().toLowerCase(); if (!m.has(k)) m.set(k, []); m.get(k).push(w); return m;
}, new Map()).entries()].filter(([, v]) => v.length > 1 && new Set(v.map((w) => w.ta)).size > 1);
line('same romanisation, different Tamil', dupRo.length, dupRo.length ? 'plain-ascii ro cannot tell them apart — a note disambiguates' : 'none');
list(dupRo.map(([k, v]) => `${k}: ${v.map((w) => w.ta + '=' + w.en).join(' | ')}`), 6);

const bookIds = B.shelf().map((b) => b.id);
line('books on the shelf', bookIds.length, `ids ${new Set(bookIds).size === bookIds.length ? 'unique' : 'DUPLICATED'}`);
const pagesTotal = tales.reduce((a, b) => a + b.pages.length, 0);
line('story pages', pagesTotal, tales.length + ' stories');
verdict(tales.every((b) => b.source), 'every story declares where it came from',
  `${tales.filter((b) => !b.source).length} story book(s) with no source field`);

console.log('\n(what each line means is in the header of this file. nothing here fails the build on\n'
  + ' purpose — a missing clip is a designed fallback, an orphan is build weight, a duplicate is\n'
  + ' a decision somebody should make on purpose rather than by accident)');
