/* App shell: boot, hash router, home, category page, search. */
(function (TT) {
  'use strict';
  var U = TT.util, A = TT.audio, D = TT.data, S = TT.store, UI = TT.ui;

  var views = TT.views = {};
  var current = null;

  /* --------------------------------------------------------------- routing */

  function parseHash() {
    var h = (location.hash || '#/').replace(/^#\/?/, '');
    var segs = h.split('/').filter(Boolean);
    return { name: segs[0] || 'home', a: segs[1] || null, b: segs[2] || null };
  }

  function go(path) {
    if (path.charAt(0) !== '#') path = '#/' + path.replace(/^\/+/, '');
    if (location.hash === path) render(); else location.hash = path;
  }

  function render() {
    var route = parseHash();
    var view = views[route.name] || views.home;
    var host = document.getElementById('view');

    if (current && current.onLeave) { try { current.onLeave(); } catch (e) { /* noop */ } }
    A.cancel();
    U.clear(host);
    host.scrollTop = 0;
    window.scrollTo(0, 0);
    document.body.dataset.view = route.name;

    current = view;
    try {
      view.render(host, route);
    } catch (err) {
      console.error('view failed', err);
      U.append(host, U.el('p.empty', { text: 'Oops — that page had a problem. Tap home to start again.' }));
    }
    document.getElementById('btn-back').hidden = (route.name === 'home');
    updateStars();
    highlightNav(route.name);
  }

  /* The story shelf depends on an async look at the narration pack. If the
     Books tab is already on screen when that answer arrives, paint it again —
     otherwise the child sees ten books or twenty depending on network timing. */
  window.addEventListener('tt:stories-ready', function () {
    var v = document.body.dataset.view;
    /* the shelf needs repainting; a story that failed to open because the pack
       had not landed yet needs it even more. A story that DID open is left
       alone — never yank the page out from under a child mid-read */
    if (v === 'library' || (v === 'book' && document.querySelector('#view > p.empty'))) render();
  });

  function highlightNav(name) {
    U.qsa('.tabbar .tab').forEach(function (t) {
      t.classList.toggle('on', t.dataset.route === name || (name === 'cat' && t.dataset.route === 'learn') || (name === 'book' && t.dataset.route === 'library'));
    });
  }

  /* ---------------------------------------------------------------- chrome */

  function updateStars() {
    var n = S.progress.stickers.length;
    var el = document.getElementById('star-count');
    if (el) el.textContent = n;
  }

  function buildChrome() {
    var body = document.body;

    var bg = U.el('div#bg.bg', { 'aria-hidden': 'true' });
    var shapes = ['🌿', '⭐', '🌸', '🐘', '☁️', '🪁', '🌙', '🍋', '🦋', '🎈'];
    for (var i = 0; i < shapes.length; i++) {
      var s = U.el('span.bg-shape', { text: shapes[i], style: 'left:' + (i * 9.7 + 2) + '%;font-size:' + (26 + (i % 4) * 16) + 'px;animation-duration:' + (26 + (i % 5) * 9) + 's;animation-delay:-' + (i * 3.3) + 's;opacity:' + (0.10 + (i % 3) * 0.05) });
      bg.appendChild(s);
    }
    U.append(body, bg);

    var backBtn = U.el('button#btn-back.icon-btn.nav-back', { type: 'button', 'aria-label': 'Back', hidden: true, text: '←' });
    backBtn.addEventListener('click', function () { A.sfx('tap'); history.length > 1 ? history.back() : go('home'); });

    var brand = U.el('button.brand', { type: 'button', 'aria-label': 'Tamil Tutor home' }, [
      U.el('span.brand-ico', { text: '🐘' }),
      U.el('span.brand-text', {}, [
        U.el('span.brand-ta.tamil', { text: 'தமிழ்' }),
        U.el('span.brand-en', { text: 'Tutor' })
      ])
    ]);
    brand.addEventListener('click', function () { A.unlock(); A.sfx('ding'); go('home'); });
    /* hidden grown-up entrance: press and hold the elephant for 3 seconds */
    var holdTimer = null, holdRing = null;
    function startHold() {
      if (!S.settings.kidLock) return;
      holdRing = U.el('span.hold-ring');
      brand.appendChild(holdRing);
      holdTimer = setTimeout(function () {
        if (holdRing) { holdRing.remove(); holdRing = null; }
        A.sfx('correct'); go('grownup');
      }, 3000);
    }
    function endHold() { clearTimeout(holdTimer); if (holdRing) { holdRing.remove(); holdRing = null; } }
    brand.addEventListener('pointerdown', startHold);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) { brand.addEventListener(t, endHold); });

    var starBtn = U.el('button.icon-btn.star-btn', { type: 'button', 'aria-label': 'My stars' }, [
      U.el('span', { text: '⭐' }), U.el('span#star-count.badge', { text: '0' })
    ]);
    starBtn.addEventListener('click', function () { A.sfx('tap'); go('stickers'); });

    var soundBtn = U.el('button.icon-btn.sound-btn', { type: 'button', 'aria-label': 'Sound on/off' });
    function paintSound() {
      soundBtn.textContent = (S.settings.muted || S.settings.sfx === false) ? '🔇' : '🔊';
      soundBtn.setAttribute('aria-pressed', String(!(S.settings.muted || S.settings.sfx === false)));
    }
    soundBtn.addEventListener('click', function () {
      S.settings.muted = !S.settings.muted;
      S.save(); paintSound();
      if (!S.settings.muted) { A.unlock(); A.sfx('ding'); } else A.cancel();
    });
    paintSound();
    TT.repaintSound = paintSound;

    var parentBtn = U.el('button.icon-btn.parent-btn', { type: 'button', 'aria-label': 'Grown-ups' }, [U.el('span', { text: '🧩' })]);
    parentBtn.addEventListener('click', function () { A.sfx('tap'); go('grownup'); });
    function paintKidLock() { parentBtn.hidden = !!S.settings.kidLock; }
    paintKidLock();
    TT.repaintKidLock = paintKidLock;

    U.append(body, [
      U.el('header.topbar', {}, [
        backBtn, brand,
        U.el('div.topbar-actions', {}, [starBtn, soundBtn, parentBtn])
      ])
    ]);

    var tabs = [
      { route: 'home', icon: '🏠', ta: 'முகப்பு', en: 'Home' },
      { route: 'learn', icon: '📚', ta: 'கற்க', en: 'Learn' },
      /* the Tamil for this tab is the word bank's own word for "book" */
      { route: 'library', icon: '📖', ta: (D.getWord('school/book') || {}).ta || 'Books', en: 'Books' },
      { route: 'play', icon: '🎲', ta: 'விளையாடு', en: 'Play' },
      { route: 'stickers', icon: '⭐', ta: 'நட்சத்திரம்', en: 'Stars' }
    ];
    var tabbar = U.el('nav.tabbar', { role: 'navigation', 'aria-label': 'Main' });
    tabs.forEach(function (t) {
      var b = U.el('button.tab', { type: 'button', dataset: { route: t.route }, 'aria-label': t.en }, [
        U.el('span.tab-ico', { text: t.icon }),
        U.el('span.tab-ta.tamil', { text: t.ta }),
        U.el('span.tab-en', { text: t.en })
      ]);
      b.addEventListener('click', function () { A.unlock(); A.sfx('tap'); go(t.route); });
      tabbar.appendChild(b);
    });
    U.append(body, tabbar);
    U.append(body, U.el('div#sheet-root'));
    U.append(body, U.el('canvas#fx.fx-canvas', { 'aria-hidden': 'true' }));
  }

  /* ------------------------------------------------------------------ home */

  views.home = {
    render: function (host, route) {
      var cats = D.allCategories();
      var st = S.stats();

      var hello = U.el('section.hero', {}, [
        U.el('div.hero-mascot', { 'aria-hidden': 'true' }, [U.el('span.hero-elephant', { text: '🐘' })]),
        U.el('div.hero-text', {}, [
          U.el('h1.hero-ta.tamil', { text: 'வணக்கம்!' }),
          U.el('p.hero-en', {}, ['Hello little one — ', U.el('b', { text: 'let’s learn Tamil!' })]),
          U.el('p.hero-stats', {}, [
            U.el('span.stat-pill', { text: '⭐ ' + st.stickers }),
            U.el('span.stat-pill', { text: '👀 ' + st.seen + '/' + st.total }),
            U.el('span.stat-pill', { text: '🔒 ' + st.mastered + ' mastered' })
          ])
        ])
      ]);
      hello.querySelector('.hero-mascot').addEventListener('click', function () {
        A.unlock(); A.cancel(); A.sfx('applause'); A.speakText('வணக்கம்! நாம் தமிழ் படிப்போமா. வாங்க!', { lang: 'ta', roman: 'Vanakkam! Naam Tamil padippoma. Vaanga!' });
        TT.confetti.atEl(hello, { count: 26 });
      });
      host.appendChild(hello);

      /* keep going */
      var last = S.settings.lastCategory && D.getCat(S.settings.lastCategory) ? D.getCat(S.settings.lastCategory) : null;
      if (last) {
        host.appendChild(U.el('section.row', {}, [
          UI.sectionHead('தொடரலாம்', 'Pick up where you left off'),
          U.el('div.row-cta', {}, [
            UI.bigButton('Continue ' + last.en, { icon: last.icon, ta: last.ta, color: last.color, sub: last.words.length + ' words' }, function () { go('cards/' + last.key); }),
            UI.bigButton('Play a game', { icon: '🎲', ta: 'விளையாடு', color: '#7c3aed' }, function () { go('play/' + last.key); })
          ])
        ]));
      }

      /* five brand new words to meet today */
      var fresh = [];
      var pool = D.allWords();
      var shuffled = D.shuffle(pool);
      for (var i = 0; i < shuffled.length && fresh.length < 5; i++) {
        if (S.level(shuffled[i].id) === 0 && (!last || shuffled[i].cat === last.key || fresh.length > 2)) fresh.push(shuffled[i]);
      }
      if (!fresh.length) fresh = D.shuffle(pool).slice(0, 5);
      host.appendChild(U.el('section.row', {}, [
        UI.sectionHead('இன்னைக்கு புதிய சொல்', 'New words for today'),
        U.el('div.mini-row', {}, fresh.map(function (w) { return UI.miniCard(w); }))
      ]));

      /* today's review — what the boxes say is due, tap the band to play it */
      var today = S.todayWords ? S.todayWords(6) : S.reviewQueue(null, 5);
      if (today.length > 1) {
        var dueN = S.dueCount ? S.dueCount() : today.length;
        var playToday = U.el('button.btn.btn-small', { type: 'button', text: '▶ Play' });
        playToday.addEventListener('click', function () { A.unlock(); A.sfx('tap'); go('play/today'); });
        host.appendChild(U.el('section.row.today-band', {}, [
          UI.sectionHead('மீண்டு பாப்போம்', 'Today — ' + dueN + ' word' + (dueN === 1 ? '' : 's') + ' waiting', playToday),
          U.el('div.mini-row', {}, today.map(function (w) { return UI.miniCard(w); }))
        ]));
      }

      /* all the categories */
      host.appendChild(U.el('section.row', {}, [
        UI.sectionHead('என்ன படிப்போம்?', 'Choose a topic', (function () {
          var b = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '🔎' }), U.el('span', { text: 'Search' })]);
          b.addEventListener('click', function () { go('search'); });
          return b;
        })()),
        U.el('div.tile-grid', {}, cats.map(function (c) { return UI.catTile(c, '#/cat/' + c.key); }))
      ]));

      var foot = U.el('p.foot-note', {}, [
        'Made for little hands · works offline · no ads, no tracking. ',
        U.el('button.linkish', { type: 'button', text: 'Grown-up corner' })
      ]);
      foot.querySelector('.linkish').addEventListener('click', function () { go('grownup'); });
      host.appendChild(foot);
    }
  };

  /* --------------------------------------------------------- learn (picker) */

  views.learn = {
    render: function (host) {
      host.appendChild(UI.sectionHead('படிக்கலாம்', 'Choose a topic to start flashcards'));
      var wrap = U.el('div.tile-grid', {});
      D.allCategories().forEach(function (c) { wrap.appendChild(UI.catTile(c, '#/cat/' + c.key)); });
      host.appendChild(wrap);
    }
  };

  views.play = {
    render: function (host, route) {
      host.appendChild(UI.sectionHead('விளையாடு', 'Games — pick a topic'));
      var cats = D.allCategories();
      var wrap = U.el('div.tile-grid', {});
      cats.forEach(function (c) {
        var a = UI.catTile(c, '#/play/' + c.key);
        a.classList.add('tile-game');
        wrap.appendChild(a);
      });
      host.appendChild(wrap);
    }
  };

  /* ------------------------------------------------------- category landing */

  views.cat = {
    render: function (host, route) {
      var cat = D.getCat(route.a);
      if (!cat) { go('learn'); return; }
      S.settings.lastCategory = cat.key; S.save();

      var head = U.el('section.cat-head', { style: '--cat:' + cat.color }, [
        U.el('div.cat-icon', { text: cat.icon }),
        U.el('div.cat-title', {}, [
          U.el('h1.tamil', { text: cat.ta }),
          U.el('p.cat-en', { text: cat.en }),
          U.el('p.cat-desc', { text: cat.desc })
        ])
      ]);
      head.querySelector('.cat-icon').addEventListener('click', function () {
        A.unlock(); A.cancel(); A.speakText(cat.ta, { lang: 'ta' }); A.sfx('ding');
        TT.confetti.atEl(head, { count: 18 });
      });
      host.appendChild(head);

      var seen = cat.words.filter(function (w) { return S.level(w.id) > 0; }).length;
      host.appendChild(U.el('div.cat-cta', {}, [
        UI.bigButton('Flashcards', { icon: '🃏', ta: 'சொல் அட்டை', color: cat.color, sub: cat.words.length + ' words' }, function () { go('cards/' + cat.key); }),
        UI.bigButton('Games', { icon: '🎲', ta: 'விளையாட்டு', color: cat.color, sub: '3 games' }, function () { go('play/' + cat.key); }),
        UI.bigButton('Say them all', { icon: '🗣️', ta: 'பட்டியல்', color: cat.color, sub: seen + ' met' }, function () { go('wall/' + cat.key); })
      ]));

      host.appendChild(UI.sectionHead('அனைத்து சொற்கள்', 'All the words — tap to hear them'));
      var wall = U.el('div.mini-grid', {});
      cat.words.forEach(function (w) { wall.appendChild(UI.miniCard(w)); });
      host.appendChild(wall);
    }
  };

  views.wall = {
    render: function (host, route) {
      var cat = D.getCat(route.a);
      if (!cat) { go('learn'); return; }
      host.appendChild(UI.sectionHead(cat.ta, cat.en + ' — tap any picture to hear it'));
      var wall = U.el('div.mini-grid', {});
      cat.words.forEach(function (w) { wall.appendChild(UI.miniCard(w)); });
      host.appendChild(wall);
    }
  };

  /* ---------------------------------------------------------------- search */

  views.search = {
    render: function (host) {
      host.appendChild(UI.sectionHead('தேடு', 'Search in Tamil, English or how it sounds'));
      var input = U.el('input.search-input', { type: 'search', placeholder: 'dog, நாய், naai…', 'aria-label': 'Search words', autocomplete: 'off' });
      var out = U.el('div.mini-grid', {});
      host.appendChild(input); host.appendChild(out);
      setTimeout(function () { input.focus(); }, 60);

      function run() {
        var q = input.value.trim();
        var res = q ? D.search(q).slice(0, 60) : D.shuffle(D.allWords()).slice(0, 24);
        U.clear(out);
        if (!res.length) { U.append(out, UI.empty('No words found — try another spelling')); return; }
        res.forEach(function (w) { out.appendChild(UI.miniCard(w)); });
      }
      input.addEventListener('input', U.debounce(run, 160));
      run();
    }
  };

  /* ------------------------------------------------------------------ boot */

  function applyTheme() {
    document.documentElement.dataset.theme = S.settings.theme || 'day';
    document.documentElement.dataset.motion = S.settings.reduceMotion ? 'reduced' : 'full';
  }

  function registerCustomWords() {
    if (!S.custom.length) return;
    if (!D.getCat('custom')) {
      D.category({ key: 'custom', en: 'My words', ta: 'நம்ம சொற்கள்', icon: '🏡', color: '#0f766e', desc: 'Added by you' });
    }
    S.custom.forEach(function (w) {
      var key = w.cat && D.getCat(w.cat) ? w.cat : 'custom';
      D.words(key, [{ en: w.en, ta: w.ta, ro: w.ro, img: w.img, mo: w.mo, say: w.say }]);
    });
  }

  /* ------------------------------------------------ new version / save health */

  var updateBar = null;
  var reloading = false;

  function offerUpdate(worker) {                 // a refreshed worker is installed, waiting
    if (!worker || updateBar || reloading) return;
    var later, go;
    updateBar = U.el('div.update-bar', { role: 'status', 'aria-live': 'polite' }, [
      U.el('span.update-bar-text', { text: '🆕 New version ready' }),
      go = U.el('button.btn.btn-small', { text: 'Refresh', onclick: function () {
        try { worker.postMessage({ type: 'SKIP_WAITING' }); }
        catch (e) { location.reload(); }
      } }),
      later = U.el('button.btn.btn-ghost.btn-small', { text: 'Later', onclick: function () {
        if (updateBar) { updateBar.remove(); updateBar = null; }
      } })
    ]);
    document.body.appendChild(updateBar);
    return updateBar;
  }

  function watchForUpdates(reg) {
    if (reg.waiting) offerUpdate(reg.waiting);
    reg.addEventListener('updatefound', function () {
      var nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', function () {
        var st = nw.state || nw.status;
        if (st === 'installed' && navigator.serviceWorker.controller) offerUpdate(nw);
      });
    });
    var ping = function () { try { reg.update(); } catch (e) { } };
    ping();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) ping(); });
  }

  function storageNotice() {
    var st = S.storageStatus ? S.storageStatus() : { persist: true };
    if (!st.persist) {
      if (A && A.sfx) { /* nothing to play yet — first gesture hasn't happened */ }
      setTimeout(function () {
        if (TT.ui && TT.ui.toast) TT.ui.toast('⚠️ Progress cannot be saved here — use Data → Export', { ms: 4200 });
      }, 900);
    } else if (st.recovered || st.lostOnLoad) {
      setTimeout(function () {
        if (TT.ui && TT.ui.toast) TT.ui.toast(st.recovered ? '↩️ Recovered your last good save' : 'ℹ️ Starting fresh (old save was unreadable)', { ms: 3200 });
      }, 900);
    }
    return st;
  }

  function boot() {
    S.load();
    registerCustomWords();
    applyTheme();
    if (A && A.loadPack) A.loadPack();      // human recordings, if they were generated
    buildChrome();
    if (TT.repaintKidLock) TT.repaintKidLock();

    /* one gesture unlocks speech + audio for the whole session (iOS rule) */
    function unlockOnce() {
      A.unlock();
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    }
    window.addEventListener('pointerdown', unlockOnce);
    window.addEventListener('keydown', unlockOnce);

    S.startSession();
    storageNotice();
    var start = Date.now();
    setInterval(function () {
      var mins = Math.round((Date.now() - start) / 60000);
      if (mins > 0) { S.addMinutes(mins); start = Date.now(); }
    }, 60000);

    window.addEventListener('hashchange', render);
    render();

    /* offline / home-screen support — only when served over http(s) */
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js')
        .then(watchForUpdates)
        .catch(function () { /* offline-first is a bonus */ });
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (reloading) return;
        reloading = true;
        if (updateBar) { updateBar.remove(); updateBar = null; }
        location.reload();
      });
    }
  }

  TT.version = '1.0.0';

  TT.app = {
    go: go, render: render, views: views, applyTheme: applyTheme, boot: boot,
    registerCustomWords: registerCustomWords, offerUpdate: offerUpdate,
    storageNotice: storageNotice,
    checkForUpdate: function (cb) {
      if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) { if (cb) cb(false); return; }
      navigator.serviceWorker.getRegistration().then(function (reg) {
        if (!reg) { if (cb) cb(false); return; }
        watchForUpdates(reg);
        if (cb) cb(!!reg.waiting || !!reg.installing);
      }, function () { if (cb) cb(false); });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.TT = window.TT || {});
