#!/usr/bin/env node
/* Browser smoke tests for Tamil Tutor — one command instead of six.

     npm test                run every Playwright suite
     npm test -- smoke       just the named suite(s)
     TT_TEST_DIR=/path npm test

The suites live in the repo — tools/tests/ — next to the app they test, so
they can be committed, reviewed and diffed. Only Playwright itself stays
outside the app, default /tmp/pwtest: a dev-only browser install is not
something the product should carry.

This runner used to exit 0 in three situations where nothing was tested: no
Playwright, no suites, and a port it did not own. All three now say so loudly
and come back non-zero. See the note above the verdict at the bottom.
*/
'use strict';

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
/* Suites live in the repo, next to the app they test. They used to be looked
   for in TEST_DIR (/tmp/pwtest) — a folder that is wiped on reboot and holds
   nothing but node_modules — so a suite could never be committed, reviewed or
   diffed, and in practice fourteen of them were never written. TEST_DIR stays
   as the location of the dev-only playwright-core install, which is the thing
   there that genuinely does not belong in the app. */
const SUITE_DIR = process.env.TT_SUITE_DIR || path.join(ROOT, 'tools', 'tests');
const TEST_DIR = process.env.TT_TEST_DIR || '/tmp/pwtest';
let BASE = 'http://127.0.0.1:8090/';   // re-set by startServer once the runner owns a port
const CHROMIUM = process.env.TT_CHROMIUM ||
  '/home/' + require('os').userInfo().username + '/.cache/ms-playwright/chromium-1243/chrome-linux-arm64/chrome';

/* Two lists, because one list conflated two very different things.
   SUITES is what this runner claims to test: every one must exist and pass, or
   the command fails. PLAN is what the app still has no browser coverage for —
   written out so the gap is visible in the output instead of hiding in a list
   of fourteen entries that were skipped every single run. */
const SUITES = [
  { file: 'smoke.js', what: 'boot, word bank intact, shelf, a story page with its art, audio served, sw, console clean' }
];

const PLAN = [
  ['words.js', 'cards, say-this, speak rate, quiz round'],
  ['actions.js', 'action tiles, quiz, mistakes'],
  ['letters.js', 'letter rows, pair-match, the zh case'],
  ['letters123.js', 'number row and count quiz'],
  ['match.js', 'match game'],
  ['review.js', 'revision queue and done screen'],
  ['grownup.js', 'grown-up panel: settings, audio pack, import/export'],
  ['pwa.js', 'service worker, offline load, icon, manifest'],
  ['infra.js', 'storage migrations, save-failure warning, update bar'],
  ['today.js', "leitner boxes, due queue, today's deck and route"],
  ['checkup.js', 'grown-up device check-up panel'],
  ['zh.js', 'the \u0bb4 (zhha) sound: spoken respelling, card letters, sentence fallback'],
  ['books.js', 'book shelf, reader, peek/count/quiz pages, finishing, progress'],
  ['stories.js', 'the ten stories: narration served, pages spoken, moral, audio gate'],
  ['layout.js', 'overflow / tap-size audit (a warning, not a failure)']
];

function portOpen(port) {
  return new Promise(function (resolve) {
    const s = net.connect(port, '127.0.0.1');
    s.setTimeout(400);
    s.once('connect', function () { s.destroy(); resolve(true); });
    s.once('timeout', function () { s.destroy(); resolve(false); });
    s.once('error', function () { resolve(false); });
  });
}

/* Ask the OS for a port nobody has. Reusing 8090 "if something is already
   listening" looked like convenience and was a trap: on this machine 8090 is
   held by an unrelated Gym Tracker app, so for as long as that has been true
   every browser test has run against somebody else's website — and, because
   missing suites were also skipped, reported all fourteen green. A test runner
   that cannot say which server it talked to cannot say anything. */
function freePort() {
  return new Promise(function (resolve, reject) {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', function () {
      const p = s.address().port;
      s.close(function () { resolve(p); });
    });
  });
}

async function startServer(dir) {
  const port = await freePort();
  const child = spawn('python3', [path.join(ROOT, 'tools', 'serve.py'), String(port), dir],
    { cwd: ROOT, stdio: 'ignore', detached: true });
  child.on('error', function () { });
  for (let i = 0; i < 25 && !(await portOpen(port)); i++) await new Promise(function (r) { setTimeout(r, 120); });
  return { child: child, port: port, base: 'http://127.0.0.1:' + port + '/' };
}

/* Prove the thing answering is this app before spending a minute of browser on
   it. Fetch the folder index and look for the Tamil title; a different app, a
   stale build or a server pointed at the wrong directory all fail here instead
   of failing as nineteen confusing assertion errors later. */
function isOurApp(base) {
  return new Promise(function (resolve) {
    var done = false, settle = function (v) { if (!done) { done = true; resolve(v); } };
    var timer = setTimeout(function () { settle({ ok: false, status: 'no answer in 6s' }); }, 6000);
    var req = require('http').get(base, function (res) {
      var body = '';
      res.on('data', function (c) { if (body.length < 400000) body += c; });
      res.on('error', function () { });
      res.on('end', function () {
        clearTimeout(timer);
        settle({ ok: /\u0ba4\u0bae\u0bbf\u0bb4\u0bcd|Tamil Tutor/.test(body) && /<script[^>]+src=/.test(body),
          status: res.statusCode, bytes: body.length });
      });
    });
    req.setTimeout(5000, function () { req.destroy(); settle({ ok: false, status: 'timeout' }); });
    req.on('error', function (e) { clearTimeout(timer); settle({ ok: false, status: String(e.code || e.message) }); });
  });
}

