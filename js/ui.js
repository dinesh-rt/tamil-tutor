/* Shared building blocks: cards, tiles, sheets, toasts. */
(function (TT) {
  'use strict';
  var U = TT.util, A = TT.audio, D = TT.data;

  /* --------------------------------------------------------------- pictures */

  function pictureHTML(word, cls) {
    var svg = TT.spriteFor(word.img);
    var inner = svg;
    if (!inner) {
      var n = Math.max(1, Math.min(10, word.q || 1));
      var bits = [];
      for (var i = 0; i < n; i++) bits.push('<span class="emoji">' + U.esc(word.img) + '</span>');
      inner = n > 1 ? '<span class="emoji-grid n-' + n + '">' + bits.join('') + '</span>' : bits[0];
    }
    var sym = word.sym ? '<span class="sym-badge">' + U.esc(word.sym) + '</span>' : '';
    /* Only verbs (and a few always-moving things) carry an `mo` animation.
       Everything else is a still picture — calmer to look at for a toddler. */
    return '<span class="pic ' + (word.mo ? 'mo-' + U.esc(word.mo) : 'mo-still') + ' ' + (cls || '') + '">' + sym + inner + '</span>';
  }

  /* ------------------------------------------------------------------ cards */

  /**
   * The flash card. opts:
   *   size      'big' (one at a time) | 'tile'
   *   flip      show Tamil side only after a tap
   *   speak     speak on tap (default true)
   *   onTap     extra tap handler
   *   showSay   show the grown-up phrase chip
   */
  function cardEl(word, opts) {
    opts = opts || {};
    var s = TT.store.settings;
    var mode = opts.mode || s.mode || 'bilingual';
    var flip = opts.flip != null ? opts.flip : (s.reveal === 'flip' && opts.size === 'big');

    var words = document.createElement('div');
    words.className = 'card-words';
    if (mode !== 'english') {
      U.append(words, U.el('div.w-ta.tamil', { text: word.ta }));
      if (s.showRoman !== false) U.append(words, U.el('div.w-ro', { text: word.ro }));
    }
    if (mode !== 'tamil') U.append(words, U.el('div.w-en', { text: word.en }));
    if (opts.showSay !== false && s.showSay !== false && word.say && opts.size === 'big') {
      var say = U.el('button.chip.chip-say', { type: 'button', title: 'Hear the grown-up sentence' }, [
        U.el('span.chip-ico', { text: '💬' }), U.el('span.tamil', { text: word.say })
      ]);
      say.addEventListener('click', function (e) {
        e.stopPropagation();
        A.unlock(); A.cancel(); A.speakSentence(word);
        A.sfx('ding');
      });
      U.append(words, say);
    }

    var front = U.el('div.face.front', {}, [U.el('div.card-stage', {}, U.el('div.card-pic', { html: pictureHTML(word) }))]);
    var card;

    if (flip) {
      var back = U.el('div.face.back', {}, [
        U.el('div.card-stage', {}, [
          U.el('div.flip-words', {}, [
            mode !== 'english' ? U.el('div.w-ta.tamil.big-ta', { text: word.ta }) : null,
            s.showRoman !== false && mode !== 'english' ? U.el('div.w-ro', { text: word.ro }) : null,
            mode !== 'tamil' ? U.el('div.w-en' + (mode === 'english' ? ' tamil big-ta' : ''), { text: word.en }) : null
          ])
        ])
      ]);
      card = U.el('article.card.card-flip' + (opts.size === 'big' ? ' card-big' : ' card-tile'), {
        dataset: { id: word.id, cat: word.cat, side: 'front' }, tabindex: '0', role: 'button',
        'aria-label': word.en + ' — ' + word.ta
      }, [front, back]);
    } else {
      var body = U.el('div.card-body', {}, [
        U.el('div.card-stage', {}, U.el('div.card-pic', { html: pictureHTML(word) })),
        words
      ]);
      card = U.el('article.card' + (opts.size === 'big' ? ' card-big' : ' card-tile'), {
        dataset: { id: word.id, cat: word.cat }, tabindex: '0', role: 'button',
        'aria-label': word.en + ' — ' + word.ta
      }, body);
    }

    var lvl = TT.store.level(word.id);
    if (lvl > 0) U.append(card, U.el('span.level-dot', { dataset: { lvl: String(lvl) }, title: TT.store.LEVELS[lvl].en }));

    function tap(e) {
      if (e) e.preventDefault();
      A.unlock();
      TT.store.markSeen(word.id);
      if (flip) {
        var now = card.dataset.side === 'front' ? 'back' : 'front';
        card.dataset.side = now;
        A.sfx('flip');
      }
      if (opts.speak !== false) {
        A.cancel();
        A.sayWord(word, { onend: function () { if (opts.onEnd) opts.onEnd(); } });
      }
      if (opts.speak !== false) A.sfx(word.cat === 'animals' || word.cat === 'birds' || word.cat === 'bugs' || word.cat === 'sea' ? 'animal' : 'pop');
      U.haptic(14);
      card.classList.remove('tapped');
      void card.offsetWidth;
      card.classList.add('tapped');
      if (opts.onTap) opts.onTap(word, card);
    }
    card.addEventListener('click', tap);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(e); }
    });
    return card;
  }

  /** Small square button that speaks a word — used in the sticker book & grids. */
  function miniCard(word, onClick) {
    var m = TT.store.settings.mode;
    var node = U.el('button.mini', { type: 'button', dataset: { id: word.id }, 'aria-label': word.en }, [
      U.el('span.mini-pic', { html: pictureHTML(word) }),
      m !== 'english' ? U.el('span.mini-ta.tamil', { text: word.ta }) : null,
      m !== 'tamil' ? U.el('span.mini-en', { text: word.en }) : null
    ]);
    node.addEventListener('click', function () {
      A.unlock(); A.cancel(); A.sfx('pop'); A.sayWord(word);
      TT.store.markSeen(word.id);
      U.haptic(10);
      if (onClick) onClick(word, node);
    });
    return node;
  }

  /* ------------------------------------------------------------------ tiles */

  function catTile(cat, href, opts) {
    opts = opts || {};
    var total = cat.words.length;
    var seen = 0;
    cat.words.forEach(function (w) { if (TT.store.level(w.id) > 0) seen++; });
    var pct = total ? Math.round((seen / total) * 100) : 0;
    var node = U.el('a.tile', {
      href: href, dataset: { cat: cat.key },
      style: '--cat:' + cat.color + ';--cat2:' + (cat.color2 || shade(cat.color, 18)),
      'aria-label': cat.en + ' ' + cat.ta
    }, [
      U.el('span.tile-icon', { text: cat.icon }),
      U.el('span.tile-ta.tamil', { text: cat.ta }),
      U.el('span.tile-en', { text: cat.en }),
      U.el('span.tile-count', { text: total + ' words' }),
      U.el('span.tile-bar', {}, U.el('span.tile-bar-fill', { style: 'width:' + pct + '%' }))
    ]);
    node.addEventListener('click', function () { A.unlock(); A.sfx('tap'); });
    return node;
  }

  function shade(hex, amt) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return hex;
    var r = Math.min(255, parseInt(m[1], 16) + amt), g = Math.min(255, parseInt(m[2], 16) + amt), b = Math.min(255, parseInt(m[3], 16) + amt);
    return '#' + [r, g, b].map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
  }

  /* ----------------------------------------------------------------- chrome */

  function bigButton(label, opts, onclick) {
    opts = opts || {};
    var b = U.el('button.big-btn', {
      type: 'button',
      style: opts.color ? '--cat:' + opts.color : null,
      'aria-label': opts.aria || label
    }, [
      opts.icon ? U.el('span.big-btn-ico', { text: opts.icon }) : null,
      U.el('span.big-btn-label', {}, [
        U.el('span', { text: label }),
        opts.ta ? U.el('span.tamil.big-btn-ta', { text: opts.ta }) : null
      ]),
      opts.sub ? U.el('span.big-btn-sub', { text: opts.sub }) : null
    ]);
    b.addEventListener('click', function () { A.unlock(); A.sfx('tap'); onclick && onclick(); });
    return b;
  }

  var scrimCount = 0;
  function sheet(title, contentNode, opts) {
    opts = opts || {};
    var root = document.getElementById('sheet-root');
    var scrim = U.el('div.scrim');
    var box = U.el('div.sheet', { role: 'dialog', 'aria-modal': 'true', 'aria-label': title, tabindex: '-1' });
    var head = U.el('header.sheet-head', {}, [
      U.el('h2.sheet-title', { text: title }),
      U.el('button.icon-btn.sheet-close', { type: 'button', 'aria-label': 'Close', text: '✕' })
    ]);
    head.querySelector('.sheet-close').addEventListener('click', close);
    U.append(box, [head, U.el('div.sheet-body', {}, contentNode)]);
    if (opts.footer) U.append(box, U.el('footer.sheet-foot', {}, opts.footer));
    U.append(root, [scrim, box]);
    requestAnimationFrame(function () { scrim.classList.add('in'); box.classList.add('in'); });
    scrimCount++;
    document.body.classList.add('sheet-open');
    head.querySelector('.sheet-close').focus();

    function close() {
      if (!scrim.parentNode) return;
      scrim.classList.remove('in'); box.classList.remove('in');
      setTimeout(function () {
        if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
        if (box.parentNode) box.parentNode.removeChild(box);
      }, 180);
      scrimCount--;
      if (scrimCount <= 0) document.body.classList.remove('sheet-open');
      if (opts.onClose) opts.onClose();
    }
    scrim.addEventListener('click', close);
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    return { close: close, node: box };
  }

  var toastTimer;
  function toast(msg, opts) {
    opts = opts || {};
    var t = document.getElementById('toast');
    if (!t) { t = U.el('div#toast.toast', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('in');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('in'); }, opts.ms || 1800);
  }

  function sectionHead(ta, en, extra) {
    return U.el('div.section-head', {}, [
      U.el('h2.section-ta.tamil', { text: ta }),
      U.el('p.section-en', { text: en }),
      extra || null
    ]);
  }

  function empty(msg) { return U.el('p.empty', { text: msg || 'Nothing here yet — play a little!' }); }

  TT.ui = {
    pictureHTML: pictureHTML,
    cardEl: cardEl,
    miniCard: miniCard,
    catTile: catTile,
    bigButton: bigButton,
    sheet: sheet,
    toast: toast,
    sectionHead: sectionHead,
    empty: empty,
    shade: shade
  };
})(window.TT = window.TT || {});
