/* Tamil Tutor service worker — cache-first so the app opens with no network.
   VERSION is stamped automatically by `npm run verify -- --stamp` (or bump it by
   hand); old caches are cleaned up on activate. */
'use strict';

const VERSION = 'v2026.10.21';
const CACHE = 'tamil-tutor-' + VERSION;

const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'css/animations.css',
  'js/lib/util.js',
  'js/lib/sprites.js',
  'js/lib/audio.js',
  'js/lib/storage.js',
  'js/lib/confetti.js',
  'js/data/core.js',
  'js/data/nature.js',
  'js/data/food.js',
  'js/data/home.js',
  'js/data/people.js',
  'js/data/mind.js',
  'js/data/play.js',
  'js/ui.js',
  'js/app.js',
  'js/views/learn.js',
  'js/views/games.js',
  'js/views/stickers.js',
  'js/views/grownup.js',
  'icons/icon.svg',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  /* navigations: network first, fall back to the cached shell (offline open) */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  if (!sameOrigin) return;

  /* voice recordings: cache forever once heard (they never change), and let a
     missing file fail quietly so the app can fall back to the device voice.
     The manifest itself stays fresh so a regenerated pack is picked up. */
  if (url.pathname.indexOf('/audio/') >= 0 && !/manifest\.json$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => new Response('', { status: 503 })))
    );
    return;
  }

  /* everything else: cache first, quietly refresh in the background */
  e.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
      return hit || refresh;
    })
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
