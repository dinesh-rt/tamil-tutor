/* Books: the shelf, and the reader that plays a book page by page.

   Everything a child hears here is a recording the app already owns, and every
   Tamil label is a string lifted from the word bank — this file adds English
   chrome only, so nothing unvetted reaches a two-year-old's ears. */
(function (TT) {
  'use strict';
  var U = TT.util, A = TT.audio, D = TT.data, S = TT.store, UI = TT.ui;
  var views = TT.views, B = TT.books;

  function go(p) { TT.app.go(p); }
  function bookWord() { var w = D.getWord('school/book'); return (w && w.ta) || 'Books'; }

  /* ------------------------------------------------------------------ shelf */

  views.library = {
    render: function (host) {
      var all = B.all();
      A.unlock();

      U.append(host, UI.sectionHead(bookWord(), 'Books — tap the page to hear it'));

      /* the one you abandoned halfway, if any */
      var started = null;
      all.forEach(function (b) {
        var st = S.bookState(b.id);
        if (st.page > 0 && !st.finished && (!started || st.page > S.bookState(started.id).page)) started = b;
      });
      if (started) {
        var st0 = S.bookState(started.id);
        host.appendChild(U.el('section.row', {}, [
          UI.sectionHead('தொடரலாம்', 'Continue the book you were on'),
          U.el('div.row-cta', {}, [
            UI.bigButton(started.en, {
              icon: started.icon, ta: started.ta, color: started.color,
              sub: 'page ' + Math.min(st0.page + 1, B.pagesOf(started).length) + ' of ' + B.pagesOf(started).length
            }, function () { A.sfx('tap'); go('book/' + started.id + '/' + st0.page); })
          ])
        ]));
      }

      function row(list, ta, en) {
        if (!list.length) return;
        host.appendChild(UI.sectionHead(ta, en));
        var shelf = U.el('div.shelf', { role: 'list' });
        list.forEach(function (b) { shelf.appendChild(tile(b)); });
        host.appendChild(shelf);
      }

      var board = all.filter(function (b) { return !b.story; });
      var tales = all.filter(function (b) { return b.story; });
      if (tales.length && board.length) {
        row(board, 'புத்தகங்கள்', 'Tap a page to hear it');
        row(tales, 'கதைகள்', 'Ten old tales — one line per page, read aloud');
      } else {
        row(all, bookWord(), 'Tap a page to hear it');
      }

      /* narration pending is a build state, not a child's problem — but a
         grown-up scanning the shelf should be able to see it */
      var waiting = B.storiesWaiting();
      if (waiting) {
        U.append(host, U.el('p.empty', {
          text: waiting + (waiting === 1 ? ' story is' : ' stories are')
              + ' written but have no narration yet — run tools/make-story-pack.py to hear them.'
        }));
      }
    }
  };

  function tile(b) {
    var st = S.bookState(b.id), n = B.pagesOf(b).length;
    var meta;
    if (st.reads && st.finished) meta = '⭐ read ' + st.reads + '×';
    else if (st.page > 0) meta = '▶ page ' + Math.min(st.page + 1, n) + '/' + n;
    else meta = n + ' pages';

    var ico = U.el('span.book-ico', { text: b.icon, 'aria-hidden': 'true' });
    /* Art is a promise the build has to keep, but a missing webp must never
       take the tile with it: the emoji was the cover first, and stays the
       fallback if a phone is offline on a day the pictures never arrived. */
    var art = null;
    if (b.art) {
      art = U.el('img.book-art', { src: b.art, alt: b.en, loading: 'lazy' });
      art.addEventListener('error', function () { art.setAttribute('data-missing', '1'); });
      art.addEventListener('load', function () { t.classList.add('has-art'); });
    }

    var t = U.el('button.book-tile', {
      type: 'button', role: 'listitem', 'aria-label': b.en + ' — ' + b.ta,
      dataset: { id: b.id, story: b.story ? '1' : '0' }
    }, [
      art,
      ico,
      U.el('span.book-ta.tamil', { text: b.ta }),
      U.el('span.book-en', { text: b.en }),
      U.el('span.book-meta', { text: meta, dataset: { done: st.finished ? '1' : '0' } })
    ]);
    t.style.setProperty('--tint', b.color);
    t.addEventListener('click', function () { A.unlock(); A.sfx('tap'); go('book/' + b.id); });
    return t;
  }

  /* ---------------------------------------------------------------- reader */

  views.book = {
    render: function (host, route) {
      var b = B.get(route.a);
      if (!b) {
        U.append(host, U.el('p.empty', { text: 'No such book yet — tap Books to see the shelf.' }));
        return;
      }
      var pages = B.pagesOf(b);
      var total = pages.length;
      var idx = clampPage(parseInt(route.b, 10));
      var revealed = false, quizPicks = {}, endAwarded = false;
      var auto = false;

      function clampPage(i) {
        if (isNaN(i) || i < 0) i = 0;
        return Math.min(i, total - 1);
      }
      /* the URL stays at #/book/<id> while paging: a toddler swiping back
         should land on the shelf, not replay page 3 of a half-read book */

      /* ---- chrome */
      var dots = U.el('div.page-dots');
      for (var i = 0; i < total; i++) dots.appendChild(U.el('i.dot', { dataset: { i: String(i) } }));

      var autoBtn = U.el('button.icon-btn.reader-auto', { type: 'button', text: '▶▶', 'aria-label': 'Auto-play the pages', 'aria-pressed': 'false' });
      autoBtn.addEventListener('click', function () {
        auto = !auto;
        autoBtn.classList.toggle('on', auto);
        autoBtn.setAttribute('aria-pressed', String(auto));
        A.sfx('tap');
        if (auto) sayCurrent();
      });

      var title = U.el('div.reader-title', {}, [
        U.el('span.reader-ico', { text: b.icon, 'aria-hidden': 'true' }),
        U.el('span.reader-ta.tamil', { text: b.ta }),
        U.el('span.reader-en', { text: b.en })
      ]);

      var back = U.el('button.icon-btn', { type: 'button', text: '📚', 'aria-label': 'Back to the shelf' });
      back.addEventListener('click', function () { A.sfx('tap'); A.cancel(); go('library'); });

      host.appendChild(U.el('div.reader-top', {}, [back, title, autoBtn]));
      host.appendChild(dots);

      var stage = U.el('div.book-stage', { role: 'group', 'aria-label': b.en });
      host.appendChild(stage);

      /* A page's picture is named by its number, so a book either has its art
         or does not. One 404 for a book switches the rest of that book's pages
         off — a shelf whose pictures never arrived should stop asking rather
         than fire eighty-six failing requests every read-through. The Tamil
         line is the page; the picture is along for the ride. */
      var artDead = {};
      function pageArt(p, cls) {
        if (!p.art || artDead[b.id]) return null;
        var im = U.el('img.' + cls, { src: p.art, alt: p.en || b.en, loading: 'lazy' });
        im.addEventListener('error', function () {
          artDead[b.id] = true;
          if (im.parentNode) im.parentNode.removeChild(im);
        });
        return im;
      }

      var prev = U.el('button.btn.btn-round', { type: 'button', text: '◀', 'aria-label': 'Previous page' });
      var replay = U.el('button.btn.btn-round', { type: 'button', text: '🔉', 'aria-label': 'Say it again' });
      var next = U.el('button.btn.btn-round.next', { type: 'button', text: '▶', 'aria-label': 'Next page' });
      prev.addEventListener('click', function () { turn(-1); });
      next.addEventListener('click', function () { turn(1); });
      replay.addEventListener('click', function () { A.sfx('tap'); sayCurrent(); });
      host.appendChild(U.el('div.reader-nav', {}, [prev, replay, next]));

      function turn(d) {
        var to = idx + d;
        if (to < 0) { A.sfx('tap'); return; }
        if (to >= total) { A.sfx('tap'); return; }
        A.sfx('flip');
        idx = to; revealed = false;
        paint();
      }

      /* one place decides what a page sounds like, so ▶▶ and 🔉 agree */
      function sayCurrent() {
        var p = pages[idx];
        if (!p) return;
        if (p.k === 'word') { var w = B.word(p.w); if (w) speak(w, p.hide && !revealed); }
        else if (p.k === 'count') speakCount(p);
        else if (p.k === 'quiz') speakQuiz(p);
        else if (p.k === 'line') speakLine(p);
        else if (p.k === 'moral') speakLine(p);
        else if (p.k === 'cover') { A.sfx('ding'); }
      }

      function speak(w, silent) {
        if (silent) return;
        S.markSeen(w.id);
        A.sayWord(w, { onend: function () { if (auto) later(); } });
      }

      function later() { setTimeout(function () { if (auto && idx < total - 1) turn(1); }, 700); }

      function speakCount(p) {
        var num = B.word(p.num), item = B.word(p.item);
        if (!num || !item) return;
        S.markSeen(num.id);
        A.sayWord(num, { onend: function () { setTimeout(function () { A.sayWord(item, { onend: function () { if (auto) later(); } }); }, 200); } });
      }

      function speakQuiz(p) {
        var t = B.word(p.w);
        if (!t) return;
        A.sayWord(t, { onend: function () { if (auto) later(); } });
      }

      function speakLine(p) {
        A.playClip(p.clip, { dur: p.dur, onend: function () { if (auto) later(); } });
      }

      /* ---- pages */
      function paint() {
        A.cancel();
        U.clear(stage);
        var p = pages[idx];
        U.qsa('.page-dots .dot', host).forEach(function (d, i) { d.classList.toggle('on', i === idx); });
        prev.disabled = (idx === 0);
        next.disabled = (idx >= total - 1);
        S.markBookPage(b.id, idx);

        if (p.k === 'cover') return pageCover(p);
        if (p.k === 'end') return pageEnd(p);
        if (p.k === 'word') return pageWord(p);
        if (p.k === 'count') return pageCount(p);
        if (p.k === 'quiz') return pageQuiz(p);
        if (p.k === 'line') return pageLine(p);
        if (p.k === 'moral') return pageMoral(p);
        pageWord(p);
      }

      function pageCover() {
        var art = b.art ? U.el('img.cover-art', { src: b.art, alt: b.en }) : null;
        if (art) art.addEventListener('error', function () { art.parentNode.removeChild(art); });
        var c = U.el('div.book-cover', {}, [
          art,
          U.el('div.cover-ico', { text: b.icon, 'aria-hidden': 'true' }),
          U.el('div.cover-ta.tamil', { text: b.ta }),
          U.el('div.cover-en', { text: b.en }),
          U.el('button.btn.btn-go', { type: 'button', text: '▶ ' + b.pages.length })
        ]);
        c.addEventListener('click', function () { A.sfx('pop'); turn(1); });
        stage.appendChild(c);
      }

      function pageWord(p) {
        var w = B.word(p.w);
        if (!w) return turn(1);
        if (p.hide && !revealed) {
          var q = U.el('div.book-peek', {}, [
            U.el('div.peek-ico', { text: '🌿', 'aria-hidden': 'true' }),
            U.el('div.peek-q', { text: '❓' }),
            U.el('button.btn.btn-go', { type: 'button', text: 'என்ன மறைச்சிருக்கு?' })
          ]);
          q.addEventListener('click', function () {
            revealed = true;
            A.unlock(); A.sfx('pop');
            TT.confetti.atEl(q, { count: 14 });
            paint();
          });
          stage.appendChild(q);
          return;
        }
        stage.appendChild(UI.cardEl(w, { size: 'big' }));
        speak(w, false);
      }

      function pageCount(p) {
        var num = B.word(p.num), item = B.word(p.item);
        if (!num || !item) return turn(1);
        var row = U.el('div.count-row');
        for (var i = 0; i < p.n; i++) row.appendChild(UI.miniCard(item));
        var box = U.el('div.book-count', {}, [
          U.el('div.count-num', { text: String(p.n) }),
          U.el('div.count-ta.tamil', { text: num.ta }),
          U.el('div.count-en', { text: num.en }),
          row
        ]);
        box.addEventListener('click', function () { A.sfx('tap'); speakCount(p); });
        stage.appendChild(box);
        speakCount(p);
      }

      function pageQuiz(p) {
        var t = B.word(p.w);
        if (!t) return turn(1);
        if (!quizPicks[idx]) {
          var pool = D.catWords(p.cat || p.w.split('/')[0]).filter(function (w) { return w.id !== t.id; });
          quizPicks[idx] = D.shuffle(pool).slice(0, 2).concat([t]);
          quizPicks[idx] = D.shuffle(quizPicks[idx]);
        }
        var done = false;
        var row = U.el('div.quiz-row');
        quizPicks[idx].forEach(function (w) {
          var c = UI.miniCard(w, function () {
            if (done) return;
            if (w.id === t.id) {
              done = true;
              S.markSeen(t.id); S.markAnswer(t.id, true);
              A.sfx('correct');
              TT.confetti.atEl(row, { count: 20 });
              A.sayWord(t);
              setTimeout(function () { if (auto) turn(1); }, 1200);
            } else {
              /* a guessed-wrong card is a missed recall of the word you were
                 asked for — it belongs in the review box, not just a shake */
              S.markAnswer(t.id, false);
              A.sfx('wrong');
              A.cancel();
              U.qsa('.mini', row).forEach(function (n) { n.classList.remove('nope'); });
              c.classList.add('nope');
              setTimeout(function () { c.classList.remove('nope'); }, 500);
            }
          });
          row.appendChild(c);
        });
        var box = U.el('div.book-quiz', {}, [
          U.el('div.quiz-hint', { text: '🔉' }),
          U.el('div.quiz-q', { text: 'Which one did you hear?' }),
          row
        ]);
        box.querySelector('.quiz-hint').addEventListener('click', function () { A.sfx('tap'); speakQuiz(p); });
        stage.appendChild(box);
        speakQuiz(p);
      }

      function pageLine(p) {
        var box = U.el('div.book-line', {}, [
          pageArt(p, 'line-art'),
          U.el('div.line-ta.tamil', { text: p.ta }),
          p.en ? U.el('div.line-en', { text: p.en }) : null
        ]);
        box.addEventListener('click', function () { A.sfx('tap'); speakLine(p); });
        stage.appendChild(box);
        speakLine(p);
      }

      function pageMoral(p) {
        /* the last page of a story is the grown-up sentence the child is left
           with — set it apart from a story line so it reads as the takeaway */
        var box = U.el('div.book-moral', {}, [
          pageArt(p, 'moral-art'),
          U.el('div.moral-mark', { text: '💡', 'aria-hidden': 'true' }),
          U.el('div.moral-ta.tamil', { text: p.ta }),
          p.ro && S.settings.showRoman ? U.el('div.moral-ro', { text: p.ro }) : null,
          p.en ? U.el('div.moral-en', { text: p.en }) : null
        ]);
        box.addEventListener('click', function () { A.sfx('tap'); speakLine(p); });
        stage.appendChild(box);
        speakLine(p);
      }

      function pageEnd(p) {
        var award = endAwarded ? { firstTime: false } : (endAwarded = true, S.finishBook(b.id));
        var word = B.word(B.firstWord(b));
        /* a word-book pays out a sticker, so it may say so. A story has no
           single word to pin a sticker to — never promise a star the code
           has no intention of delivering */
        var line = !award.firstTime
          ? b.en + ' — read ' + S.bookState(b.id).reads + '×. Again?'
          : (word ? 'That’s a new ⭐ for ' + word.en + '.' : 'The end! Shall we read it again?');
        var box = U.el('div.book-end', {}, [
          U.el('div.end-ico', { text: '🎉', 'aria-hidden': 'true' }),
          U.el('div.end-ta.tamil', { text: b.story
            ? 'நல்லா கதை கேட்டேன். மறுபடி படிப்போமா!'
            : 'நல்லா விளையாடின. மறுபடி விளையாடுவோமா!' }),
          U.el('div.en', { text: line }),
          U.el('div.end-cta', {}, [
            UI.bigButton('மீண்டும்', { icon: '🔁', ta: 'மீண்டும்', color: b.color }, function () {
              idx = 0; revealed = false; quizPicks = {}; endAwarded = false; paint();
            }),
            UI.bigButton('Stars', { icon: '⭐', ta: 'நட்சத்திரம்', color: '#f59e0b' }, function () {
              go('stickers');
            })
          ])
        ]);
        stage.appendChild(box);
        A.sfx('applause');
        TT.confetti.rain();
      }

      /* keyboard: ← → and space, the way the deck already behaves */
      function onKey(e) {
        if (e.key === 'ArrowRight') { turn(1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { turn(-1); e.preventDefault(); }
        else if (e.key === ' ' || e.key === 'Enter') { sayCurrent(); e.preventDefault(); }
      }
      document.addEventListener('keydown', onKey);
      this.onLeave = function () { document.removeEventListener('keydown', onKey); A.cancel(); };

      paint();
    }
  };
})(window.TT = window.TT || {});
