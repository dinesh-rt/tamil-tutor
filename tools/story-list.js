#!/usr/bin/env node
/* Print the ten story-books as JSON so Python tools can narrate them.

     node tools/story-list.js            → [{id,ta,en,icon,pages:[{k,ta,ro,en,clip,dur}]}]
     node tools/story-list.js --stats    → {"stories":10,"lines":83,"chars":4213}

   Same sandbox trick as word-list.js: run the browser modules in a VM with just
   enough DOM for them to register their data, then read it out. No fetch in the
   sandbox on purpose — library.js probes for the story audio pack and must stay
   quiet here, not try to reach a server that isn't there.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['js/data/core.js', 'js/data/library.js', 'js/data/stories.js'];

const sandbox = {
  window: {}, console, setTimeout, clearTimeout, setInterval, clearInterval,
  document: { createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, dataset: {}, appendChild() {}, addEventListener() {} }), createTextNode: () => ({}), documentElement: { dataset: {} }, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] },
  navigator: { vibrate() {}, userAgent: 'node' },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  requestAnimationFrame: () => 0, matchMedia: () => ({ matches: false, addEventListener() {} })
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
FILES.forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f }));

const B = sandbox.TT.books;
const books = B.shelf().filter((b) => b.story).map((b) => ({
  id: b.id, ta: b.ta, en: b.en, icon: b.icon, color: b.color, ages: b.ages,
  pages: b.pages.map((p) => ({ k: p.k, ta: p.ta, ro: p.ro || '', en: p.en || '', clip: p.clip, dur: p.dur || 0 }))
}));

if (process.argv.indexOf('--stats') >= 0) {
  const lines = books.reduce((n, b) => n + b.pages.length, 0);
  const chars = books.reduce((n, b) => n + b.pages.reduce((s, p) => s + (p.ta || '').length, 0), 0);
  console.log(JSON.stringify({ stories: books.length, lines, chars }));
} else {
  process.stdout.write(JSON.stringify(books));
}
