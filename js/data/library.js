/* Books: ten tiny board-books, stitched from words this app already knows.

   Deliberately conservative about language. Every page is an existing word
   card, so the Tamil on screen and the Tamil on the ear are both the ones the
   word bank already ships — this file invents no sentences and needs no new
   recordings. Titles come from the word bank's own category names for the
   same reason.

   Page kinds the reader understands:
     word   {k:'word',  w:'animals/cow', hide:true?}   hide = peek-a-boo page
     count  {k:'count', n:3, item:'toys/ball', num:'numbers/three'}
     quiz   {k:'quiz',  w:'animals/lion', cat:'animals'}  tap the one you heard
     line   {k:'line',  ta:'…', en:'…', clip:'books/x/p01.mp3', dur:3.4}
                                                            ← real stories later
   `cover` and `end` are added for you. A page whose word can't be found is
   dropped at load, so a renamed word costs a page and not a broken book.     */
(function (TT) {
  'use strict';
  var D = TT.data;

  var books = [], byId = {};
  var storyPack = null;

  /* A story is only shippable once it can be heard. The word-books narrate
     themselves from the existing pack, but a story page is one spoken line and
     those clips are made by tools/make-story-pack.py — so a book whose audio
     has not been generated yet is not a book, it is a silent screen a
     two-year-old taps at. Stories stay off the shelf until
     audio/books/manifest.json says their clips exist. */
  function loadStoryPack() {
    /* Under file:// a fetch either fails outright or is refused, and a story
       with no way to be heard is simply not offered — so don't ask. A portable
       bundle can hand the index over directly as window.TT_STORY_PACK. */
    var injected = typeof window !== 'undefined' && window.TT_STORY_PACK;
    if (!injected) {
      if (typeof fetch !== 'function') return;
      if (typeof location !== 'undefined' && location.protocol === 'file:') return;
    }
    var asking = injected
      ? Promise.resolve({ ok: true, json: function () { return Promise.resolve(window.TT_STORY_PACK); } })
      : fetch('audio/books/manifest.json', { cache: 'no-cache' });
    asking
      .then(function (r) { return r && r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j) return;
        storyPack = (j && j.books) || j || {};
        books.forEach(function (b) {
          if (!b.story) return;
          var rec = storyPack[b.id];
          /* complete, not merely present: a half-narrated book would open on
             page 3 with nothing to hear */
          b.ready = !!(rec && rec.complete && rec.pages && rec.pages.length === b.pages.length);
          if (!b.ready || !rec.pages) return;
          rec.pages.forEach(function (m, i) {
            if (!m) return;
            b.pages[i].dur = m.dur || 0;
            /* the pack names clips after the text that made them, so an edited
               line gets a new filename and the worker cannot serve the old one */
            if (m.file) b.pages[i].clip = 'audio/books/' + b.id + '/' + m.file;
          });
          b._pages = null;   // pagesOf() may be cached from before the durations arrived
        });
        /* the shelf is often already painted by the time this answer lands —
           without this the Books tab shows ten books or twenty depending on
           whether a fetch won the race, which is the kind of bug a toddler
           finds and a grown-up cannot reproduce */
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          try { window.dispatchEvent(new CustomEvent('tt:stories-ready')); } catch (e) { /* ignore */ }
        }
      })
      .catch(function () { /* no pack: the shelf simply has no stories */ });
  }

  function exists(ref) { return !!ref && !!D.getWord(ref); }

  function book(def) {
    if (!def || !def.id || !def.pages) return;
    var cat = def.cat || (def.pages[0] && def.pages[0].w || '').split('/')[0];
    var c = D.getCat(cat);
    def.cat = cat;
    def.ta = def.ta || (c && c.ta) || def.en;
    def.icon = def.icon || (c && c.icon) || '📖';
    def.color = def.color || (c && c.color) || '#f59e0b';
    def.en = def.en || def.ta;

    def.pages = def.pages.filter(function (p) {
      if (p.k === 'quiz') return exists(p.w);
      if (p.k === 'count') return exists(p.item) && exists(p.num);
      if (p.k === 'line') return !!(p.ta && p.clip);
      if (p.k === 'moral') return !!p.ta;   // the moral has no word to check, only a line
      return exists(p.w);
    });
    if (!def.pages.length) return;
    if (def.story) def.ready = !!(storyPack && storyPack[def.id]);
    /* the single-file bundle is one file with nothing beside it, so a cover it
       cannot have is not worth a request; the emoji was the cover first, and a
       story page without its picture is still a page — the Tamil line is the page */
    if (typeof window !== 'undefined' && window.TT_SINGLE_FILE) {
      def.art = null;
      def.pages.forEach(function (p) { p.art = null; });
    }
    if (!byId[def.id]) { books.push(def); byId[def.id] = def; }
  }

  /* cover + content + the page that celebrates */
  function pagesOf(b) {
    if (!b._pages) {
      b._pages = [{ k: 'cover' }].concat(b.pages).concat([{ k: 'end', w: firstWord(b) }]);
    }
    return b._pages;
  }

  /* the sticker a finished book leaves behind */
  function firstWord(b) {
    for (var i = 0; i < b.pages.length; i++) {
      var p = b.pages[i];
      if (p.w && exists(p.w)) return p.w;
      if (p.item && exists(p.item)) return p.item;
    }
    return null;
  }

  function all() { return books.filter(function (b) { return !b.story || b.ready; }); }
  function shelf() { return books; }
  function get(id) {
    var b = byId[id] || null;
    return (b && (!b.story || b.ready)) ? b : null;
  }
  function word(ref) { return exists(ref) ? D.getWord(ref) : null; }

  /* ------------------------------------------------------------------ shelf */

  book({
    id: 'animals', en: 'Animal Friends',
    pages: [
      { k: 'word', w: 'animals/dog' },
      { k: 'word', w: 'animals/cat' },
      { k: 'word', w: 'animals/cow' },
      { k: 'word', w: 'animals/elephant', hide: true },
      { k: 'word', w: 'animals/horse' },
      { k: 'word', w: 'animals/goat' },
      { k: 'quiz', w: 'animals/lion' }
    ]
  });

  book({
    id: 'birds', en: 'Birds Up High',
    pages: [
      { k: 'word', w: 'birds/bird' },
      { k: 'word', w: 'birds/peacock' },
      { k: 'word', w: 'birds/parrot' },
      { k: 'word', w: 'birds/hen' },
      { k: 'word', w: 'birds/duck' },
      { k: 'word', w: 'birds/crow', hide: true },
      { k: 'quiz', w: 'birds/owl' }
    ]
  });

  book({
    id: 'fruits', en: 'Sweet Fruits',
    pages: [
      { k: 'word', w: 'fruits/mango' },
      { k: 'word', w: 'fruits/banana' },
      { k: 'word', w: 'fruits/apple' },
      { k: 'word', w: 'fruits/grapes' },
      { k: 'word', w: 'fruits/jackfruit', hide: true },
      { k: 'count', n: 3, item: 'fruits/banana', num: 'numbers/three' },
      { k: 'quiz', w: 'fruits/watermelon' }
    ]
  });

  book({
    id: 'sea', en: 'The Big Sea',
    pages: [
      { k: 'word', w: 'sea/fish' },
      { k: 'word', w: 'sea/crab' },
      { k: 'word', w: 'sea/whale' },
      { k: 'word', w: 'sea/dolphin' },
      { k: 'word', w: 'sea/seahorse', hide: true },
      { k: 'word', w: 'sea/shell' },
      { k: 'quiz', w: 'sea/octopus' }
    ]
  });

  book({
    id: 'sky', cat: 'nature', en: 'Sky, Sun, Rain',
    pages: [
      { k: 'word', w: 'nature/sun' },
      { k: 'word', w: 'nature/moon' },
      { k: 'word', w: 'nature/star' },
      { k: 'word', w: 'nature/cloud' },
      { k: 'word', w: 'nature/rain' },
      { k: 'word', w: 'nature/rainbow', hide: true },
      { k: 'quiz', w: 'weather/umbrella', cat: 'weather' }
    ]
  });

  book({
    id: 'colours', cat: 'colors', en: 'All the Colours',
    pages: [
      { k: 'word', w: 'colors/red' },
      { k: 'word', w: 'colors/blue' },
      { k: 'word', w: 'colors/green' },
      { k: 'word', w: 'colors/yellow' },
      { k: 'word', w: 'colors/pink' },
      { k: 'word', w: 'colors/white', hide: true },
      { k: 'quiz', w: 'colors/purple' }
    ]
  });

  book({
    id: 'counting', cat: 'numbers', en: 'One to Five',
    pages: [
      { k: 'count', n: 1, item: 'toys/ball', num: 'numbers/one' },
      { k: 'count', n: 2, item: 'toys/kite', num: 'numbers/two' },
      { k: 'count', n: 3, item: 'nature/star', num: 'numbers/three' },
      { k: 'count', n: 4, item: 'nature/flower', num: 'numbers/four' },
      { k: 'count', n: 5, item: 'birds/bird', num: 'numbers/five' },
      { k: 'word', w: 'actions/count' },
      { k: 'quiz', w: 'numbers/three' }
    ]
  });

  book({
    id: 'body', en: 'My Body',
    pages: [
      { k: 'word', w: 'body/head' },
      { k: 'word', w: 'body/eyes' },
      { k: 'word', w: 'body/nose' },
      { k: 'word', w: 'body/mouth' },
      { k: 'word', w: 'body/hand' },
      { k: 'word', w: 'body/leg' },
      { k: 'word', w: 'body/hair', hide: true },
      { k: 'quiz', w: 'body/heart' }
    ]
  });

  book({
    id: 'vehicles', en: 'Off We Go',
    pages: [
      { k: 'word', w: 'vehicles/car' },
      { k: 'word', w: 'vehicles/bus' },
      { k: 'word', w: 'vehicles/train' },
      { k: 'word', w: 'vehicles/aeroplane' },
      { k: 'word', w: 'vehicles/bicycle' },
      { k: 'word', w: 'vehicles/boat' },
      { k: 'word', w: 'vehicles/rocket', hide: true },
      { k: 'quiz', w: 'vehicles/helicopter' }
    ]
  });

  book({
    id: 'family', en: 'People I Love',
    pages: [
      { k: 'word', w: 'family/mother' },
      { k: 'word', w: 'family/father' },
      { k: 'word', w: 'family/grandmother' },
      { k: 'word', w: 'family/grandfather' },
      { k: 'word', w: 'family/baby' },
      { k: 'word', w: 'family/friend', hide: true },
      { k: 'quiz', w: 'family/elder-sister' }
    ]
  });

  TT.books = {
    book: book,
    all: all,
    shelf: shelf,
    get: get,
    word: word,
    pagesOf: pagesOf,
    firstWord: firstWord,
    storiesWaiting: function () {
      return books.filter(function (b) { return b.story && !b.ready; }).length;
    }
  };

  loadStoryPack();
})(window.TT = window.TT || {});
