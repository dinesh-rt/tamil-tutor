#!/usr/bin/env node
/* Data sanity check — run with:  node tools/check-data.js  (or npm run check)
   Loads the whole word bank in Node and complains about anything a toddler
   would notice: missing fields, duplicate ids, Tamil fields that are not in
   Tamil script, emoji fields that are not emoji, unknown sprites, bad motion. */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FILES = [
  'js/lib/util.js',
  'js/lib/sprites.js',
  'js/data/core.js',
  'js/data/nature.js',
  'js/data/food.js',
  'js/data/home.js',
  'js/data/people.js',
  'js/data/mind.js',
  'js/data/play.js',
  'js/data/library.js',
  'js/data/stories.js'
];

/* minimal browser shims so the data files can run outside a page */
const sandbox = {
  window: {},
  document: {
    createElement: () => ({ style: {}, classList: { add() {} }, dataset: {}, appendChild() {}, addEventListener() {} }),
    createTextNode: () => ({}),
    documentElement: { dataset: {} },
    addEventListener() {}
  },
  navigator: { vibrate() {}, clipboard: null, serviceWorker: null, userAgent: 'node' },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: () => 0,
  matchMedia: () => ({ matches: false, addEventListener() {} })
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

FILES.forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f }));

const D = sandbox.TT.data;
const SPRITES = sandbox.TT.spriteKeys || [];

const TAMIL = /[\u0B80-\u0BFF]/;
const EMOJI = /^[\u{1F000}-\u{1FAFF}\u{2300}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}0-9#*]+$/u;
/* "plain ascii" means no diacritics and no Tamil script — that is the whole
   point, because a word bank where half the entries are scholarly-romanised
   and half phonetic is a word bank nobody can read aloud. Sentence punctuation
   is allowed because story pages are whole spoken lines with a ! and a ? in
   them, which single-word entries never had. */
