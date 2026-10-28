#!/usr/bin/env node
/* Smoke: does the built app actually work in a browser.

   The first of the fourteen suites this repo's runner has advertised since it
   was written and never had. It is deliberately narrow — the things that break
   when somebody edits data, audio or art, which is most of what happens here:

     the app boots with no console errors, the word bank arrives intact,
     the shelf shows every book, a story opens with its page pictures loaded,
     and the clips the manifest promises are really served as audio.

   Each of those has already been broken at least once in this project's
   history in a way the static checks could not see: an audio manifest that
   described a third of the pack, a page whose Tamil contained the English word
   "even", a re-narration that left the previous generation of clips on disk.
   verify.py checks files; this checks behaviour.

   Output contract with tools/run-tests.js: print `✓ name` per pass and
   `✗ name — reason` per failure, exit non-zero on any failure.
*/
'use strict';

const path = require('path');

const TEST_DIR = process.env.TT_TEST_DIR || '/tmp/pwtest';
const BASE = process.env.TT_BASE || 'http://127.0.0.1:8090/';
let chromium;
try {
  ({ chromium } = require(path.join(TEST_DIR, 'node_modules', 'playwright-core')));
} catch (e) {
  console.log('✗ playwright-core — not installed in ' + TEST_DIR);
  process.exit(1);
}

