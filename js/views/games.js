/* Four games: Listen & Pick, Peek-a-boo, Find-them-all, Say it in English. */
(function (TT) {
  'use strict';
  var U = TT.util, A = TT.audio, D = TT.data, S = TT.store, UI = TT.ui;
  var views = TT.views;

  var praise = ['சூப்பர்!', 'அருமை!', 'ரொம்ப நல்லா!', 'மெல்ல மெல்ல!', 'ஆமா, அதுதான்!'];

  function sayPraise() {
    var p = U.pickOne(praise);
    A.speakText(p, { lang: 'ta', roman: 'Super!' });
  }

  function gameHeader(title, cat) {
    return U.el('div.game-head', { style: cat ? '--cat:' + cat.color : null }, [
      U.el('button.icon-btn', { type: 'button', 'aria-label': 'Back to games', text: '←' }),
      U.el('h1.game-title', {}, [U.el('span.game-title-en', { text: title }), cat ? U.el('span.game-title-ta.tamil', { text: cat.ta }) : null]),
      U.el('div.game-score', { text: '⭐ 0' })
    ]);
  }

  /* ------------------------------------------------------- topic → game menu */

  views.play = {
    render: function (host, route) {
      if (!route.a) return renderTopics(host);
      if (route.a === 'today') return games.today(host);          // #/play/today — spaced repetition
      var cat = D.getCat(route.a);
      if (!cat) return renderTopics(host);
      if (route.b) return runGame(host, route.b, cat);

      S.settings.lastCategory = cat.key; S.save();
      host.appendChild(UI.sectionHead(cat.ta + ' — விளையாடு', cat.en + ' — choose a game'));
      var wrap = U.el('div.game-menu', {});
      [
        { g: 'listen', icon: '👂', ta: 'கேட்டு சொடுக்கு', en: 'Listen & pick', sub: 'Hear the word, tap the picture' },
        { g: 'peek', icon: '🙈', ta: 'மறைச்சிருக்கு', en: 'Peek-a-boo', sub: 'Lift the leaf, find the word' },
        { g: 'find', icon: '🔎', ta: 'எல்லாம் தேடு', en: 'Find them all', sub: 'Tap every picture from this topic' },
        { g: 'english', icon: '🔤', ta: 'ஆங்கிலத்தில் சொல்', en: 'Say it in English', sub: 'Hear the Tamil, say the English word' }
      ].forEach(function (x) {
        wrap.appendChild(UI.bigButton(x.en, { icon: x.icon, ta: x.ta, sub: x.sub, color: cat.color }, function () {
          TT.app.go('play/' + cat.key + '/' + x.g);
        }));
      });
      host.appendChild(wrap);

      if (S.reviewQueue(cat.key, 3).length) {
        host.appendChild(U.el('div.game-menu', {}, [
          UI.bigButton('Practice these', { icon: '🔁', ta: 'மீண்டும்', sub: 'Words that need help', color: '#e11d48' }, function () {
            TT.app.go('play/' + cat.key + '/review');
          })
        ]));
      }
    }
  };

  function renderTopics(host) {
    host.appendChild(UI.sectionHead('எந்த(topic) விளையாடுவோம்?', 'Which topic should we play with?'));
    var wrap = U.el('div.tile-grid', {});
    D.allCategories().forEach(function (c) {
      var t = UI.catTile(c, '#/play/' + c.key);
      t.classList.add('tile-game');
      wrap.appendChild(t);
    });
    host.appendChild(wrap);
  }

  function runGame(host, name, cat) {
    var f = games[name] || games.listen;
    f(host, cat);
  }

  var games = {};

  /* ------------------------------------------------------- 1 · Listen & Pick */

  games.listen = function (host, cat) {
    var pool = cat ? D.catWords(cat.key) : D.allWords();
    if (pool.length < 2) pool = D.allWords();
    var score = 0, streak = 0, round = 0, ROUNDS = 8, locked = false, current = null, cleanup = [];

    var head = gameHeader('Listen & pick', cat);
    var scoreEl = head.querySelector('.game-score');
    head.children[0].addEventListener('click', function () { A.sfx('tap'); TT.app.go('play/' + (cat ? cat.key : '')); });
    host.appendChild(head);

    var promptBar = U.el('div.game-prompt', {}, [
      U.el('button.replay-btn', { type: 'button', 'aria-label': 'Say it again' }, [U.el('span', { text: '🔊' })]),
      U.el('p.game-instruction', {}, [U.el('span.tamil', { text: 'கேளு…' }), U.el('span', { text: ' which one did you hear?' })])
    ]);
    host.appendChild(promptBar);

    var board = U.el('div.game-board', {});
    host.appendChild(board);

    promptBar.querySelector('.replay-btn').addEventListener('click', function () {
      if (!current) return;
      A.cancel(); A.sayWord(current);
      this.classList.remove('pulse'); void this.offsetWidth; this.classList.add('pulse');
    });

    function nextRound() {
      round++;
      if (round > ROUNDS) return endGame();
      locked = false;

      /* bias towards words the child hasn't mastered */
      var weighted = pool.map(function (w) {
        var l = S.level(w.id);
        return { w: w, s: (l === 0 ? 5 : l === 1 ? 4 : l === 2 ? 2 : 1) + Math.random() * 3 };
      }).sort(function (a, b) { return b.s - a.s; });
      current = weighted[0].w;

      var n = U.clamp(2 + Math.floor(streak / 3), 2, 4);
      var opts = [current];
      var others = D.shuffle(pool).filter(function (w) { return w.id !== current.id; });
      for (var i = 0; i < others.length && opts.length < n; i++) {
        if (!opts.some(function (o) { return o.img === others[i].img; })) opts.push(others[i]);
      }
      opts = D.shuffle(opts);

      U.clear(board);
      board.className = 'game-board n' + opts.length;
      var cards = {};
      opts.forEach(function (w) {
        var c = UI.cardEl(w, { size: 'tile', speak: false, showSay: false, flip: false });
        c.classList.add('choice');
        c.addEventListener('click', function () { choose(w, c); });
        cards[w.id] = c;
        board.appendChild(c);
      });

      setTimeout(function () {
        A.cancel();
        A.sayWord(current, { repeats: 2 });
      }, 450);
    }

    function choose(w, node) {
      if (locked) return;
      A.unlock();
      if (w.id === current.id) {
        locked = true;
        streak++; score++;
        scoreEl.textContent = '⭐ ' + score;
        S.markAnswer(current.id, true);
        node.classList.add('right');
        A.cancel(); A.sfx('correct');
        TT.confetti.atEl(node, { count: 34 });
        U.haptic([12, 40, 18]);
        setTimeout(function () {
          A.speakText(U.pickOne(praise), { lang: 'ta' });
          A.sayWord(current, { repeats: 1, onend: function () { setTimeout(nextRound, 500); } });
        }, 350);
        if (score % 4 === 0 && S.settings.rewardStars !== false) {
          S.addSticker(current.id, current.cat);
          UI.toast('⭐ Star for you!');
          var badge = document.getElementById('star-count'); if (badge) badge.textContent = S.progress.stickers.length;
        }
      } else {
        streak = 0;
        S.markAnswer(current.id, false);
        node.classList.remove('wrong'); void node.offsetWidth; node.classList.add('wrong');
        A.cancel(); A.sfx('wrong'); U.haptic(60);
        A.speakText('இன்னொரு தடவை கேட்கிறேன்', { lang: 'ta', roman: 'Inna thadavai ketkiren' });
        setTimeout(function () { A.sayWord(current, { repeats: 2 }); }, 900);
      }
    }

    function endGame() {
      U.clear(board);
      var panel = U.el('div.game-done', {}, [
        U.el('div.done-emoji', { text: score >= ROUNDS * 0.7 ? '🏆' : '🌟' }),
        U.el('h2.tamil', { text: 'நல்லா விளையாடின' }),
        U.el('p', { text: score + ' out of ' + ROUNDS + ' correct' }),
        U.el('div.done-actions', {}, [
          UI.bigButton('Again', { icon: '🔁', color: cat ? cat.color : '#7c3aed' }, function () { score = 0; streak = 0; round = 0; scoreEl.textContent = '⭐ 0'; nextRound(); }),
          UI.bigButton('Peek-a-boo', { icon: '🙈', color: '#0ea5e9' }, function () { TT.app.go('play/' + (cat ? cat.key : 'all') + '/peek'); }),
          UI.bigButton('Topics', { icon: '📚', color: '#16a34a' }, function () { TT.app.go('learn'); })
        ])
      ]);
      board.appendChild(panel);
      A.sfx('applause'); TT.confetti.rain({ count: 60 });
      A.speakText('நல்லா விளையாடின. மறுபடி விளையாடுவோமா!', { lang: 'ta', roman: 'Nalla vilaiyadina. Marubadi vilaiyaduroma!' });
    }

    views.play.onLeave = function () {
      cleanup.forEach(function (f) { f(); });
      A.cancel();
    };
    nextRound();
  };

  /* ------------------------------------------------------------ 2 · Peekaboo */

  games.peek = function (host, cat) {
    var pool = cat ? D.catWords(cat.key) : D.allWords();
    var score = 0;
    var head = gameHeader('Peek-a-boo', cat);
    head.children[0].addEventListener('click', function () { A.sfx('tap'); TT.app.go('play/' + (cat ? cat.key : '')); });
    host.appendChild(head);
    host.appendChild(U.el('div.game-prompt', {}, [
      U.el('span.replay-btn.static', { text: '🙈' }),
      U.el('p.game-instruction', {}, [U.el('span.tamil', { text: 'என்ன மறைச்சிருக்கு?' }), U.el('span', { text: ' tap the leaves to look' })])
    ]));

    var board = U.el('div.peek-board', {});
    host.appendChild(board);

    function deal() {
      U.clear(board);
      score = 0;
      var batch = D.shuffle(pool).slice(0, Math.min(6, pool.length));
      var opened = 0;
      batch.forEach(function (w) {
        var b = U.el('button.curtain', { type: 'button', 'aria-label': 'What is hiding here?' }, [
          U.el('span.curtain-leaf', { text: '🍃' }),
          U.el('span.curtain-peek', { html: UI.pictureHTML(w) })
        ]);
        b.addEventListener('click', function () {
          if (b.classList.contains('open')) { A.cancel(); A.sayWord(w); return; }
          b.classList.add('open');
          opened++;
          S.markSeen(w.id);
          A.unlock(); A.cancel(); A.sfx('pop');
          TT.confetti.burst(
            b.getBoundingClientRect().left + b.offsetWidth / 2,
            b.getBoundingClientRect().top + b.offsetHeight / 2, { count: 20 }
          );
          setTimeout(function () {
            A.sayWord(w, { onend: function () { if (opened === batch.length) celebrate(); } });
          }, 120);
        });
        board.appendChild(b);
      });
      setTimeout(function () {
        A.cancel();
        A.speakText('என்ன மறைச்சிருக்கு? பாப்போம்!', { lang: 'ta', roman: 'Enna marachirukku? Paappom!' });
      }, 300);
    }

    function celebrate() {
      A.sfx('applause');
      TT.confetti.rain({ count: 50 });
      var again = U.el('div.game-done.inline', {}, [
        U.el('p', { text: 'You found them all!' }),
        UI.bigButton('New ones', { icon: '🔁', color: cat ? cat.color : '#7c3aed' }, deal),
        UI.bigButton('Games', { icon: '🎲', color: '#7e22ce' }, function () { TT.app.go('play/' + (cat ? cat.key : '')); })
      ]);
      board.appendChild(again);
    }

    views.play.onLeave = function () { A.cancel(); };
    deal();
  };

  /* --------------------------------------------------------- 3 · Find them all */

  games.find = function (host, cat) {
    var targetCat = cat || null;
    var score = 0, round = 0;
    var head = gameHeader('Find them all', targetCat);
    head.children[0].addEventListener('click', function () { A.sfx('tap'); TT.app.go('play/' + (targetCat ? targetCat.key : '')); });
    host.appendChild(head);
    var prompt = U.el('div.game-prompt', {}, [
      U.el('button.replay-btn', { type: 'button', 'aria-label': 'Say the instruction again' }, [U.el('span', { text: '🔊' })]),
      U.el('p.game-instruction', {})
    ]);
    host.appendChild(prompt);
    var board = U.el('div.find-board', {});
    host.appendChild(board);

    function instruction(wantCat) {
      A.cancel();
      A.speakText(wantCat.ta + ' எல்லாத்தையும் சொடுக்கு', { lang: 'ta', roman: wantCat.en + ' — tap them all!' });
    }
    prompt.querySelector('.replay-btn').addEventListener('click', function () { if (board._want) instruction(board._want); });

    function nextRound() {
      round++;
      U.clear(board);
      var want = targetCat || D.pickOne(D.allCategories().filter(function (c) { return c.words.length >= 5; }));
      var others = D.allCategories().filter(function (c) { return c.key !== want.key; });
      var other = U.pickOne(others);
      board._want = want;

      var targets = D.shuffle(want.words).slice(0, 5);
      var dummies = D.shuffle(other.words).filter(function (w) {
        return !targets.some(function (t) { return t.img === w.img; });
      }).slice(0, 4);
      var tiles = D.shuffle(targets.concat(dummies));

      prompt.querySelector('.game-instruction').innerHTML = '';
      U.append(prompt.querySelector('.game-instruction'), [
        U.el('span.tamil', { text: want.ta }),
        U.el('span', { text: ' — tap all the ' + want.en.toLowerCase() })
      ]);

      var left = targets.length;
      tiles.forEach(function (w) {
        var c = UI.cardEl(w, { size: 'tile', speak: false, showSay: false, flip: false });
        c.classList.add('choice');
        c.addEventListener('click', function () {
          if (c.classList.contains('found')) { A.cancel(); A.sayWord(w); return; }
          if (targets.some(function (t) { return t.id === w.id; })) {
            c.classList.add('found');
            left--; score++;
            S.markAnswer(w.id, true);
            head.querySelector('.game-score').textContent = '⭐ ' + score;
            A.cancel(); A.sfx('ding'); A.sayWord(w, { repeats: 1 });
            TT.confetti.atEl(c, { count: 18 });
            if (left === 0) setTimeout(win, 600);
          } else {
            c.classList.remove('wrong'); void c.offsetWidth; c.classList.add('wrong');
            A.cancel(); A.sfx('wrong');
            A.speakText('அது ' + w.en + ' — ' + w.ta + '. ' + want.ta + ' தேடு', { lang: 'ta', roman: 'That is ' + w.en + '. Find the ' + want.en });
          }
        });
        board.appendChild(c);
      });

      setTimeout(function () { instruction(want); }, 400);
    }

    function win() {
      A.sfx('applause'); TT.confetti.rain({ count: 55 });
      A.speakText('எல்லாம் கண்டுபிடிச்சுட்ட. அருமை!', { lang: 'ta', roman: 'Nalla found! Arumai!' });
      if (S.settings.rewardStars !== false) { S.addSticker(null, targetCat ? targetCat.key : 'all'); }
      var badge = document.getElementById('star-count'); if (badge) badge.textContent = S.progress.stickers.length;
      U.clear(board);
      U.append(board, U.el('div.game-done', {}, [
        U.el('div.done-emoji', { text: '🎊' }),
        U.el('h2.tamil', { text: 'எல்லாம் கண்டுபிடிச்சுட்ட!' }),
        U.el('div.done-actions', {}, [
          UI.bigButton('More', { icon: '🔁', color: '#16a34a' }, nextRound),
          UI.bigButton('Games', { icon: '🎲', color: '#7e22ce' }, function () { TT.app.go('play/' + (targetCat ? targetCat.key : '')); })
        ])
      ]));
    }

    views.play.onLeave = function () { A.cancel(); };
    nextRound();
  };

  /* ------------------------------------------- Today's review (spaced repetition)
     Overdue words first — the ones got wrong lately and the ones in low boxes —
     plus a couple of brand-new words so the deck never feels like a chore. */
  games.today = function (host) {
    var words = S.todayWords ? S.todayWords(8) : S.reviewQueue(null, 8);
    if (!words || words.length < 2) {
      UI.toast('Nothing due today — play a game instead!');
      TT.app.go('play');
      return;
    }
    games.review(host, null, { words: words, title: "Today's review", back: 'home' });
  };

  /* ------------------------------------------- Say it in English (speaking) */
  /* Parent-mediated: the child hears the Tamil word, looks at the picture and
     says the English one. No grading — grown-up taps the star when it's said. */
  games.english = function (host, cat) {
    var pool = (cat ? D.catWords(cat.key) : D.allWords());
    if (!pool.length) pool = D.allWords();
    /* words that need the most help come first */
    var order = pool.slice().sort(function (a, b) {
      return (S.level(a.id) - S.level(b.id)) || (Math.random() - 0.5);
    });
    var TOTAL = 6, at = 0, round = 0, score = 0, current = null, answered = false;

    var head = gameHeader('Say it in English', cat);
    head.children[0].addEventListener('click', function () { A.sfx('tap'); TT.app.go('play/' + (cat ? cat.key : '')); });
    host.appendChild(head);
    var scoreEl = head.children[2];

    host.appendChild(U.el('div.game-prompt', {}, [
      U.el('button.replay-btn', { type: 'button', 'aria-label': 'Hear it again', text: '🔊' }),
      U.el('p.game-instruction', {}, [U.el('span.tamil', { text: 'ஆங்கிலத்தில் சொல்லு!' }), U.el('span', { text: ' hear it in Tamil, then say the English word' })])
    ]));
    host.querySelector('.replay-btn').addEventListener('click', function () {
      if (!current) return;
      A.unlock(); A.cancel(); A.sayWord(current, { only: 'ta', repeats: 1 });
    });

    var stage = U.el('div.card-stage.card-stage-solo', {}, U.el('div.card-pic', {}));
    host.appendChild(stage);
    var picBox = stage.querySelector('.card-pic');
    var answer = U.el('div.card-words.answer-row', {});
    host.appendChild(answer);
    var actions = U.el('div.game-menu', {});
    host.appendChild(actions);

    function askAgain() {
      if (!current) return;
      A.unlock(); A.cancel();
      A.sayWord(current, { only: 'ta', repeats: 1 });
    }

    function reveal() {
      if (!current) return;
      answered = true;
      U.clear(answer);
      U.append(answer, U.el('div.w-en.answer-word', { text: current.en }));
      if (S.settings.showRoman !== false) U.append(answer, U.el('div.w-ro', { text: current.ro }));
      A.unlock(); A.cancel();
      A.sayWord(current, { only: 'en', repeats: 1 });      // slow if the recording slider is down
      U.clear(actions);
      actions.appendChild(UI.bigButton('He said it!', { icon: '⭐', color: '#f59e0b', sub: 'tap for the star', }, gotIt));
      actions.appendChild(UI.bigButton('Next word', { icon: '➡️', color: cat ? cat.color : '#7c3aed', sub: 'skip this one' }, next));
    }

    function gotIt() {
      if (!current) return;
      score++;
      scoreEl.textContent = '⭐ ' + score;
      S.markAnswer(current.id, true);
      A.sfx('correct'); sayPraise();
      TT.confetti.burst(window.innerWidth / 2, window.innerHeight * 0.4, { count: 26 });
      if (S.settings.rewardStars !== false && score % 3 === 0) {
        S.addSticker(current.id, current.cat);
        var badge = document.getElementById('star-count');
        if (badge) badge.textContent = S.progress.stickers.length;
        TT.confetti.burst(window.innerWidth / 2, window.innerHeight * 0.3, { count: 34 });
        A.sfx('sparkle');
        UI.toast('⭐ Star for you!');
      }
      setTimeout(next, 700);
    }

    function next() {
      round++;
      if (round > TOTAL) return finish();
      answered = false;
      current = order[at % order.length]; at++;
      S.markSeen(current.id);
      U.clear(picBox); U.clear(answer); U.clear(actions);
      U.append(picBox, U.el('span.pic', { html: UI.pictureHTML(current) }));
      answer.appendChild(U.el('div.w-ro', { text: '🤫 the English word is hiding' }));
      actions.appendChild(UI.bigButton('Show the word', { icon: '👀', color: '#0ea5e9', sub: 'tap if you need a hint' }, reveal));
      actions.appendChild(UI.bigButton('He said it!', { icon: '⭐', color: '#f59e0b', sub: 'tap for the star' }, gotIt));
      setTimeout(askAgain, 350);
    }

    function finish() {
      U.clear(actions);
      A.cancel(); A.sfx('applause'); TT.confetti.rain({ count: 50 });
      actions.appendChild(U.el('div.game-done.inline', {}, [
        U.el('p', { text: 'You said ' + score + ' of ' + TOTAL + ' words in English!' }),
        UI.bigButton('Again', { icon: '🔁', color: cat ? cat.color : '#7c3aed' }, function () {
          score = 0; round = 0; at = 0; scoreEl.textContent = '⭐ 0';
          order = D.shuffle(pool.slice()); next();
        }),
        UI.bigButton('Games', { icon: '🎲', color: '#7e22ce' }, function () { TT.app.go('play/' + (cat ? cat.key : '')); })
      ]));
    }

    views.play.onLeave = function () { A.cancel(); };
    next();
  };

  /* review mode = Listen & Pick over the words that need help */
  games.review = function (host, cat, opts) {
    opts = opts || {};
    var q = opts.words || S.reviewQueue(cat ? cat.key : null, 10);
    if (q.length < 2) { UI.toast('Nothing to practise — well done!'); TT.app.go(opts.back || ('play/' + (cat ? cat.key : ''))); return; }
    var score = 0, streak = 0, round = 0, ROUNDS = Math.min(8, q.length), locked = false, current = null;
    var head = gameHeader(opts.title || 'Practise', cat);
    head.children[0].addEventListener('click', function () { A.sfx('tap'); TT.app.go(opts.back || ('play/' + (cat ? cat.key : ''))); });
    host.appendChild(head);
    var promptBar = U.el('div.game-prompt', {}, [
      U.el('button.replay-btn', { type: 'button' }, [U.el('span', { text: '🔊' })]),
      U.el('p.game-instruction', {}, [U.el('span.tamil', { text: 'இது நமக்கு கஷ்டம் —' }), U.el('span', { text: ' listen and tap it' })])
    ]);
    host.appendChild(promptBar);
    var board = U.el('div.game-board', {});
    host.appendChild(board);
    promptBar.querySelector('.replay-btn').addEventListener('click', function () { if (current) { A.cancel(); A.sayWord(current); } });

    (function next() {
      round++;
      if (round > ROUNDS) {
        U.clear(board);
        U.append(board, U.el('div.game-done', {}, [
          U.el('div.done-emoji', { text: '💪' }),
          U.el('p', { text: score + ' / ' + ROUNDS + ' right' }),
          UI.bigButton('Back to games', { icon: '🎲', color: '#e11d48' }, function () { TT.app.go('play/' + (cat ? cat.key : '')); })
        ]));
        A.sfx('applause');
        return;
      }
      locked = false;
      current = q[(round - 1) % q.length];
      var others = D.shuffle(D.catWords(current.cat).concat(D.allWords())).filter(function (w) { return w.id !== current.id && w.img !== current.img; });
      var opts = D.shuffle([current].concat(others.slice(0, U.clamp(2 + Math.floor(streak / 2), 2, 3))));
      U.clear(board);
      board.className = 'game-board n' + opts.length;
      opts.forEach(function (w) {
        var c = UI.cardEl(w, { size: 'tile', speak: false, showSay: false, flip: false });
        c.classList.add('choice');
        c.addEventListener('click', function () {
          if (locked) return;
          if (w.id === current.id) {
            locked = true; streak++; score++;
            S.markAnswer(current.id, true);
            c.classList.add('right');
            A.cancel(); A.sfx('correct'); TT.confetti.atEl(c, { count: 30 });
            A.sayWord(current, { repeats: 1, onend: function () { setTimeout(next, 400); } });
          } else {
            streak = 0;
            c.classList.remove('wrong'); void c.offsetWidth; c.classList.add('wrong');
            A.cancel(); A.sfx('wrong'); A.sayWord(current, { repeats: 2 });
          }
        });
        board.appendChild(c);
      });
      setTimeout(function () { A.cancel(); A.sayWord(current, { repeats: 2 }); }, 420);
    })();
    views.play.onLeave = function () { A.cancel(); };
  };
})(window.TT = window.TT || {});