const LATIN_ONLY_SOUND = /^[a-z0-9 .'"\-()!?;:,]+$/;

/* `mo` is now opt-in: a word without one is a still picture. Anything that
   does ask for movement must name a class that actually exists. */
const MOTION_CSS = fs.readFileSync(path.join(ROOT, 'css/animations.css'), 'utf8');
const MOTION = new Set(Array.from(MOTION_CSS.matchAll(/\.mo-([a-z0-9-]+)/g), (m) => m[1]));

const problems = [];
const warn = (word, msg) => problems.push(`[${word ? word.cat : '?'}] ${word ? word.en + ': ' : ''}${msg}`);

const cats = D.allCategories();
const words = D.allWords();
const seenIds = new Map();
const byCat = new Map();

cats.forEach((c) => {
  if (!c.key) warn(null, 'category without a key');
  if (!c.ta || !TAMIL.test(c.ta)) warn(null, `category ${c.key} has no Tamil name`);
  if (!c.en) warn(null, `category ${c.key} has no English name`);
  if (!c.icon) warn(null, `category ${c.key} has no icon`);
  if (!/^#[0-9a-f]{6}$/i.test(c.color || '')) warn(null, `category ${c.key} colour should be #rrggbb`);
  if (!c.words.length) warn(null, `category ${c.key} is empty`);
  byCat.set(c.key, c.words.length);
});

words.forEach((w) => {
  if (!w.en) warn(w, 'missing English word');
  if (!w.ta) warn(w, 'missing Tamil word');
  else if (!TAMIL.test(w.ta)) warn(w, `Tamil field has no Tamil letters (${w.ta})`);
  if (!w.ro) warn(w, 'missing romanisation');
  else if (!LATIN_ONLY_SOUND.test(w.ro.toLowerCase())) warn(w, `romanisation should be plain ascii (${w.ro})`);
  if (w.ta && w.ro && TAMIL.test(w.ro)) warn(w, 'romanisation contains Tamil letters');
  if (!w.img) warn(w, 'missing picture');
  else if (String(w.img).indexOf('svg:') === 0) {
    const name = String(w.img).slice(4);
    if (SPRITES.indexOf(name) < 0) warn(w, `svg:${name} is not a known sprite`);
  } else if (!EMOJI.test(String(w.img))) warn(w, `picture is not an emoji (${w.img})`);
  if (w.q != null && (!Number.isInteger(w.q) || w.q < 1 || w.q > 10)) warn(w, `q must be 1..10 (${w.q})`);
  if (seenIds.has(w.id)) warn(w, `duplicate id ${w.id} (also ${seenIds.get(w.id)})`);
  else seenIds.set(w.id, w.id);
  if (w.mo && !MOTION.has(w.mo)) warn(w, `animation '${w.mo}' has no .mo-${w.mo} class in css/animations.css`);
});

/* duplicates within a category are the most common copy-paste accident */
byCat.forEach((n, key) => {
  const list = D.catWords(key);
  const seen = new Map();
  list.forEach((w) => {
    const k = w.en.toLowerCase();
    if (seen.has(k)) warn(w, `duplicate English word in ${key}`);
    seen.set(k, 1);
  });
});

const counts = words.length;
const still = words.filter((w) => !w.mo).length;
const longest = words.reduce((a, w) => (w.ta || '').length > (a.ta || '').length ? w : a, words[0]);
const noSentence = words.filter((w) => !w.say).length;

console.log(`categories : ${cats.length}`);
console.log(`words      : ${counts}`);
console.log(`pictures   : ${still} still, ${counts - still} animated (verbs and things that move)`);
console.log(`with a "say this" sentence: ${counts - noSentence} (${Math.round(((counts - noSentence) / counts) * 100)}%)`);
console.log(`longest Tamil word: ${longest.ta} (${longest.en})`);
console.log(`sprites    : ${SPRITES.length}`);

/* ── story page art ─────────────────────────────────────────────────────────
   A page's picture is named from its number (images/books/p-<id>-<nn>.webp)
   and is never listed in the data, which is what keeps 83 pages out of
   stories.js — and what makes a mistyped book id cost a whole book its
   pictures without anything failing. So: ask for the name the app will ask
   for, and count what is actually on disk. Missing art is a nudge, not a
   failure — the Tamil line is the page and a page reads without a picture. */
const B = sandbox.TT.books;
const tales = B ? B.shelf().filter((b) => b.story) : [];
if (!tales.length) {
  console.log('page art   : no stories loaded — library.js or stories.js did not run in the sandbox');
} else {
  let artWant = 0, artHave = 0;
  const artMissing = [];
  tales.forEach((b) => {
    b.pages.forEach((p, i) => {
      if (!p.art) { warn(null, `${b.en}: page ${i + 1} has no art path`); return; }
      artWant++;
      if (fs.existsSync(path.join(ROOT, p.art))) artHave++;
      else artMissing.push(`${b.id}/${p.art.split('/').pop()}`);
    });
  });
  const coverMissing = tales.filter((b) => !fs.existsSync(path.join(ROOT, b.art)));
  console.log(`books      : ${tales.length} stories, ${artWant} pages`
    + `, ${artHave} illustrated (${artWant ? Math.round((artHave / artWant) * 100) : 0}%)`
    + `, ${tales.length - coverMissing.length}/${tales.length} covers`);
  if (artMissing.length) {
    console.log(`  no picture yet: ${artMissing.slice(0, 8).join(', ')}`
      + (artMissing.length > 8 ? ` … and ${artMissing.length - 8} more` : ''));
    console.log('  draw them: python3 tools/make-story-art.py --pages --only <id> --promote-pages <id>');
  }
  coverMissing.forEach((b) => warn(null, `${b.en}: cover ${b.art} is missing`));
}

/* ── story register and provenance ──────────────────────────────────────────
   The word bank went spoken Tamil in one long pass and this file stayed in
   written Tamil for months right next to it, because nothing ever looked.
   A reader could see both halves on the same shelf and one of them was still
   saying அதின் and நில். These are the shapes the written register leaves
   behind — a story page that grows one is a regression, not a house style.
   The list is deliberately small and specific: it names the spoken form to use
   so the message is fixable in place, and it stays narrow enough that a writer
   can hold it in their head. `tools/fetch-story-sources.py` pulls the archived
   parent texts, which are book Tamil on purpose — the plot comes from there,
   the register never does. */
const WRITTEN_FORMS = [
  [/அதின்/, 'written genitive அதின் → spoken அதன் / இத'],
  [/(?:கிறேன்|கிறோம்|கிறான்|கிறாள்|கிறோம்|கிறீர்கள்|கிறார்கள்|கிறது)/, 'written present -கிற → spoken -க்குது / -கிட்டு'],
  [/\bநில்\b/, 'written imperative நில் → spoken நில்லு'],
  [/வேண்டும்/, 'written வேண்டும் → spoken வேணும்'],
  [/மிகவும்/, 'written மிகவும் → spoken ரொம்ப / ஒண்ணே'],
  [/\bசிறு\b/, 'written சிறு → spoken சின்ன'],
  [/உட்கார்ந்த/, 'written உட்கார்ந்தது → spoken உக்காந்துச்சு'],
  [/\bஎன்று\b/, 'written என்று → spoken னு'],
  [/அருகே/, 'written அருகே → spoken அருகில'],
  [/(?:விட்டது|விட்டேன்|விட்டான்|விட்டாள்)/, 'written -விட்டது → spoken -டுச்சு / -ப் போச்சு'],
  [/[a-zA-Z]/, 'English letters inside a Tamil line — nobody speaks that'],
];

if (tales.length) {
  let spoken = 0;
  tales.forEach((b) => {
    /* provenance is a promise the data has to keep: a tale with no `source`
       is indistinguishable from one a model invented, which is exactly the
       state this file used to be in */
    if (!b.source) warn(null, `${b.en}: no \`source\` — say where this tale comes from, or that it does not come from anywhere`);
    b.pages.forEach((p, i) => {
      const at = `${b.id} p${i + 1}`;
      if (!p.ta) warn(null, `${at}: empty line`);
      else if (!TAMIL.test(p.ta)) warn(null, `${at}: no Tamil in a Tamil line`);
      if (!p.ro) warn(null, `${at}: missing romanisation`);
      else if (!LATIN_ONLY_SOUND.test(p.ro.toLowerCase())) warn(null, `${at}: romanisation should be plain ascii (${p.ro})`);
      if (!p.en) warn(null, `${at}: missing English gloss`);
      WRITTEN_FORMS.forEach(([re, why]) => {
        if (p.ta && re.test(p.ta)) warn(null, `${at}: ${why} — (${p.ta})`);
      });
    });
    spoken++;
  });
  const sourced = tales.filter((b) => /ta\.wikisource|வாயடக்கம்|Pancha|Aesop/.test(b.source || '')).length;
  const archived = tales.filter((b) => /ta\.wikisource/.test(b.source || '')).length;
  console.log(`stories    : ${spoken} books, ${sourced} with a stated source, ${archived} with an archived Tamil parent`);
  console.log('           : register lint on ' + WRITTEN_FORMS.length + ' written forms (tools/check-data.js)');
}
console.log('\nsample of every category:');
cats.forEach((c) => {
  const s = c.words.slice(0, 3).map((w) => `${w.en}=${w.ta}`).join(', ');
  console.log(`  ${c.icon} ${c.key.padEnd(12)} ${String(c.words.length).padStart(3)}  ${s}`);
});

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  problems.slice(0, 60).forEach((p) => console.log('  ✗ ' + p));
  if (problems.length > 60) console.log(`  … and ${problems.length - 60} more`);
  process.exit(1);
}
console.log('\n✓ word bank looks healthy');
