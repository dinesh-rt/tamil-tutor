/* Grown-up corner: progress report, speech tuning, custom words, data tools.
   Behind a simple "press and hold for 3 seconds" gate so toddlers stay in the game. */
(function (TT) {
  'use strict';
  var U = TT.util, A = TT.audio, D = TT.data, S = TT.store, UI = TT.ui;

  var unlocked = false;   /* per page-load, never stored */

  /* ------------------------------------------------------------ little tools */

  function row(label, control, help) {
    return U.el('label.field', {}, [
      U.el('span.field-label', { text: label }),
      control,
      help ? U.el('span.field-help', { text: help }) : null
    ]);
  }

  function switchRow(key, label, help, after) {
    var input = U.el('input', { type: 'checkbox', checked: !!S.settings[key] });
    var sw = U.el('span.switch', {}, [input, U.el('span.switch-track', {}, U.el('span.switch-knob'))]);
    input.addEventListener('change', function () {
      S.settings[key] = input.checked;
      A.sfx('tap');
      S.save();
      if (after) after(input.checked);
    });
    var r = U.el('div.field.field-row', {}, [U.el('span.field-label', { text: label }), sw]);
    if (help) U.append(r, U.el('span.field-help', { text: help }));
    return r;
  }

  function sliderRow(key, label, min, max, step, fmt, after) {
    var val = U.el('output', { text: (S.settings[key] == null ? '' : S.settings[key]) });
    var input = U.el('input', { type: 'range', min: min, max: max, step: step, value: S.settings[key] == null ? (min + max) / 2 : S.settings[key] });
    input.addEventListener('input', function () {
      var v = parseFloat(input.value);
      S.settings[key] = v;
      val.textContent = fmt ? fmt(v) : String(v);
      S.save();
      if (after) after(v);
    });
    val.textContent = fmt ? fmt(S.settings[key]) : String(S.settings[key]);
    return U.el('div.field', {}, [U.el('span.field-label', { text: label }), U.el('span.slider-line', {}, [input, val])]);
  }

  function selectRow(key, label, options, help, after) {
    var sel = U.el('select', { 'aria-label': label });
    options.forEach(function (o) {
      U.append(sel, U.el('option', { value: o.v, text: o.l, selected: String(S.settings[key]) === String(o.v) }));
    });
    sel.addEventListener('change', function () {
      S.settings[key] = sel.value; S.save(); A.sfx('tap');
      if (after) after(sel.value);
    });
    return row(label, sel, help);
  }

  function segRow(key, label, options, after) {
    var seg = U.el('div.seg', { role: 'radiogroup', 'aria-label': label });
    options.forEach(function (o) {
      var b = U.el('button', { type: 'button', dataset: { v: o.v }, 'aria-pressed': String(String(S.settings[key]) === String(o.v)) }, [U.el('span', { text: o.l })]);
      b.addEventListener('click', function () {
        S.settings[key] = o.v; S.save(); A.sfx('tap');
        U.qsa('button', seg).forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.v === String(o.v))); });
        if (after) after(o.v);
      });
      seg.appendChild(b);
    });
    return U.el('div.field', {}, [U.el('span.field-label', { text: label }), seg]);
  }

  function section(title, ta, nodes) {
    return U.el('section.panel', {}, [
      U.el('h2.panel-title', {}, [U.el('span.panel-ta.tamil', { text: ta }), U.el('span.panel-en', { text: title })])
    ].concat(nodes));
  }

  function voiceSelect(key, lang, label) {
    var list = A.voices().filter(function (v) {
      return String(v.lang || '').toLowerCase().indexOf(lang.split('-')[0]) === 0;
    });
    var opts = [{ v: '', l: 'Auto (best available)' }];
    list.forEach(function (v) { opts.push({ v: v.voiceURI, l: v.name + ' · ' + v.lang }); });
    var sel = U.el('select', { 'aria-label': label });
    opts.forEach(function (o) { U.append(sel, U.el('option', { value: o.v, text: o.l, selected: (S.settings[key] || '') === o.v })); });
    sel.addEventListener('change', function () { S.settings[key] = sel.value || null; S.save(); });
    var box = U.el('div.field', {}, [U.el('span.field-label', { text: label }), sel]);
    if (!list.length) {
      U.append(box, U.el('p.warn', {}, [
        'No ', lang, ' voice installed. On Android: Settings → Languages → Text-to-speech. On iPhone: Settings → Accessibility → Spoken Content → Voices. ',
        U.el('b', { text: 'Meanwhile the app reads the spelling out loud with an English voice.' })
      ]));
    }
    var test = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '🔊' }), U.el('span', { text: 'Test' })]);
    test.addEventListener('click', function () {
      A.unlock(); A.cancel();
      A.speakText(lang === 'ta' ? 'வணக்கம், நான் தமிழ்' : 'Hello, let us learn', { lang: lang, roman: 'Vanakkam, naan Tamil' });
    });
    U.append(box, test);
    return box;
  }

  /* ------------------------------------------------------------------- gate */

  function gate(host) {
    var a = 3 + Math.floor(Math.random() * 6), b = 3 + Math.floor(Math.random() * 7);
    var input = U.el('input', { type: 'number', inputmode: 'numeric', 'aria-label': 'Answer', class: 'gate-input' });
    var err = U.el('p.gate-err', { text: '' });
    var form = U.el('form.gate', {}, [
      U.el('p.gate-q', {}, [U.el('span', { text: 'Grown-ups only — what is ' }), U.el('b', { text: a + ' × ' + b }), U.el('span', { text: '?' })]),
      input, U.el('button.big-btn', { type: 'submit' }, [U.el('span.big-btn-label', { text: 'Let me in' })]), err
    ]);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (parseInt(input.value, 10) === a * b) { unlocked = true; U.clear(host); render(); }
      else { err.textContent = 'Not quite — try again.'; input.select(); }
    });
    U.append(host, [UI.sectionHead('பெரியவர்களுக்கு', 'Grown-ups only'), form]);
  }

  /* ----------------------------------------------------------------- render */

  function render(hostIn) {
    var host = hostIn || document.getElementById('view');
    if (!unlocked) return gate(host);

    var st = S.stats();
    host.appendChild(UI.sectionHead('பெரியவர்களுக்கு', 'Settings, progress and words of your own'));

    /* progress ------------------------------------------------------------- */
    var catBars = U.el('div.cat-bars', {});
    D.allCategories().forEach(function (c) {
      var seen = c.words.filter(function (w) { return S.level(w.id) > 0; }).length;
      var done = c.words.filter(function (w) { return S.level(w.id) === 3; }).length;
      var bar = U.el('button.cat-bar', { type: 'button', style: '--cat:' + c.color }, [
        U.el('span.cat-bar-ico', { text: c.icon }),
        U.el('span.cat-bar-name', {}, [U.el('span.tamil', { text: c.ta }), U.el('span.cat-bar-en', { text: c.en })]),
        U.el('span.cat-bar-track', {}, [
          U.el('span.cat-bar-fill', { style: 'width:' + (c.words.length ? (seen / c.words.length) * 100 : 0) + '%' }),
          U.el('span.cat-bar-fill.cat-bar-fill-done', { style: 'width:' + (c.words.length ? (done / c.words.length) * 100 : 0) + '%' })
        ]),
        U.el('span.cat-bar-num', { text: seen + '/' + c.words.length })
      ]);
      bar.addEventListener('click', function () { TT.app.go('cards/' + c.key); });
      catBars.appendChild(bar);
    });

    var review = S.reviewQueue(null, 8);
    host.appendChild(section('Progress', 'முன்னேற்றம்', [
      U.el('div.stat-grid', {}, [
        statTile(st.seen + '/' + st.total, 'words met'),
        statTile(st.mastered, 'mastered'),
        statTile(st.stickers, 'stars'),
        statTile(st.sessions, 'sessions'),
        statTile(st.minutes + 'm', 'play time'),
        statTile(st.streak, 'day streak')
      ]),
      U.el('div.legend', {}, S.LEVELS.map(function (l) {
        return U.el('span.legend-item', { style: '--c:' + l.color }, [U.el('i', {}), U.el('span.tamil', { text: l.ta }), U.el('span', { text: l.en })]);
      })),
      catBars,
      review.length ? U.el('div.review-box', {}, [
        U.el('h3', { text: 'Needs another look' }),
        U.el('div.mini-row', {}, review.map(function (w) { return UI.miniCard(w); }))
      ]) : UI.empty('Nothing struggling — everything is going well')
    ]));

    /* speech --------------------------------------------------------------- */
    host.appendChild(section('Speech & sound', 'ஒலி', [
      selectRow('order', 'Which language first', [
        { v: 'ta-first', l: 'தமிழ் first, then English' },
        { v: 'en-first', l: 'English first, then தமிழ்' }
      ]),
      switchRow('speakTamil', 'Speak the Tamil word'),
      switchRow('speakEnglish', 'Speak the English word'),
      sliderRow('repeats', 'Say each word…', 1, 4, 1, function (v) { return v + '×'; }),
      sliderRow('gapMs', 'Pause between words', 150, 1600, 50, function (v) { return (v / 1000).toFixed(2) + 's'; }),
      sliderRow('rate', 'Speaking speed', 0.5, 1.3, 0.05, function (v) { return v.toFixed(2) + '×'; }),
      sliderRow('pitch', 'Voice pitch', 0.6, 1.5, 0.05, function (v) { return v.toFixed(2); }),
      sliderRow('volume', 'Voice volume', 0.2, 1, 0.05, function (v) { return Math.round(v * 100) + '%'; }),
      voiceSelect('voiceTa', 'ta', 'Tamil voice'),
      voiceSelect('voiceEn', 'en', 'English voice'),
      (function () {
        var demo = D.getWord('animals/donkey') || { en: 'Donkey', ta: 'கழுதை', ro: 'kazhuthai' };
        var hear = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '🔊' }), U.el('span', { text: 'Hear it' })]);
        hear.addEventListener('click', function () { A.unlock(); A.cancel(); A.sayWord(demo, { only: 'ta', repeats: 1 }); });
        return [
          segRow('zhStyle', 'The Tamil “zh” sound, with no Tamil voice', [
            { v: 'l', l: 'as “l” · ka-lu-thai' },
            { v: 'r', l: 'as “r” · ka-ru-thai' },
            { v: 'keep', l: 'as “zh” · ka-zhuthai' }
          ], function () { A.cancel(); A.sayWord(demo, { only: 'ta', repeats: 1 }); }),
          U.el('p.panel-note', { text: 'Only used when this device has no Tamil voice and the recordings are switched off — an English voice has no way to say “zh”. The letters printed on the card never change, and a Tamil voice or a real recording always wins over this.' }),
          U.el('div.chip-row', {}, [hear])
        ];
      })(),
      switchRow('sfx', 'Play sounds (taps, stars, cheers)', null, function () { if (TT.repaintSound) TT.repaintSound(); }),
      sliderRow('sfxVolume', 'Sound effect volume', 0, 1, 0.05, function (v) { return Math.round(v * 100) + '%'; }),
      (function () {
        var wrap = U.el('div.chip-row', {});
        ['tap', 'pop', 'ding', 'correct', 'wrong', 'sparkle', 'drum', 'bell', 'applause'].forEach(function (n) {
          var b = U.el('button.chip', { type: 'button' }, [U.el('span', { text: n })]);
          b.addEventListener('click', function () { A.unlock(); A.sfx(n); });
          wrap.appendChild(b);
        });
        return U.el('div.field', {}, [U.el('span.field-label', { text: 'Try a sound' }), wrap]);
      })(),
      switchRow('localVoicesOnly', 'Never speak over the internet', 'use only voices installed on this device', function () { A.cancel(); A.sfx('tap'); }),
      (function () {
        /* the optional human-voice audio pack (tools/make-voice-pack.py) */
        var box = U.el('div.field', {});
        var status = U.el('div.field-help', { text: 'checking for recordings…' });
        var dl = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '🎧' }), U.el('span', { text: 'Save all voices for offline' })]);
        function describe() {
          var p = A.packStatus ? A.packStatus() : { checked: false, clips: 0 };
          if (!p.checked) { A.loadPack(describe); return; }
          if (!p.available) {
            status.textContent = 'No recordings found yet — make them with:  python3 tools/make-voice-pack.py'
              + '  (then reload). Until then the device voice is used.';
            dl.style.display = 'none';
            return;
          }
          dl.style.display = '';
          var v = (p.voices && p.voices.ta) ? String(p.voices.ta).replace('Neural', '').replace('ta-IN-', '') : '';
          if (p.embedded) {
            dl.style.display = 'none';
            status.textContent = p.clips + ' recordings for ' + p.words + ' words are inside this file' + (v ? ' · voice: ' + v : '') + ' — nothing to download, it is already offline.';
            return;
          }
          status.textContent = p.clips + ' recordings for ' + p.words + ' words' + (v ? ' · voice: ' + v : '') + ' — plays offline, sounds like a person.';
        }
        dl.addEventListener('click', function () {
          var p = A.packStatus();
          if (!p.available) { UI.toast('No recordings to save yet'); return; }
          var lab = dl.querySelector('span:last-child');
          A.prefetchPack(function (n, total) {
            lab.textContent = 'saving… ' + Math.round((n / total) * 100) + '%';
          }, function () {
            lab.textContent = 'All voices saved ✅';
            UI.toast('Voices saved — works with the Wi-Fi off');
            A.sfx('ding');
          });
        });
        U.append(box, U.el('span.field-label', { text: 'Real recordings' }));
        U.append(box, status);
        box.appendChild(switchRow('useRecordings', 'Play the recordings (not the robot voice)', 'off = use the device voice instead', describe));
        box.appendChild(sliderRow('clipRate', 'Recording speed', 0.7, 1.25, 0.05, function (v) { return v.toFixed(2) + '×'; }));
        U.append(box, U.el('div.chip-row', {}, [dl]));
        describe();
        return box;
      })(),
      (function () {
        var b = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '🔁' }), U.el('span', { text: 'Reload voice list' })]);
        b.addEventListener('click', function () { A.voices(); U.clear(host); render(host); UI.toast('Voice list refreshed'); });
        return b;
      })()
    ]));

    /* cards ---------------------------------------------------------------- */
    host.appendChild(section('Flashcards', 'அட்டைகள்', [
      segRow('mode', 'Words shown', [
        { v: 'bilingual', l: 'தமிழ் + English' }, { v: 'tamil', l: 'தமிழ் only' }, { v: 'english', l: 'English only' }
      ]),
      segRow('reveal', 'Reveal style', [
        { v: 'both', l: 'Picture + words together' }, { v: 'flip', l: 'Guess, then tap to flip' }
      ], function (v) { S.save(); }),
      switchRow('showRoman', 'Show the spelling (naai)', 'helps older kids read'),
      switchRow('showSay', 'Show the grown-up sentence chip'),
      switchRow('shuffle', 'Shuffle the cards'),
      switchRow('autoplay', 'Auto-advance (hands-free)', 'keeps going on its own — good for car rides'),
      sliderRow('autoplaySec', 'Seconds per card', 3, 30, 1, function (v) { return v + 's'; }),
      switchRow('rewardStars', 'Award stars'),
      switchRow('muted', 'Mute everything', null, function () { if (TT.repaintSound) TT.repaintSound(); })
    ]));

    /* behaviour ------------------------------------------------------------ */
    host.appendChild(section('Behaviour', 'செயல்பாடு', [
      segRow('theme', 'Colours', [{ v: 'day', l: 'Day' }, { v: 'night', l: 'Night' }], function () { TT.app.applyTheme(); }),
      switchRow('reduceMotion', 'Less motion', 'calmer animations', function () { TT.app.applyTheme(); }),
      switchRow('kidLock', 'Grown-up corner needs a hold', 'hide the puzzle button behind a 3-second press on the elephant', function () {
        if (TT.repaintKidLock) TT.repaintKidLock();
      })
    ]));

    /* custom words --------------------------------------------------------- */
    host.appendChild(section('Your own words', 'நம்ம சொற்கள்', customNodes()));

    /* data ----------------------------------------------------------------- */
    host.appendChild(section('Data', 'தரவு', dataNodes()));

    /* help ----------------------------------------------------------------- */
    host.appendChild(section('Check on this device', 'சாதனம் சரிபார்ப்பு', checkupNodes()));
    host.appendChild(section('Help', 'உதவி', [
      U.el('ul.help-list', {}, [
        U.el('li', {}, [U.el('b', { text: 'Offline: ' }), 'open the app once and it caches itself. Add it to the home screen (share → Add to Home Screen) so it opens full-screen with no browser bar.']),
        U.el('li', {}, [U.el('b', { text: 'No Tamil voice? ' }), 'the app still speaks — it reads the romanised spelling with an English voice, so your child hears something close. Install a Tamil voice for the real thing.']),
        U.el('li', {}, [U.el('b', { text: 'Print cards: ' }), U.el('button.linkish', { type: 'button', text: 'open a printable sheet' })]),
        U.el('li', {}, [U.el('b', { text: 'Nothing leaves this device. ' }), 'no accounts, no ads, no tracking, no network calls after the first load.'])
      ])
    ]));

    host.appendChild(U.el('div.row-cta', {}, [
      UI.bigButton('Back to the fun', { icon: '🐘', color: '#7c3aed' }, function () { TT.app.go('home'); })
    ]));

    var linkish = host.querySelector('.help-list .linkish');
    if (linkish) linkish.addEventListener('click', function () {
      /* start on one topic — printing all 700+ cards at once is slow on cheap phones */
      TT.app.go('print/' + (S.settings.lastCategory || D.allCategories()[0].key));
    });
  }

  function statTile(v, l) { return U.el('div.stat-tile', {}, [U.el('b', { text: String(v) }), U.el('span', { text: l })]); }

  /* ------------------------------------------------------------- custom UI */

  function customNodes() {
    var catSel = U.el('select', { 'aria-label': 'Topic' });
    U.append(catSel, U.el('option', { value: 'custom', text: '🏡 My words' }));
    D.allCategories().forEach(function (c) {
      if (c.key !== 'custom') U.append(catSel, U.el('option', { value: c.key, text: c.icon + ' ' + c.en + ' / ' + c.ta }));
    });

    var en = U.el('input', { type: 'text', placeholder: 'Kite', 'aria-label': 'English word', autocomplete: 'off' });
    var ta = U.el('input', { type: 'text', class: 'tamil', placeholder: 'புழுகுட்டி', 'aria-label': 'Tamil word', autocomplete: 'off' });
    var ro = U.el('input', { type: 'text', placeholder: 'puzhukkutti', 'aria-label': 'How it sounds', autocomplete: 'off' });
    var img = U.el('input', { type: 'text', placeholder: '🪁 (any emoji) or svg:pomegranate', 'aria-label': 'Picture', autocomplete: 'off' });
    var say = U.el('input', { type: 'text', class: 'tamil', placeholder: 'optional sentence in Tamil', 'aria-label': 'Sentence', autocomplete: 'off' });
    var out = U.el('div.mini-row', {});

    var emojiRow = U.el('div.chip-row', {});
    ['🪁', '🥥', '🚲', '🪔', '🧵', '🎪', '🐚', '🛺', '🍯', '🪑', '🌾', '🐘', '🦚', '🎠', '🧸', '🥁'].forEach(function (e) {
      var b = U.el('button.chip', { type: 'button' }, [U.el('span', { text: e })]);
      b.addEventListener('click', function () { img.value = e; A.sfx('tap'); });
      emojiRow.appendChild(b);
    });

    var addBtn = U.el('button.big-btn', { type: 'button' }, [U.el('span.big-btn-label', { text: 'Add the word' })]);
    addBtn.addEventListener('click', function () {
      if (!en.value.trim() || !ta.value.trim()) { UI.toast('Needs the English and Tamil word'); return; }
      S.addCustom({ cat: catSel.value, en: en.value.trim(), ta: ta.value.trim(), ro: ro.value.trim() || en.value.trim(), img: img.value.trim() || '🔤', say: say.value.trim() || null });
      [en, ta, ro, img, say].forEach(function (i) { i.value = ''; });
      TT.app.registerCustomWords();
      A.sfx('correct'); UI.toast('Word added ⭐');
      var box = addBtn.closest('.panel');
      U.clear(box);
      customNodes().forEach(function (n) { box.appendChild(n); });
    });

    var list = U.el('div.custom-list', {});
    S.custom.forEach(function (w, idx) {
      var word = D.getWord(w.cat + '/' + D.slug(w.en)) || { id: 'x', en: w.en, ta: w.ta, ro: w.ro, img: w.img, mo: 'pop', cat: w.cat };
      var rowEl = U.el('div.custom-row', {}, [
        UI.miniCard(word),
        U.el('span.custom-row-en', { text: w.ro || '' }),
        U.el('button.icon-btn', { type: 'button', 'aria-label': 'Delete ' + w.en, text: '🗑' })
      ]);
      rowEl.querySelector('.icon-btn').addEventListener('click', function () {
        S.removeCustom(idx);
        TT.app.registerCustomWords();
        A.sfx('wrong');
        UI.toast('Word removed — reloading');
        setTimeout(function () { location.reload(); }, 500);
        return;
        var box = list.closest('.panel'); U.clear(box);
        customNodes().forEach(function (n) { box.appendChild(n); });
      });
      list.appendChild(rowEl);
    });

    return [
      row('Topic', catSel),
      row('English word', en),
      row('தமிழ் word', ta, 'paste Tamil from any keyboard or type it directly'),
      row('How it sounds', ro, 'used when no Tamil voice is installed'),
      row('Picture', img),
      U.el('div.field', {}, [U.el('span.field-label', { text: 'Quick pictures' }), emojiRow]),
      row('Sentence (optional)', say),
      addBtn,
      S.custom.length ? list : UI.empty('No extra words yet')
    ];
  }

  /* -------------------------------------------------------------- data tools */

  /* ------------------------------------------------- check on this device
     Turns "does it work on a phone?" into something a grown-up can read on the
     phone itself: one line per thing that can be wrong, plus what to do about it. */
  function checkRow(r) {
    var kids = [U.el('span.check-dot', { text: r.state === 'ok' ? '✓' : r.state === 'warn' ? '!' : '✗', 'aria-hidden': 'true' })];
    var body = [U.el('p.check-label', { text: r.label })];
    if (r.detail) body.push(U.el('p.check-detail', { text: r.detail }));
    if (r.fix) body.push(U.el('p.check-fix', { text: r.fix }));
    kids.push(U.el('div.check-body', {}, body));
    return U.el('div.check-row', { dataset: { state: r.state } }, kids);
  }

  function gatherChecks(cb) {
    var rows = [];
    function add(state, label, detail, fix) { rows.push({ state: state, label: label, detail: detail, fix: fix }); }
    var S2 = TT.store, A2 = TT.audio;

    var voices = (A2 && A2.voices) ? A2.voices() : [];
    add(voices.length ? 'ok' : 'warn', 'Device voices',
      voices.length ? voices.length + ' voice' + (voices.length === 1 ? '' : 's') + ' installed' : 'none found by the browser',
      voices.length ? '' : 'Install a speech voice in the phone settings — or rely on the recordings below, which need no voice at all.');

    var ta = (A2 && A2.hasVoiceFor) ? A2.hasVoiceFor('ta') : false;
    var taName = '';
    try { taName = (A2.bestVoice('ta') || {}).name || ''; } catch (e) { }
    add(ta ? 'ok' : 'warn', 'Tamil voice',
      ta ? taName : 'no Tamil voice — Tamil words fall back to the sounding-out letters',
      ta ? '' : 'Android: Settings → System → Languages → add Tamil, then text-to-speech voices. iPhone: Settings → Accessibility → Spoken Content → Voices → Tamil. Or switch on the recordings, which sound better anyway. Until you do either, Speech & sound → “The Tamil “zh” sound” chooses how the app fakes it.');

    var pk = (A2 && A2.packStatus) ? A2.packStatus() : { available: false };
    var useRec = S2.settings.useRecordings !== false;
    add(pk.available && useRec ? 'ok' : 'warn', 'Real recordings',
      pk.available ? (pk.clips || 0) + ' clips for ' + (pk.words || 0) + ' words' + (pk.embedded ? ' (inside the file)' : '') + (useRec ? '' : ' — but switched off') : 'not found — the app is using device voices',
      pk.available ? (useRec ? '' : 'Turn “Use the real recordings” on above.') : 'Run `npm run voices` beside the app, or use the portable/offline build that carries them inside.');

    var st = S2.storageStatus ? S2.storageStatus() : { persist: true };
    add(st.persist ? 'ok' : 'bad', 'Progress saving',
      st.persist ? (st.words + ' words remembered · save format v' + st.version + (st.recovered ? ' · repaired once from a backup' : '')) : 'this browser will not keep anything' + (st.error ? ' (' + st.error + ')' : ''),
      st.persist ? '' : 'Private/incognito tabs and full storage do this. Add the app to the home screen, or use Data → Export before you close the tab.');

    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    var served = /^https?:$/.test(location.protocol);
    add(standalone ? 'ok' : served ? 'warn' : 'ok', 'How it is opened',
      standalone ? 'full-screen app from the home screen' : served ? 'a browser tab' : 'a file on this device — install buttons are off, everything else works',
      standalone ? '' : served ? 'Menu → “Add to Home screen” to make it an app that also works with the Wi-Fi off.' : '');

    add(served ? 'ok' : 'warn', 'Connection',
      (navigator.onLine ? 'online' : 'offline — playing from memory') + (served ? '' : ' · file:// so the app never needs a server'),
      '');

    var vp = (window.innerWidth || 0) + '×' + (window.innerHeight || 0);
    var small = 0, n = 0;
    // only things a toddler would tap: grown-up settings may stay small on purpose
    U.qsa('.mini, .btn, .tile, .tabbar button, .brand').forEach(function (el) {
      if (el.closest('.panel')) return;
      var b = el.getBoundingClientRect();
      if (b.width && b.height) { n++; if (Math.min(b.width, b.height) < 44) small++; }
    });
    var nothing = !n;
    add(nothing ? 'warn' : (small ? 'warn' : 'ok'), 'Screen and tap targets',
      nothing ? vp + ' · no cards on this screen to measure'
        : vp + ' · ' + n + ' buttons measured' + (small ? ', ' + small + ' smaller than a toddler finger (44px)' : ', all big enough'),
      nothing ? 'Run the checks again from Home, where the word cards are on screen.'
        : small ? 'Widening the targets is a job for the grown-ups — tell us the screen size and which buttons.' : '');

    var rm = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || S2.settings.reduceMotion;
    add('ok', 'Motion', (rm ? 'reduced motion is on — the app keeps still' : 'full animation') + (S2.settings.reduceMotion ? ' (switched on in settings)' : ''));

    var ac = window.AudioContext || window.webkitAudioContext;
    add(ac ? 'ok' : 'warn', 'Sound effects', ac ? (A2 && A2.ctx && A2.ctx.state ? 'audio engine ' + A2.ctx.state : 'ready, starts on the first tap') : 'this browser has no WebAudio', '');

    // two checks need a promise — fill them in when they answer
    var swRow = { state: 'warn', label: 'Works with the Wi-Fi off', detail: 'checking…', fix: 'Menu → Add to Home Screen, then let it cache once.' };
    rows.push(swRow);
    var finish = function () { if (cb) cb(rows); };
    var after = function () {
      if (!('caches' in window)) { finish(); return; }
      caches.keys().then(function (keys) {
        if (!keys.length) { finish(); return; }
        caches.open(keys[0]).then(function (c) { return c.keys(); }).then(function (reqs) {
          var mp3 = reqs.filter(function (r) { return /\.mp3$/.test(r.url); }).length;
          rows.push({ state: mp3 ? 'ok' : 'warn', label: 'Voices kept for offline', detail: mp3 ? mp3 + ' clips cached on this device' : 'nothing cached yet', fix: mp3 ? '' : 'Play a few words with the Wi-Fi on, or use 🎧 Save all voices for offline.' });
          finish();
        }, finish);
      }, finish);
    };
    if ('serviceWorker' in navigator && served) {
      navigator.serviceWorker.getRegistration().then(function (reg) {
        swRow.state = reg && reg.active ? 'ok' : 'warn';
        swRow.detail = reg && reg.active ? 'offline copy is active' : 'no offline copy on this device';
        if (reg && reg.active) swRow.fix = '';
        after();
      }, after);
    } else { swRow.state = 'ok'; swRow.detail = served ? 'checking…' : 'not needed — opened as a file'; after(); }
  }

  function checkupText() {
    var lines = ['Tamil Tutor check-up', 'app v' + (TT.version || '?') + ' · ' + new Date().toLocaleString(), 'ua: ' + navigator.userAgent];
    gatherChecks(function (rows) {
      rows.forEach(function (r) {
        lines.push((r.state === 'ok' ? '[ok] ' : r.state === 'warn' ? '[!] ' : '[x] ') + r.label + (r.detail ? ' — ' + r.detail : '') + (r.fix ? '  → ' + r.fix : ''));
      });
    });
    return lines.join('\n');
  }

  function checkupNodes() {
    var list = U.el('div.check-list', { role: 'status', 'aria-live': 'polite' });
    var run = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '🩺' }), U.el('span', { text: 'Run checks' })]);
    var copy = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '📋' }), U.el('span', { text: 'Copy report' })]);
    var hear = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '🔊' }), U.el('span', { text: 'Hear a test word' })]);

    function paint(rows) {
      U.clear(list);
      if (!rows.length) { U.append(list, U.el('p.check-detail', { text: 'Nothing to check.' })); return; }
      rows.forEach(function (r) { U.append(list, checkRow(r)); });
    }

    run.addEventListener('click', function () {
      A.unlock(); A.sfx('tap');
      U.clear(list);
      U.append(list, U.el('p.check-detail', { text: 'Looking…' }));
      gatherChecks(paint);
    });

    copy.addEventListener('click', function () {
      var text = '';
      gatherChecks(function (rows) {
        text = ['Tamil Tutor check-up', navigator.userAgent].concat(rows.map(function (r) {
          return (r.state === 'ok' ? '[ok] ' : r.state === 'warn' ? '[!] ' : '[x] ') + r.label + (r.detail ? ' — ' + r.detail : '') + (r.fix ? '  → ' + r.fix : '');
        })).join('\n');
        var done = function () { UI.toast('Report copied — paste it into a message'); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { UI.toast(text ? text.slice(0, 40) + '…' : 'nothing to copy'); });
        } else {
          var taEl = U.el('textarea', { style: 'position:fixed;left:-9999px', value: text });
          document.body.appendChild(taEl); taEl.select();
          try { document.execCommand('copy'); done(); } catch (e) { }
          taEl.remove();
        }
      });
    });

    hear.addEventListener('click', function () {
      A.unlock(); A.cancel();
      var pk = A.packStatus ? A.packStatus() : { available: false };
      var word = D.getWord('animals/dog') || D.allWords()[0];
      A.sayWord(word, { repeats: 1 });
      UI.toast(pk.available && S.settings.useRecordings !== false ? 'Playing the real recording' : 'Using the device voice' + (A.hasVoiceFor && A.hasVoiceFor('ta') ? ' (Tamil)' : ' (letters, no Tamil voice)'));
    });

    return [U.el('p.panel-note', { text: 'Everything the app needs, checked on the device you are holding — useful before you blame the app for a silent phone.' }),
      U.el('div.chip-row', {}, [run, copy, hear]), list];
  }

  function dataNodes() {
    var nodes = [];
    var st = S.storageStatus ? S.storageStatus() : null;
    if (st && !st.persist) {
      nodes.push(U.el('p.save-warn', { text: '⚠️ This browser will not keep progress (storage is blocked, private mode, or full). Playing still works — export before you close the tab. Adding the app to the home screen usually fixes it.' }));
    } else if (st && (st.recovered || st.lostOnLoad)) {
      nodes.push(U.el('p.save-warn.save-ok', { text: st.recovered ? '↩️ Your last good save was restored after a damaged one was found.' : 'ℹ️ The old save could not be read, so we started a fresh one.' }));
    }
    var exportBtn = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '⬇️' }), U.el('span', { text: 'Export (JSON file)' })]);
    exportBtn.addEventListener('click', function () {
      var blob = new Blob([JSON.stringify({ app: 'tamil-tutor', version: (S.CURRENT_VERSION || 1), exportedAt: new Date().toISOString(), settings: S.settings, progress: S.progress, custom: S.custom }, null, 2)], { type: 'application/json' });
      var a = U.el('a', { href: URL.createObjectURL(blob), download: 'tamil-tutor-progress.json' });
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      UI.toast('Saved to your downloads');
    });

    var copyBtn = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '📋' }), U.el('span', { text: 'Copy to clipboard' })]);
    copyBtn.addEventListener('click', function () {
      var txt = JSON.stringify({ settings: S.settings, progress: S.progress, custom: S.custom });
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { UI.toast('Copied'); }, function () { UI.toast('Could not copy'); });
      else UI.toast('Clipboard not available');
    });

    var area = U.el('textarea', { placeholder: '…or paste a backup here and press Restore', 'aria-label': 'Paste backup', rows: '4' });
    var restoreBtn = U.el('button.chip', { type: 'button' }, [U.el('span.chip-ico', { text: '⬆️' }), U.el('span', { text: 'Restore' })]);
    restoreBtn.addEventListener('click', function () {
      try {
        var obj = JSON.parse(area.value);
        if (!obj || typeof obj !== 'object') throw new Error('bad');
        if (obj.settings) Object.assign(S.settings, obj.settings);
        if (obj.progress) { S.progress.words = obj.progress.words || {}; S.progress.stickers = obj.progress.stickers || []; S.progress.byCat = obj.progress.byCat || {}; S.progress.sessions = obj.progress.sessions || 0; S.progress.minutes = obj.progress.minutes || 0; S.progress.streak = obj.progress.streak || 0; }
        if (Array.isArray(obj.custom)) { S.custom.length = 0; obj.custom.forEach(function (c) { S.custom.push(c); }); }
        S.save(); A.sfx('correct'); UI.toast('Backup restored 🎉');
        if (TT.repaintKidLock) TT.repaintKidLock();
        TT.app.registerCustomWords(); TT.app.applyTheme();
        var box = area.closest('.panel'); U.clear(box);
        dataNodes().forEach(function (n) { box.appendChild(n); });
      } catch (e) { UI.toast('That did not look like a backup'); }
    });

    function danger(label, msg, fn) {
      var b = U.el('button.chip.chip-danger', { type: 'button' }, [U.el('span', { text: label })]);
      b.addEventListener('click', function () {
        var body = U.el('div', {}, [
          U.el('p', { text: msg }),
          U.el('div.row-cta', {}, [
            UI.bigButton('Yes, do it', { icon: '⚠️', color: '#dc2626' }, function () { fn(); s.close(); UI.toast('Done'); U.clear(document.getElementById('view')); render(); }),
            UI.bigButton('Cancel', { icon: '↩️', color: '#64748b' }, function () { s.close(); })
          ])
        ]);
        var s = UI.sheet(label, body);
      });
      return b;
    }

    nodes.push(U.el('div.chip-row', {}, [exportBtn, copyBtn]));
    nodes.push(area);
    nodes.push(U.el('div.chip-row', {}, [restoreBtn]));
    nodes.push(U.el('p.field-help', { text: 'Progress lives only in this browser. If you clear the site data it is gone — take a backup now and then.' }));
    nodes.push(U.el('div.chip-row', {}, [
      danger('Reset progress', 'This forgets every word your child has met and all the stars. Settings stay as they are.', function () { S.resetProgress(); }),
      danger('Reset settings', 'Speech, language and sound go back to the defaults.', function () { S.resetSettings(); TT.app.applyTheme(); }),
      danger('Erase everything', 'Progress, settings and your own words are all deleted for good. Export a backup first if you are unsure.', function () { S.wipe(); })
    ]));
    return nodes;
  }

  TT.views.grownup = { render: function (host) { render(host); } };
  TT.views.print = {
    render: function (host, route) {
      var cat = route.a && route.a !== 'all' ? D.getCat(route.a) : null;
      var words = cat ? D.catWords(cat.key) : D.allWords();
      var bar = U.el('div.print-bar', {}, [
        U.el('button.big-btn', { type: 'button' }, [U.el('span.big-btn-label', { text: '🖨 Print' })]),
        U.el('button.big-btn', { type: 'button' }, [U.el('span.big-btn-label', { text: '← Back' })])
      ]);
      var pick = U.el('select.print-pick', {});
      U.append(pick, U.el('option', { value: 'all', text: 'All words (big job!)' }));
      D.allCategories().forEach(function (c) {
        U.append(pick, U.el('option', { value: c.key, text: c.icon + ' ' + c.en + ' · ' + c.words.length }));
      });
      pick.value = cat ? cat.key : 'all';
      pick.addEventListener('change', function () { TT.app.go('print/' + pick.value); });
      bar.appendChild(pick);
      bar.children[0].addEventListener('click', function () { window.print(); });
      bar.children[1].addEventListener('click', function () { TT.app.go('grownup'); });
      host.appendChild(bar);
      host.appendChild(U.el('h1.print-title', {}, [U.el('span.tamil', { text: cat ? cat.ta : 'அனைத்தும்' }), U.el('span', { text: cat ? cat.en : 'All words' })]));
      var grid = U.el('div.print-grid', {});
      words.forEach(function (w) {
        U.append(grid, U.el('div.print-card', {}, [
          U.el('div.print-pic', { html: UI.pictureHTML(w) }),
          U.el('div.print-ta.tamil', { text: w.ta }),
          U.el('div.print-ro', { text: w.ro }),
          U.el('div.print-en', { text: w.en })
        ]));
      });
      host.appendChild(grid);
    }
  };
})(window.TT = window.TT || {});
