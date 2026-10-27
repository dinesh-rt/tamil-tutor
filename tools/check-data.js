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
  'js/data/play.js'
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
const LATIN_ONLY_SOUND = /^[a-z0-9 .'\-()]+$/;

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
