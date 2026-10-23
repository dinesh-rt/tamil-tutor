/* Settings + progress in localStorage, with a tiny migration path. */
(function (TT) {
  'use strict';

  var KEY = 'tamil-tutor.v1';
  var U = TT.util;

  var DEFAULTS = {
    /* what the child sees */
    mode: 'bilingual',            // bilingual | tamil | english
    reveal: 'both',               // both | flip  (flip = picture first, tap to see the word)
    showSay: true,                // show the grown-up phrase chip
    showRoman: true,              // show "naai" under the Tamil word
    /* what the child hears */
    order: 'ta-first',            // ta-first | en-first
    speakTamil: true,
    speakEnglish: true,
    repeats: 2,
    gapMs: 620,
    rate: 0.85, pitch: 1, rateTa: null, pitchTa: null,
    volume: 1, voiceTa: null, voiceEn: null,
    localVoicesOnly: false,        // never use a network voice
    useRecordings: true,          // prefer the human audio pack when it exists
    clipRate: 1,                  // playback speed for recordings
    zhStyle: 'l',                 // how the spoken hint renders ழ with no Tamil voice: l | r | keep
    muted: false,
    sfx: true, sfxVolume: 0.55,
    /* pacing */
    autoplay: false, autoplaySec: 9,
    shuffle: true,
    rewardStars: true,
    /* housekeeping */
    kidLock: false,
    reduceMotion: false,
    theme: 'day',
    lastCategory: null,
    onboarded: false
  };

  var EMPTY_PROGRESS = {
    words: {},           // id -> {seen, correct, wrong, best, first, last}
    stickers: [],        // {wordId, at, cat}
    sessions: 0,
    minutes: 0,
    lastDay: null,
    streak: 0,
    byCat: {},
    books: {}            // id -> {page, reads, finished}
  };

  var CURRENT_VERSION = 4;

  function blank() {
    return { version: CURRENT_VERSION, settings: Object.assign({}, DEFAULTS), progress: JSON.parse(JSON.stringify(EMPTY_PROGRESS)), custom: [] };
  }

  var memoryOnly = false;
  var persistError = null;
  var recoveredFromBackup = false;
  var lostOnLoad = false;
  var db = blank();

  /* one-time upgrades. Add a step whenever the shape changes, so a save made
     a year ago still opens instead of being quietly thrown away. */
  var MIGRATIONS = {
    2: function (d) {                    // normalise word records (ready for Leitner boxes)
      var words = (d.progress && d.progress.words) || {};
      Object.keys(words).forEach(function (id) {
        var r = words[id] || {};
        words[id] = {
          seen: r.seen || 0, correct: r.correct || 0, wrong: r.wrong || 0,
          best: r.best || 0, first: r.first || 0, last: r.last || 0, box: r.box || 0
        };
      });
      d.progress.words = words;
      return d;
    },
    3: function (d) {                    // place existing progress into the Leitner boxes
      var now = Date.now(), words = (d.progress && d.progress.words) || {};
      Object.keys(words).forEach(function (id) {
        var r = words[id] || {};
        if (!r.box && r.seen) {          // guess a starting box from what we already know
          r.box = (r.correct >= 4 || (r.correct >= 3 && r.seen >= 8)) ? 4
            : (r.correct >= 1 || r.seen >= 4) ? 2 : 1;
        }
        r.box = r.box || 0;
        r.next = r.next || now;          // everything met so far comes back today
        words[id] = r;
      });
      d.progress.words = words;
      return d;
    },
    4: function (d) {                    // the book shelf remembers how far you got
      d.progress = d.progress || {};
      d.progress.books = d.progress.books || {};
      return d;
    }
  };

  function migrate(d) {
    for (var v = (d.version || 1) + 1; v <= CURRENT_VERSION; v++) {
      if (MIGRATIONS[v]) { try { d = MIGRATIONS[v](d) || d; } catch (e) { /* keep what we have */ } }
    }
    d.version = CURRENT_VERSION;
    return d;
  }

  function apply(obj) {                  // never trust the shape of stored JSON
    db.settings = Object.assign({}, DEFAULTS, obj.settings || {});
    db.progress = Object.assign(JSON.parse(JSON.stringify(EMPTY_PROGRESS)), obj.progress || {});
    db.progress.words = (obj.progress && obj.progress.words) || {};
    db.progress.stickers = (obj.progress && obj.progress.stickers) || [];
    db.progress.byCat = (obj.progress && obj.progress.byCat) || {};
    db.progress.books = (obj.progress && obj.progress.books) || {};
    db.custom = Array.isArray(obj.custom) ? obj.custom : [];
    db.version = obj.version || 1;
    return migrate(db);
  }

  function readRaw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function load() {
    var raw = readRaw(KEY);
    if (!raw) return;
    try {
      var obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return;
      // keep a last-known-good copy so a half-written save can be recovered
      try { if (readRaw(KEY + '.bak') !== raw) localStorage.setItem(KEY + '.bak', raw); } catch (e) { }
      apply(obj);
      /* a save that just migrated should not have to wait for the next tap to
         be written — otherwise the on-disk copy sits on an old version forever
         and every launch re-runs the migrations against it */
      if (db.version !== obj.version) save();
    } catch (e) {
      var bak = readRaw(KEY + '.bak');
      if (bak && bak !== raw) {
        try { apply(JSON.parse(bak)); recoveredFromBackup = true; return; } catch (e2) { }
      }
      db = blank();
      lostOnLoad = true;
    }
  }

  var saveSoon = U.debounce(function () {
    if (memoryOnly) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      persistError = null;              // recoveredFromBackup stays for the session: the Data panel should still be able to say so
    } catch (e) {
      memoryOnly = true;                       // full, private mode, or iOS purge
      persistError = (e && e.name) || String(e);
    }
  }, 350);

  function save() { saveSoon(); }

  /* ------------------------------------------------------------- progress api */

    /* ------------------------------------------------------- spaced repetition
     Each word sits in a box 0-4. Answer it right and it moves up (back in 1, 3,
     7 or 21 days); get it wrong and it drops to today. */
  var BOX_DAYS = [0, 1, 3, 7, 21];
  var DAY = 864e5;

  function wordRec(id) {
    var r = db.progress.words[id];
    if (!r) r = db.progress.words[id] = { seen: 0, correct: 0, wrong: 0, first: 0, last: 0, box: 0, next: 0 };
    return r;
  }

  function markSeen(id) {
    var r = wordRec(id);
    r.seen++; r.last = Date.now();
    if (!r.first) r.first = r.last;
    if (!r.box) r.next = r.next || r.last;      // brand-new words are due for a first look
    var cat = id.split('/')[0];
    db.progress.byCat[cat] = (db.progress.byCat[cat] || 0) + 1;
    save();
    return r;
  }

  function markAnswer(id, correct) {
    var r = wordRec(id);
    if (correct) { r.correct++; r.box = Math.min(BOX_DAYS.length - 1, (r.box || 0) + 1); }
    else { r.wrong++; r.box = 0; }
    r.last = Date.now();
    r.next = r.last + BOX_DAYS[r.box] * DAY;
    save();
    return r;
  }

  /** 0 = new · 1 = met · 2 = familiar · 3 = mastered */
  function level(id) {
    var r = db.progress.words[id];
    if (!r || !r.seen) return 0;
    if (r.correct >= 4 || (r.correct >= 3 && r.seen >= 8)) return 3;
    if (r.correct >= 1 || r.seen >= 4) return 2;
    return 1;
  }

  var LEVELS = [
    { n: 0, key: 'new', ta: 'புதியது', en: 'New', color: '#9ca3af' },
    { n: 1, key: 'met', ta: 'பழகியது', en: 'Met once', color: '#f59e0b' },
    { n: 2, key: 'familiar', ta: 'நன்கு தெரியும்', en: 'Familiar', color: '#22c55e' },
    { n: 3, key: 'mastered', ta: 'வந்துவிட்டது', en: 'Mastered', color: '#16a34a' }
  ];

  function levelInfo(id) { return LEVELS[level(id)]; }

  function stats() {
    var words = db.progress.words, ids = Object.keys(words), i, id, n = 0;
    var counts = [0, 0, 0, 0];
    var all = TT.data.allWords();
    for (i = 0; i < all.length; i++) { counts[level(all[i].id)]++; }
    n = all.length;
    return {
      total: n,
      seen: counts[1] + counts[2] + counts[3],
      familiar: counts[2] + counts[3],
      mastered: counts[3],
      new: counts[0],
      stickers: db.progress.stickers.length,
      sessions: db.progress.sessions,
      minutes: db.progress.minutes,
      streak: db.progress.streak
    };
  }

  /** Words worth revisiting: mis-tapped, overdue in their box, or seen a lot without ever getting one right. */
  function reviewQueue(catKey, limit) {
    var pool = catKey ? TT.data.catWords(catKey) : TT.data.allWords();
    var now = Date.now(), scored = [];
    pool.forEach(function (w) {
      var r = db.progress.words[w.id];
      if (!r) return;
      var score = 0;
      if (r.wrong >= 1) score += 3 + Math.min(4, r.wrong);
      if (r.seen >= 3 && r.correct === 0) score += 3;
      if ((r.next || 0) && r.next <= now) score += 4 - Math.min(3, r.box || 0);   // overdue counts
      if (level(w.id) === 0) score -= 5;
      if (score > 0) scored.push({ w: w, s: score });
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, limit || 12).map(function (x) { return x.w; });
  }

  /** Overdue words, most-needed first. */
  function dueWords(limit, now) {
    now = now || Date.now();
    var picked = TT.data.allWords().filter(function (w) {
      var r = db.progress.words[w.id];
      return !!r && r.seen > 0 && (r.next || 0) <= now;
    });
    picked.sort(function (a, b) {
      var ra = db.progress.words[a.id], rb = db.progress.words[b.id];
      if ((ra.wrong || 0) !== (rb.wrong || 0)) return (rb.wrong || 0) - (ra.wrong || 0);   // troublemakers first
      if ((ra.box || 0) !== (rb.box || 0)) return (ra.box || 0) - (rb.box || 0);            // shaky boxes first
      return (ra.next || 0) - (rb.next || 0);                                              // most overdue first
    });
    return typeof limit === 'number' ? picked.slice(0, limit) : picked;
  }

  /** Words this child has never met. */
  function freshWords(limit) {
    var fresh = TT.data.allWords().filter(function (w) {
      var r = db.progress.words[w.id];
      return !r || !r.seen;
    });
    for (var i = fresh.length - 1; i > 0; i--) {          // Fisher–Yates, no helper needed
      var j = Math.floor(Math.random() * (i + 1)), t = fresh[i]; fresh[i] = fresh[j]; fresh[j] = t;
    }
    return typeof limit === 'number' ? fresh.slice(0, limit) : fresh;
  }

  function dueCount() { return dueWords().length; }

  /** Today's deck: what is overdue, plus a couple of brand-new words so it never feels stale. */
  function todayWords(limit) {
    limit = limit || 8;
    var due = dueWords(), fresh = freshWords();
    var nFresh = Math.min(2, fresh.length);
    var nDue = Math.min(due.length, Math.max(0, limit - nFresh));
    nFresh = Math.min(fresh.length, Math.max(nFresh, limit - nDue));
    return due.slice(0, nDue).concat(fresh.slice(0, nFresh));
  }

  /** For the grown-up screens: where a word sits and when it comes back. */
  function boxInfo(id) {
    var r = db.progress.words[id] || { box: 0, next: 0 };
    var box = r.box || 0, next = r.next || 0;
    return { box: box, days: BOX_DAYS[box], due: !next || next <= Date.now(), dueIn: Math.max(0, Math.ceil((next - Date.now()) / DAY)) };
  }

  function addSticker(wordId, cat) {
    db.progress.stickers.push({ wordId: wordId, cat: cat, at: Date.now() });
    if (db.progress.stickers.length > 500) db.progress.stickers.shift();
    save();
  }

  /* books ------------------------------------------------------------------
     A finished book leaves exactly one sticker behind, however many times the
     same child reads it — a second ⭐ for the same book teaches them that
     stars are not worth anything. */
  function bookState(id) {
    var b = db.progress.books && db.progress.books[id];
    if (!b) return { page: 0, reads: 0, finished: false };
    return { page: b.page || 0, reads: b.reads || 0, finished: !!b.finished };
  }

  function markBookPage(id, page) {
    var b = db.progress.books[id] || (db.progress.books[id] = { page: 0, reads: 0, finished: false });
    if (page > (b.page || 0)) { b.page = page; save(); }
  }

  function finishBook(id) {
    var b = db.progress.books[id] || (db.progress.books[id] = { page: 0, reads: 0, finished: false });
    var firstTime = !b.finished;
    b.reads = (b.reads || 0) + 1;
    b.finished = true;
    if (firstTime && TT.books && TT.books.get) {
      var bk = TT.books.get(id);
      var w = bk && TT.books.firstWord(bk);
      if (w) addSticker(w, bk.cat);
    }
    save();
    return { firstTime: firstTime };
  }

  function startSession() {
    db.progress.sessions++;
    var t = U.todayKey();
    if (db.progress.lastDay !== t) {
      var y = U.todayKey(new Date(Date.now() - 864e5));
      db.progress.streak = (db.progress.lastDay === y) ? (db.progress.streak + 1) : 1;
      db.progress.lastDay = t;
    }
    save();
  }

  function addMinutes(m) { db.progress.minutes += m; save(); }

  function resetProgress() {
    db.progress = JSON.parse(JSON.stringify(EMPTY_PROGRESS));
    save();
  }

  function resetSettings() { db.settings = Object.assign({}, DEFAULTS); save(); }
  function wipe() {
    db = blank(); memoryOnly = false; persistError = null; lostOnLoad = false;
    try { localStorage.removeItem(KEY + '.bak'); } catch (e) { }
    save();
  }

  /* how well can we actually remember things on this device? */
  function canPersist() { return !memoryOnly; }
  function storageStatus() {
    return {
      persist: !memoryOnly, error: persistError, version: db.version,
      recovered: recoveredFromBackup, lostOnLoad: lostOnLoad,
      words: Object.keys(db.progress.words).length, custom: db.custom.length
    };
  }

  /* ------------------------------------------------------------------ custom */

  function addCustom(def) {
    if (!def || !def.en || !def.ta) return null;
    def.ro = def.ro || def.en;
    def.img = def.img || '🔤';
    def.id = (def.cat || 'custom') + '/' + TT.data.slug(def.en);
    db.custom.push(def);
    save();
    return def;
  }
  function removeCustom(i) { db.custom.splice(i, 1); save(); }
  function updateCustom(i, def) { db.custom[i] = def; save(); }

  TT.store = {
    KEY: KEY,
    DEFAULTS: DEFAULTS,
    LEVELS: LEVELS,
    load: load,
    save: save,
    get settings() { return db.settings; },
    get progress() { return db.progress; },
    get custom() { return db.custom; },
    get persistent() { return !memoryOnly; },
    markSeen: markSeen,
    markAnswer: markAnswer,
    level: level,
    levelInfo: levelInfo,
    stats: stats,
    reviewQueue: reviewQueue,
    dueWords: dueWords,
    dueCount: dueCount,
    freshWords: freshWords,
    todayWords: todayWords,
    boxInfo: boxInfo,
    BOX_DAYS: BOX_DAYS,
    addSticker: addSticker,
    bookState: bookState,
    markBookPage: markBookPage,
    finishBook: finishBook,
    startSession: startSession,
    addMinutes: addMinutes,
    resetProgress: resetProgress,
    resetSettings: resetSettings,
    wipe: wipe,
    canPersist: canPersist,
    storageStatus: storageStatus,
    CURRENT_VERSION: CURRENT_VERSION,
    addCustom: addCustom,
    removeCustom: removeCustom,
    updateCustom: updateCustom
  };
})(window.TT = window.TT || {});
