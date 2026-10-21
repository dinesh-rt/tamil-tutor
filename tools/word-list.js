#!/usr/bin/env node
/* Print the whole word bank as JSON so Python tools can use it.
   node tools/word-list.js            → [{id,en,ta,ro,cat,say}, …] on stdout
   node tools/word-list.js --stats    → a one-line summary           */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['js/lib/util.js', 'js/lib/sprites.js', 'js/data/core.js', 'js/data/nature.js', 'js/data/food.js',
  'js/data/home.js', 'js/data/people.js', 'js/data/mind.js', 'js/data/play.js'];

const sandbox = {
  window: {}, console, setTimeout, clearTimeout, setInterval, clearInterval,
  document: { createElement: () => ({ style: {}, classList: { add() {} }, dataset: {}, appendChild() {}, addEventListener() {} }), createTextNode: () => ({}), documentElement: { dataset: {} }, addEventListener() {} },
  navigator: { vibrate() {}, userAgent: 'node' },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  requestAnimationFrame: () => 0, matchMedia: () => ({ matches: false, addEventListener() {} })
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
FILES.forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f }));

/* include the words the family added in the grown-up corner too */
function customWords() {
  try {
    const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'custom-words.json'), 'utf8'));
    return (db.custom || []).map((c) => Object.assign({ cat: 'custom' }, c));
  } catch (e) { return []; }
}

const words = sandbox.TT.data.allWords().map((w) => ({
  id: w.id, en: w.en, ta: w.ta, ro: w.ro || '', cat: w.cat, say: w.say || ''
})).concat(customWords());

if (process.argv.indexOf('--stats') >= 0) {
  console.log(JSON.stringify({ words: words.length, withSay: words.filter((w) => w.say).length }));
} else {
  process.stdout.write(JSON.stringify(words));
}
