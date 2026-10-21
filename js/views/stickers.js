/* Sticker board — every star the child has earned, tappable to hear the word. */
(function (TT) {
  'use strict';
  var U = TT.util, A = TT.audio, D = TT.data, S = TT.store, UI = TT.ui;

  TT.views.stickers = {
    render: function (host) {
      var st = S.stats();
      var heroes = U.el('section.hero.hero-small', {}, [
        U.el('div.hero-mascot', {}, [U.el('span.hero-elephant', { text: '🦋' })]),
        U.el('div.hero-text', {}, [
          U.el('h1.hero-ta.tamil', { text: 'நட்சத்திரங்கள்' }),
          U.el('p.hero-en', { text: 'Your stars — tap one to hear the word again' }),
          U.el('p.hero-stats', {}, [
            U.el('span.stat-pill', { text: '⭐ ' + st.stickers + ' earned' }),
            U.el('span.stat-pill', { text: '🗓️ ' + st.streak + ' day streak' }),
            U.el('span.stat-pill', { text: '🎯 ' + st.mastered + ' mastered' }),
            U.el('span.stat-pill', { text: '⏱️ ' + st.minutes + ' min played' })
          ])
        ])
      ]);
      heroes.querySelector('.hero-mascot').addEventListener('click', function () {
        A.unlock(); A.cancel(); A.sfx('applause'); TT.confetti.atEl(heroes, { count: 30 });
        A.speakText('இது நீ சம்பாதிச்ச நட்சத்திரம்!', { lang: 'ta', roman: 'Idhu nee sampathicha nadchathiram!' });
      });
      host.appendChild(heroes);

      var list = S.progress.stickers.slice().reverse();
      if (!list.length) {
        host.appendChild(UI.empty('No stars yet — finish 5 flashcards or win a game to earn your first ⭐'));
        var cta = U.el('div.row-cta', {}, [
          UI.bigButton('Flashcards', { icon: '🃏', color: '#7c3aed' }, function () { TT.app.go('cards/' + (S.settings.lastCategory || 'all')); }),
          UI.bigButton('Games', { icon: '🎲', color: '#0ea5e9' }, function () { TT.app.go('play'); })
        ]);
        host.appendChild(cta);
        return;
      }

      var grid = U.el('div.sticker-grid', {});
      list.forEach(function (s) {
        var w = s.wordId ? D.getWord(s.wordId) : null;
        var node;
        if (w) node = UI.miniCard(w);
        else node = U.el('button.mini', { type: 'button' }, [
          U.el('span.mini-pic', {}, [U.el('span.emoji', { text: '⭐' })]),
          U.el('span.mini-en', { text: 'Super star!' })
        ]);
        node.classList.add('sticker');
        node.dataset.at = s.at;
        grid.appendChild(node);
      });
      host.appendChild(grid);

      host.appendChild(U.el('p.foot-note', {}, [
        'Every star is a word your child met. Tap a star to hear it again — ',
        U.el('button.linkish', { type: 'button', text: 'settings for grown-ups' })
      ]));
      host.querySelector('.linkish').addEventListener('click', function () { TT.app.go('grownup'); });
    }
  };
})(window.TT = window.TT || {});
