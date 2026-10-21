/* Flashcards: one big card at a time, swipe or tap the arrows, spoken aloud. */
(function (TT) {
  'use strict';
  var U = TT.util, A = TT.audio, D = TT.data, S = TT.store, UI = TT.ui;

  var praiseTa = ['சூப்பர்!', 'ரொம்ப நல்லா!', 'மெல்ல மெல்ல!', 'அருமை!', 'நல்லா படிக்கிற'];

  TT.views.cards = {
    render: function (host, route) {
      var cat = route.a && route.a !== 'all' ? D.getCat(route.a) : null;
      var deck = cat ? D.catWords(cat.key) : D.allWords();
      if (S.settings.shuffle !== false) deck = D.shuffle(deck);
      if (!deck.length) { U.append(host, UI.empty('No words here yet')); return; }

      S.settings.lastCategory = cat ? cat.key : null; S.save();
      var color = cat ? cat.color : '#7c3aed';
      var i = 0, starsThisRun = 0, autoplayTimer = null, done = false;

      var bar = U.el('div.deck-bar', {}, [
        U.el('button.icon-btn', { type: 'button', 'aria-label': 'Back to topic', text: '☰' }),
        U.el('div.deck-meta', {}, [
          U.el('span.deck-cat', { text: cat ? cat.ta : 'அனைத்தும்' }),
          U.el('span.deck-count', { text: '1 / ' + deck.length })
        ]),
        U.el('div.deck-progress', {}, U.el('div.deck-progress-fill', { style: 'width:0%;background:' + color })),
        U.el('button.icon-btn.deck-again', { type: 'button', 'aria-label': 'Say it again', text: '🔊' })
      ]);
      bar.children[0].addEventListener('click', function () { A.sfx('tap'); go(cat ? 'cat/' + cat.key : 'learn'); });
      bar.querySelector('.deck-again').addEventListener('click', function () {
        A.cancel(); stopAutoplay(); A.sayWord(deck[i]); A.sfx('pop');
      });

      var stage = U.el('div.deck-stage', { style: '--cat:' + color });
      var ring = U.el('div.autoplay-ring', { 'aria-hidden': 'true' });

      var nav = U.el('div.deck-nav', {}, [
        U.el('button.nav-arrow.prev', { type: 'button', 'aria-label': 'Previous word' }, [U.el('span', { text: '◀' })]),
        U.el('button.nav-hint', { type: 'button', 'aria-label': 'Tap the card to hear the word' }, [U.el('span', { text: '👆' }), U.el('small', { text: 'tap the picture' })]),
        U.el('button.nav-arrow.next', { type: 'button', 'aria-label': 'Next word' }, [U.el('span', { text: '▶' })])
      ]);
      nav.querySelector('.prev').addEventListener('click', function () { step(-1); });
      nav.querySelector('.next').addEventListener('click', function () { step(1); });
      nav.querySelector('.nav-hint').addEventListener('click', function () { A.cancel(); A.sayWord(deck[i]); });

      U.append(host, [bar, stage, nav]);

      function paint() {
        var w = deck[i];
        U.clear(stage);
        stage.appendChild(ring);
        var card = UI.cardEl(w, {
          size: 'big',
          onEnd: function () { if (S.settings.autoplay) startAutoplay(); },
          onTap: function () { stopAutoplay(); }
        });
        stage.appendChild(card);
        bar.querySelector('.deck-count').textContent = (i + 1) + ' / ' + deck.length;
        bar.querySelector('.deck-progress-fill').style.width = Math.round(((i + 1) / deck.length) * 100) + '%';
        S.markSeen(w.id);
        A.cancel();
        /* speak automatically — a toddler taps what they can see, hearing is the reward */
        setTimeout(function () {
          A.sayWord(w, { onend: function () { if (S.settings.autoplay) startAutoplay(); } });
        }, 180);
      }

      function step(dir) {
        if (done) return;
        stopAutoplay();
        A.cancel();
        var n = i + dir;
        if (n < 0) { n = 0; U.haptic(30); return; }
        if (n >= deck.length) { finish(); return; }
        i = n;
        animateOut(dir);
      }

      function animateOut(dir) {
        var card = stage.querySelector('.card');
        if (!card || S.settings.reduceMotion) { paint(); return; }
        card.classList.add(dir > 0 ? 'fly-left' : 'fly-right');
        A.sfx('whoosh');
        setTimeout(paint, 190);
      }

      function finish() {
        done = true;
        stopAutoplay();
        U.clear(stage); U.clear(nav);
        var panel = U.el('div.deck-done', {}, [
          U.el('div.done-emoji', { text: '🎉' }),
          U.el('h2.tamil', { text: 'மெல்ல மெல்ல!' }),
          U.el('p', { text: 'You finished all ' + deck.length + ' words' + (starsThisRun ? ' and won ' + starsThisRun + ' ⭐' : '') }),
          U.el('div.done-actions', {}, [
            UI.bigButton('Play again', { icon: '🔁', color: color }, function () { done = false; i = 0; U.append(host, navBarClone()); renderNav(); paint(); }),
            UI.bigButton('Games', { icon: '🎲', color: '#7c3aed' }, function () { go('play/' + (cat ? cat.key : 'all')); }),
            UI.bigButton('Topics', { icon: '📚', color: '#0ea5e9' }, function () { go('learn'); })
          ])
        ]);
        stage.appendChild(panel);
        U.clear(nav);
        A.sfx('applause');
        A.speakText('அருமை! ரொம்ப நல்லா படிக்கிற.', { lang: 'ta', roman: 'Arumai! Romba nalla padikkira.' });
        TT.confetti.rain({ count: 70 });
      }

      function renderNav() {
        U.clear(nav);
        var p = U.el('button.nav-arrow.prev', { type: 'button', 'aria-label': 'Previous word' }, [U.el('span', { text: '◀' })]);
        var h = U.el('button.nav-hint', { type: 'button' }, [U.el('span', { text: '👆' }), U.el('small', { text: 'tap the picture' })]);
        var nx = U.el('button.nav-arrow.next', { type: 'button', 'aria-label': 'Next word' }, [U.el('span', { text: '▶' })]);
        p.addEventListener('click', function () { step(-1); });
        nx.addEventListener('click', function () { step(1); });
        h.addEventListener('click', function () { A.cancel(); A.sayWord(deck[i]); });
        U.append(nav, [p, h, nx]);
      }
      function navBarClone() { return null; }

      /* ---- star every 5 cards ---- */
      var seenInRun = 0;
      var origPaint = paint;
      paint = function () {
        origPaint();
        seenInRun++;
        if (S.settings.rewardStars !== false && seenInRun % 5 === 0) {
          starsThisRun++;
          S.addSticker(deck[i].id, deck[i].cat);
          TT.confetti.burst(window.innerWidth / 2, window.innerHeight * 0.42, { count: 30 });
          A.sfx('sparkle');
          UI.toast('⭐ Star for you!');
          TT.app.repaintSound && 0;
          var badge = document.getElementById('star-count'); if (badge) badge.textContent = S.progress.stickers.length;
        }
      };

      /* ---- swipe ----
         NB: we only take pointer capture once the finger has actually moved.
         Capturing on pointerdown would retarget the click to the stage and the
         card would never hear the tap — no word, no sound, no flip. */
      var drag = { active: false, moved: false, x0: 0, y0: 0, dx: 0, node: null, id: null };
      stage.addEventListener('pointerdown', function (e) {
        if (done) return;
        if (e.isPrimary === false || (e.button != null && e.button !== 0)) return;
        var card = stage.querySelector('.card');
        if (!card) return;
        drag.active = true; drag.moved = false; drag.x0 = e.clientX; drag.y0 = e.clientY;
        drag.dx = 0; drag.node = card; drag.id = e.pointerId;
      });
      stage.addEventListener('pointermove', function (e) {
        if (!drag.active || !drag.node) return;
        drag.dx = e.clientX - drag.x0;
        if (!drag.moved) {
          if (Math.abs(drag.dx) < 8 && Math.abs(e.clientY - drag.y0) < 8) return;
          if (Math.abs(drag.dx) < 8) return;              /* vertical scroll wins */
          drag.moved = true;
          try { stage.setPointerCapture(drag.id); } catch (err) { /* ignore */ }
        }
        drag.node.style.transform = 'translateX(' + drag.dx * 0.85 + 'px) rotate(' + (drag.dx / 30) + 'deg)';
        drag.node.style.transition = 'none';
      });
      function endDrag(e) {
        if (!drag.active) return;
        drag.active = false;
        var card = drag.node, moved = drag.moved, dx = drag.dx;
        drag.node = null; drag.moved = false; drag.dx = 0;
        if (!card) return;
        try { if (moved && stage.hasPointerCapture && stage.hasPointerCapture(drag.id)) stage.releasePointerCapture(drag.id); } catch (err) { /* ignore */ }
        card.style.transition = '';
        if (moved && Math.abs(dx) > 70) { card.style.transform = ''; step(dx < 0 ? 1 : -1); }
        else if (moved) card.style.transform = '';
      }
      stage.addEventListener('pointerup', endDrag);
      stage.addEventListener('pointercancel', endDrag);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);

      /* ---- keyboard ---- */
      function onKey(e) {
        if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
        else if (e.key === ' ' || e.key === 'Enter') { A.cancel(); A.sayWord(deck[i]); e.preventDefault(); }
      }
      window.addEventListener('keydown', onKey);

      /* ---- autoplay ---- */
      function startAutoplay() {
        stopAutoplay();
        if (!S.settings.autoplay || done) return;
        var secs = U.clamp(S.settings.autoplaySec || 9, 3, 40);
        ring.classList.add('on');
        ring.style.animation = 'none'; void ring.offsetWidth;
        ring.style.animation = 'ring ' + secs + 's linear forwards';
        autoplayTimer = setTimeout(function () { step(1); }, secs * 1000);
      }
      function stopAutoplay() {
        clearTimeout(autoplayTimer); autoplayTimer = null;
        ring.classList.remove('on');
      }

      this.onLeave = function () {
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('pointerup', endDrag);
        window.removeEventListener('pointercancel', endDrag);
        stopAutoplay();
        A.cancel();
      };

      paint();
    }
  };

  function go(p) { TT.app.go(p); }
})(window.TT = window.TT || {});