function stop(child) {
  if (!child) return;
  try { process.kill(-child.pid, 'SIGKILL'); } catch (e) { try { child.kill('SIGKILL'); } catch (e2) { } }
}

function runSuite(file) {
  return new Promise(function (resolve) {
    const t0 = Date.now();
    /* the suite is read from the repo, run with TEST_DIR as cwd so its
       require('playwright-core') resolves against the dev-only install */
    const p = spawn('node', [path.join(SUITE_DIR, file)], { cwd: TEST_DIR, env: Object.assign({}, process.env, { TT_TEST_DIR: TEST_DIR, TT_CHROMIUM: CHROMIUM, TT_BASE: BASE }) });
    let out = '';
    const timer = setTimeout(function () { p.kill('SIGKILL'); }, 420000);
    p.stdout.on('data', function (d) { out += d; if (out.length > 200000) out = out.slice(-120000); });
    p.stderr.on('data', function (d) { out += d; });
    p.on('close', function (code) {
      clearTimeout(timer);
      const fails = (out.match(/^\s*✗.*$/gm) || []).map(function (l) { return l.trim(); });
      resolve({ code: code, fails: fails, secs: ((Date.now() - t0) / 1000).toFixed(1), out: out });
    });
  });
}

(async function main() {
  const only = process.argv.slice(2).filter(function (a) { return !a.startsWith('-'); });
  if (!fs.existsSync(path.join(TEST_DIR, 'node_modules', 'playwright-core'))) {
    console.log('\n\u274c Playwright not installed in ' + TEST_DIR + ' \u2014 cannot run, which is not a pass');
    console.log('   npm i playwright-core@1.49.1 --prefix ' + TEST_DIR +
      '\n   (only the browser driver lives there; the suites themselves are in tools/tests/)\n');
    return 1;
  }
  if (!fs.existsSync(CHROMIUM)) {
    console.log('\n\u274c no chromium at ' + CHROMIUM +
      '\n   set TT_CHROMIUM to a browser binary \u2014 cannot run, which is not a pass\n');
    return 1;
  }

  const wanted = SUITES.filter(function (s) { return !only.length || only.some(function (o) { return s.file.indexOf(o) >= 0; }); });
  if (PLAN.length) console.log('  (no browser coverage yet for ' + PLAN.length + ' areas: '
    + PLAN.map(function (x) { return x[0]; }).slice(0, 6).join(', ')
    + (PLAN.length > 6 ? ' \u2026' : '') + ')');
  if (!wanted.length) { console.log('no suite matches ' + only.join(', ')); return 1; }

  const server = await startServer('dist/portable');   // the pwa suite needs the built folder served
  BASE = server.base;
  console.log('\nbrowser tests \u2014 Tamil Tutor  (' + TEST_DIR + ')\nserving ' + BASE + '\n');

  /* fail here rather than in nineteen confusing assertions later */
  const served = await isOurApp(BASE);
  if (!served.ok) {
    console.log('\u274c ' + BASE + ' is not this app (HTTP ' + served.status + ', ' + served.bytes +
      ' bytes) \u2014 npm run portable builds dist/portable\n   refusing to run browser tests against something else\n');
    stop(server.child);
    return 1;
  }

  let failed = 0, audited = 0, missing = 0, ran = 0;
  for (const s of wanted) {
    if (!fs.existsSync(path.join(SUITE_DIR, s.file))) {
      console.log('  ✗ ' + s.file.padEnd(14) + 'MISSING — advertised, never written');
      missing++;
      continue;
    }
    const r = await runSuite(s.file);
    ran++;
    const ok = r.code === 0 && !r.fails.length;
    if (!ok) { if (s.audit) audited++; else failed++; }
    console.log('  ' + (ok ? '✓' : (s.audit ? '⚠' : '✗')) + ' ' + s.file.padEnd(14) +
      (ok ? s.what : (r.fails.length ? r.fails.length + ' failed' : 'exit ' + r.code)) +
      '  [' + r.secs + 's]');
    if (!ok) r.fails.slice(0, 4).forEach(function (f) { console.log('      · ' + f); });
  }

  stop(server.child);
  /* Never report green for work that did not happen.

     This runner advertised fourteen suites and, for as long as it has existed,
     printed "✅ all suites green" while skipping all fourteen of them — a
     missing file was a `continue`, so `failed` stayed zero and the exit code
     was 0. A harness that lies is worse than no harness, because it is the
     reason somebody trusts a green run before shipping. Anything counted here
     has to have actually run, and anything advertised has to exist.
  */
  if (ran === 0) {
    console.log('\n❌ no suite ran — nothing was tested');
    return 1;
  }
  if (missing) {
    console.log('\n❌ ' + missing + ' of ' + wanted.length + ' advertised suite(s) are missing from '
      + path.relative(ROOT, SUITE_DIR) + '\n   a suite that does not exist is not a pass. write it, or take it out of SUITES');
    return 1;
  }
  console.log('\n' + (failed ? '❌ ' + failed + ' suite(s) failed' : '✅ all ' + ran + ' suite(s) green') +
    (audited ? '  (' + audited + ' audit warning' + (audited > 1 ? 's' : '') + ')' : ''));
  return failed ? 1 : 0;
})().then(function (code) { process.exit(code); });