let pass = 0; const fails = []; const warns = [];
function ok(name) { pass++; console.log('  ✓ ' + name); }
function bad(name, why) { fails.push(name + ' — ' + why); console.log('  ✗ ' + name + ' — ' + why); }
async function check(name, fn, warnOnly) {
  const fail = (why) => warnOnly ? (warns.push(name + ' — ' + why), console.log('  ! ' + name + ' — ' + why)) : bad(name, why);
  try { const r = await fn(); if (r === true || r === undefined) return ok(name); fail(String(r)); }
  catch (e) { fail(e.message); }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.TT_CHROMIUM || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  const errors = [];
  /* a bare "Failed to load resource" is useless to whoever reads this next;
     record the URL that 404'd so the failure names the thing that is missing */
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url().replace(BASE, '/')}`);
  });
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource/.test(t)) return;   // already captured above, with its URL
    errors.push(t);
  });
  page.on('pageerror', (e) => errors.push(String(e)));

  console.log('\nsmoke — ' + BASE + '\n');

  await check('page loads', async () => {
    const r = await page.goto(BASE, { waitUntil: 'load' });
    return r && r.ok() ? true : 'HTTP ' + (r && r.status());
  });

  /* Open finding, deliberately a warning rather than a failure: <html lang="en">
     on an app whose entire content is Tamil. Screen readers choose their Tamil
     voice from this attribute, so the one product where pronunciation is the
     whole point is currently asking for an English one. It is a decision, not a
     patch — the document really is bilingual (Tamil content, English glosses for
     the parent), so the honest fix is lang="ta" on the root plus lang="en" on
     the gloss elements, which is a pass through the views rather than one line
     in index.html. */
  await check('html lang declares the content language [open finding]', async () => {
    const l = await page.getAttribute('html', 'lang');
    return l === 'ta' ? true : 'lang=' + l;
  }, true);

  await check('app boots', () => page.waitForFunction(
    () => !!(window.TT && window.TT.data && window.TT.books), null, { timeout: 15000 }).then(() => true));

  await check('word bank intact', async () => {
    const n = await page.evaluate(() => window.TT.data.allWords().length);
    const c = await page.evaluate(() => window.TT.data.allCategories().length);
    return (n === 702 && c === 29) ? true : `${n} words / ${c} categories, expected 702 / 29`;
  });

  await check('every category renders a tile', async () => {
    const n = await page.evaluate(() => document.querySelectorAll('.tile-bar-fill').length);
    return n === 29 ? true : n + ' category tiles, expected 29';
  });

  await check('shelf shows all 20 books', async () => {
    await page.goto(BASE + '#/library', { waitUntil: 'load' });
    await page.waitForFunction('window.TT && window.TT.books', null, { timeout: 12000 });
    await page.waitForTimeout(600);
    const n = await page.evaluate(() => document.querySelectorAll('button.book-tile').length);
    return n >= 20 ? true : 'only ' + n + ' book tiles on the shelf';
  });

  /* The reader opens on a cover, so this taps it the way a child would before
     judging the pages. Page art is named by page number rather than listed
     anywhere, so a mistyped book id costs a whole book its pictures and nothing
     in a static check would notice — this does. */
  await check('a story opens and its pages have art', async () => {
    await page.goto(BASE + '#/book/aamai-annangal', { waitUntil: 'load' });
    await page.waitForFunction('document.querySelector(".book-stage")', null, { timeout: 12000 });
    /* click, not tap: tap needs a touch-enabled context and the failure is
       silent, which reads as "the reader is broken" when it is only the test */
    try { await page.click('.book-stage', { timeout: 5000 }); }
    catch (e) { return 'could not tap the cover to open the reader: ' + e.message.split('\n')[0]; }
    await page.waitForFunction('document.querySelectorAll(".book-line").length > 0', null, { timeout: 12000 });
    const r = await page.evaluate(() => {
      const img = document.querySelector('.book-line img.line-art');
      return { lines: document.querySelectorAll('.book-line').length,
        art: !!img, decoded: img ? img.naturalWidth : 0, src: img ? img.src.split('/').pop() : '' };
    });
    if (!r.lines) return 'story opened with no pages';
    if (!r.art) return 'pages opened with no <img> — page art naming is broken';
    if (!r.decoded) return r.src + ' named but never decoded (404 or corrupt webp)';
    return r.src.indexOf('p-aamai-annangal-01') === 0 ? true : 'unexpected page art file ' + r.src;
  });

  /* the manifest is the hosted loader's whole idea of what audio exists, so a
     stale one is invisible until a child taps a word and hears nothing */
  await check('a word clip is served as audio', async () => {
    const r = await page.evaluate(async () => {
      const m = await (await fetch('audio/manifest.json')).json();
      const id = Object.keys(m.files)[0];
      const url = 'audio/ta/' + id.replace('/', '__') + '.mp3';
      const res = await fetch(url);
      return { id, status: res.status, type: res.headers.get('content-type'), len: +(res.headers.get('content-length') || 0) };
    });
    if (r.status !== 200) return `${r.id}: ${url} → HTTP ${r.status}`;
    if (!/audio|mpeg/.test(r.type || '')) return r.id + ': content-type ' + r.type;
    return r.len > 1024 ? true : r.id + ': only ' + r.len + ' bytes — a failed take';
  });

  await check('a story page clip is served as audio', async () => {
    const r = await page.evaluate(async () => {
      const m = await (await fetch('audio/books/manifest.json')).json();
      const id = Object.keys(m.books)[0];
      const rec = m.books[id].pages[0];
      const res = await fetch('audio/books/' + id + '/' + rec.file);
      return { id, file: rec.file, status: res.status, len: +(res.headers.get('content-length') || 0) };
    });
    if (r.status !== 200) return `${r.id}/${r.file} → HTTP ${r.status}`;
    return r.len > 1024 ? true : `${r.id}/${r.file}: only ${r.len} bytes`;
  });

  await check('service worker registers', async () => {
    await page.waitForFunction(
      "navigator.serviceWorker && navigator.serviceWorker.controller", null, { timeout: 15000 })
      .catch(() => {});
    const n = await page.evaluate(() => navigator.serviceWorker.getRegistrations()
      .then((r) => r.length).catch(() => -1));
    return n >= 1 ? true : n === -1 ? 'serviceWorker unavailable' : 'no registration — the app is not offline at all';
  });

  await check('no console errors during the run', () =>
    errors.length === 0 ? true : errors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(`\nsmoke: ${pass} passed, ${fails.length} failed` + (warns.length ? `, ${warns.length} open finding(s)` : ''));
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log('  ✗ suite crashed — ' + e.message); process.exit(1); });
