#!/usr/bin/env node
/* Browser smoke tests for Tamil Tutor — one command instead of six.

     npm test                run every Playwright suite
     npm test -- smoke       just the named suite(s)
     TT_TEST_DIR=/path npm test

The suites themselves live outside the app (they are development scaffolding,
not the product), default /tmp/pwtest. If Playwright is not installed there the
script says what to do and exits 0 — CI-style checks should not fail because a
test machine is missing a browser.
*/
'use strict';

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEST_DIR = process.env.TT_TEST_DIR || '/tmp/pwtest';
const CHROMIUM = process.env.TT_CHROMIUM ||
  '/home/' + require('os').userInfo().username + '/.cache/ms-playwright/chromium-1243/chrome-linux-arm64/chrome';

const SUITES = [
  { file: 'smoke.js', what: 'routes, cards, games, grown-up, custom words, service worker' },
  { file: 'extra.js', what: 'autoplay, flip mode, themes, mute, reduce-motion, review' },
  { file: 'practice.js', what: 'english-only mode and the "say it in english" game' },
  { file: 'audiopack.js', what: 'human recordings over http, fallbacks' },
  { file: 'filetest.js', what: 'single-file build opened from file://' },
  { file: 'portable.js', what: 'portable folder + offline file, clips, localStorage' },
  { file: 'pwa.js', what: 'installable build: manifest, worker, offline reload' },
  { file: 'infra.js', what: 'storage migrations, save-failure warning, update bar' },
  { file: 'today.js', what: 'leitner boxes, due queue, today\'s deck and route' },
  { file: 'checkup.js', what: 'grown-up device check-up panel' },
  { file: 'zh.js', what: 'the ழ sound: spoken respelling, card letters, sentence fallback' },
  { file: 'layout.js', what: 'overflow / tap-size audit', audit: true }
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

async function ensureServer(port, dir) {
  if (await portOpen(port)) return null;
  const child = spawn('python3', [path.join(ROOT, 'tools', 'serve.py'), String(port), dir],
    { cwd: ROOT, stdio: 'ignore', detached: true });
  child.on('error', function () { });
  for (let i = 0; i < 25 && !(await portOpen(port)); i++) await new Promise(function (r) { setTimeout(r, 120); });
  return child;
}

function stop(child) {
  if (!child) return;
  try { process.kill(-child.pid, 'SIGKILL'); } catch (e) { try { child.kill('SIGKILL'); } catch (e2) { } }
}

function runSuite(file) {
  return new Promise(function (resolve) {
    const t0 = Date.now();
    const p = spawn('node', [path.join(TEST_DIR, file)], { cwd: TEST_DIR, env: process.env });
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
    console.log('\n⚠️  Playwright not found in ' + TEST_DIR);
    console.log('   npm i playwright-core@1.49.1 --prefix ' + TEST_DIR +
      '\n   (suites stay outside the app on purpose — nothing to install for the app itself)\n');
    return 0;
  }
  if (!fs.existsSync(CHROMIUM)) console.log('⚠️  chromium not at ' + CHROMIUM + ' (set TT_CHROMIUM)');

  const wanted = SUITES.filter(function (s) { return !only.length || only.some(function (o) { return s.file.indexOf(o) >= 0; }); });
  if (!wanted.length) { console.log('no suite matches ' + only.join(', ')); return 1; }

  const server = await ensureServer(8090, 'dist/portable');   // pwa suite needs the built folder served
  console.log('\nbrowser tests — Tamil Tutor  (' + TEST_DIR + ')\n');

  let failed = 0, audited = 0;
  for (const s of wanted) {
    if (!fs.existsSync(path.join(TEST_DIR, s.file))) {
      console.log('  – ' + s.file.padEnd(14) + 'missing, skipped');
      continue;
    }
    const r = await runSuite(s.file);
    const ok = r.code === 0 && !r.fails.length;
    if (!ok) { if (s.audit) audited++; else failed++; }
    console.log('  ' + (ok ? '✓' : (s.audit ? '⚠' : '✗')) + ' ' + s.file.padEnd(14) +
      (ok ? s.what : (r.fails.length ? r.fails.length + ' failed' : 'exit ' + r.code)) +
      '  [' + r.secs + 's]');
    if (!ok) r.fails.slice(0, 4).forEach(function (f) { console.log('      · ' + f); });
  }

  stop(server);
  console.log('\n' + (failed ? '❌ ' + failed + ' suite(s) failed' : '✅ all suites green') +
    (audited ? '  (' + audited + ' audit warning' + (audited > 1 ? 's' : '') + ')' : ''));
  return failed ? 1 : 0;
})().then(function (code) { process.exit(code); });
