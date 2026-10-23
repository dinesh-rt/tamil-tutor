/* Speech (words spoken aloud) + sound effects synthesised with WebAudio.
   No audio files — everything works offline. */
(function (TT) {
  'use strict';

  var U = TT.util;

  /* ------------------------------------------------------------------ voices */

  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var voices = [];
  var unlocked = false;

  function refreshVoices() {
    if (!synth) return;
    voices = synth.getVoices() || [];
  }
  if (synth) {
    refreshVoices();
    try { synth.onvoiceschanged = refreshVoices; } catch (e) { /* older engines */ }
    setTimeout(refreshVoices, 300);
    setTimeout(refreshVoices, 1200);
  }

  function voiceList() { refreshVoices(); return voices; }

  function bestVoice(lang, overrideURI) {
    var list = voiceList();
    if (overrideURI) {
      for (var i = 0; i < list.length; i++) if (list[i].voiceURI === overrideURI) return list[i];
    }
    var base = String(lang || '').toLowerCase().split('-')[0];
    var exact = [], same = [], i, v, l;
    for (i = 0; i < list.length; i++) {
      v = list[i]; l = String(v.lang || '').toLowerCase();
      if (l === String(lang || '').toLowerCase()) exact.push(v);
      else if (l.split('-')[0] === base) same.push(v);
    }
    /* prefer "local" (on-device) voices: they sound far better for Tamil */
    function score(v) {
      var s = 0, n = String(v.name || '');
      if (v.localService) s += 4; else if (TT.store && TT.store.settings.localVoicesOnly) s -= 200;  // nothing may leave the device
      if (/tamil|tam/i.test(n)) s += 6;
      if (/google/i.test(n)) s += 1;
      if (/natural|enhanced|premium/i.test(n)) s += 3;
      if (/female|woman|zira|veena|heera|kalpana|swara|lekha/i.test(n)) s += 1;
      return s;
    }
    function sortDesc(a, b) { return score(b) - score(a); }
    exact.sort(sortDesc); same.sort(sortDesc);
    return exact[0] || same[0] || null;
  }

  function hasVoiceFor(lang) { return !!bestVoice(lang, null); }

  /* ------------------------------------------------------------------- speak */

  var queue = [];      // [{text,lang,rate,pitch,onend}]
  var safetyCounter = 0;   /* must be declared before speakNext uses it */
  var speaking = false;
  var token = 0;       // invalidates old chains when cancelled

  /** Deliver a job's completion callback exactly once.
      Callers drive the UI from it (autoplay, the games), so it must fire even
      when the utterance was cancelled or the engine never calls back. */
  function settle(job) {
    if (!job || job.settled) return;
    job.settled = true;
    if (job.onend) { try { job.onend(); } catch (e) { /* keep going */ } }
  }

  function speakNext() {
    if (speaking || !queue.length) return;
    if (!synth) { // no TTS at all — still run the timings so the UI keeps moving
      var drop = queue.shift();
      speaking = true;
      setTimeout(function () { settle(drop); }, 900);
      setTimeout(function () { speaking = false; speakNext(); }, 900);
      return;
    }
    var job = queue.shift();
    var u = new SpeechSynthesisUtterance(job.text);
    var v = bestVoice(job.lang, job.voice);
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = job.lang || 'en-IN'; }
    u.rate = job.rate == null ? 0.85 : job.rate;
    u.pitch = job.pitch == null ? 1 : job.pitch;
    u.volume = job.volume == null ? 1 : job.volume;
    u.onend = u.onerror = function () {
      speaking = false;
      settle(job);
      if (job.myToken === token) speakNext();
    };
    speaking = true;
    try { synth.speak(u); }
    catch (e) { speaking = false; settle(job); }
    /* safety valve: some engines silently stall and never fire onend —
       without this the deck, autoplay and the games would wait forever */
    var mine = ++safetyCounter;
    var cap = 2500 + String(job.text || '').length * 180;
    setTimeout(function () {
      if (mine !== safetyCounter) { settle(job); return; }  // superseded, but never leave the UI hanging
      if (!speaking) { settle(job); return; }               // onend already fired
      speaking = false;
      try { synth.cancel(); } catch (e) { /* ignore */ }
      settle(job);
      if (job.myToken === token) speakNext();
    }, cap);
  }

  function cancel() {
    token++;
    for (var i = 0; i < queue.length; i++) settle(queue[i]);   // nobody waits forever
    queue = []; speaking = false;
    stopClip();                                                // stop any playing recording
    if (activeChain) finishChain();                            // autoplay must still move on
    if (synth) { try { synth.cancel(); } catch (e) { /* ignore */ } }
  }

  /* ------------------------------------------------------------- audio pack */
  /* Optional recordings made by tools/make-voice-pack.py. When they exist the
     cards play a real voice; anything missing quietly falls back to speech, so
     a half-made pack — or no pack at all — is completely safe. */

  var pack = { checked: false, loading: false, available: false, files: {}, voices: null, embedded: false };
  var clipEl = null, clipJob = null;
  var EMBED = null;          // clips are base64 inside the html file (single-file build)

  function usePack(files, voices, embedded) {
    pack.files = files || {};
    pack.voices = voices || null;
    pack.embedded = !!embedded;
    pack.available = Object.keys(pack.files).length > 0;
    pack.checked = true;
    return pack.available;
  }

  /* single-file build: <script type="application/json" id="tt-audio-index"> */
  function embeddedIndex() {
    var node = document.getElementById('tt-audio-index');
    if (!node) return null;
    try { return JSON.parse(node.textContent || '{}'); } catch (e) { return null; }
  }

  /* the base64 blob is one big text block:  wordId ⇥ kind ⇥ base64  per line.
     We index line offsets once and decode a clip only when it is actually played. */
  function embeddedClip(id, kind) {
    if (!EMBED) return null;
    var key = id + '\t' + kind;
    if (EMBED.urls[key]) return EMBED.urls[key];
    if (!EMBED.offsets) {
      var off = 0, nl, map = {};
      while ((nl = EMBED.raw.indexOf('\n', off)) >= 0) {
        var t1 = EMBED.raw.indexOf('\t', off), t2 = EMBED.raw.indexOf('\t', t1 + 1);
        if (t1 > 0 && t2 > off && t2 < nl) map[EMBED.raw.substring(off, t2)] = { s: t2 + 1, e: nl };
        off = nl + 1;
      }
      EMBED.offsets = map;
    }
    var e = EMBED.offsets[key];
    if (!e) return null;
    try {
      var bin = atob(EMBED.raw.substring(e.s, e.e));
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      var url = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
      EMBED.urls[key] = url;
      return url;
    } catch (err) { return null; }
  }

  function loadPack(cb) {
    if (pack.loading) return;

    /* 1. clips baked inside this html file */
    var emb = embeddedIndex();
    if (emb && emb.files && Object.keys(emb.files).length) {
      var raw = (document.getElementById('tt-audio-pack') || {}).textContent || '';
      EMBED = { raw: raw, offsets: null, urls: {} };
      usePack(emb.files, emb.voices, true);
      if (cb) cb(pack.available);
      return;
    }

    /* 2. audio/pack-index.js next to a file:// copy (fetch is blocked there) */
    if (window.TT_AUDIO_PACK && window.TT_AUDIO_PACK.files) {
      usePack(window.TT_AUDIO_PACK.files, window.TT_AUDIO_PACK.voices, false);
      if (cb) cb(pack.available);
      return;
    }

    /* 3. served over http(s): ask the server for the manifest */
    if (!/^https?:$/.test(location.protocol)) {
      usePack(null, null, false);
      if (cb) cb(false);
      return;
    }
    pack.loading = true;
    try {
      fetch('audio/manifest.json', { cache: 'no-cache' }).then(function (r) {
        return (r && r.ok) ? r.json() : null;
      }).then(function (m) {
        pack.loading = false;
        usePack(m && m.files, m && m.voices, false);
        if (cb) cb(pack.available);
      }).catch(function () {
        pack.loading = false;
        usePack(null, null, false);
        if (cb) cb(false);
      });
    } catch (e) { pack.loading = false; usePack(null, null, false); if (cb) cb(false); }
  }

  function clipFile(id) { return id.indexOf('/') >= 0 ? id.replace('/', '__') : id; }

  function clipUrl(id, kind) {
    var f = pack.files[id];
    if (!f || f.indexOf(kind) < 0) return null;
    if (pack.embedded) return embeddedClip(id, kind);
    return 'audio/' + (kind === 'say' ? 'ta/say/' : kind + '/') + clipFile(id) + '.mp3';
  }

  function stopClip() {
    if (clipEl) { try { clipEl.onended = clipEl.onerror = null; clipEl.pause(); } catch (e) { /* ignore */ } clipEl = null; }
    if (clipJob) {
      var j = clipJob; clipJob = null;
      if (!j.settled) { j.settled = true; if (j.onend) { try { j.onend(); } catch (e) { /* ignore */ } } }
    }
  }

  /** Play one recording. onend fires exactly once, even on error or a stall. */
  function playClip(url, opts) {
    opts = opts || {};
    stopClip();
    var job = { settled: false, onend: opts.onend };
    var a;
    try { a = new Audio(url); } catch (e) { if (opts.onerror) { opts.onerror(); } else { settle(job); } return; }
    var s = TT.store ? TT.store.settings : {};
    a.volume = U.clamp(s.volume != null ? s.volume : 1, 0, 1);
    if (s.clipRate && s.clipRate !== 1) { try { a.playbackRate = U.clamp(s.clipRate, 0.6, 1.4); } catch (e) { /* ignore */ } }
    clipEl = a; clipJob = job;
    var timer = null;
    function finish() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (clipEl === a) clipEl = null;
      if (clipJob === job) clipJob = null;
      settle(job);
    }
    a.onended = finish;
    a.onerror = function () {
      if (job.settled) return;
      if (clipEl === a) clipEl = null;
      if (clipJob === job) clipJob = null;
      if (timer) { clearTimeout(timer); timer = null; }
      if (opts.onerror) opts.onerror(); else settle(job);
    };
    /* a stuck file must never hang the deck — but a word clip is 1-2 s and a
       narration page is 30 s, so let the caller say how long it runs (books
       pass `dur` from the pack manifest) instead of cutting every clip short */
    var limit = Math.max(9000, (opts.dur > 0 ? opts.dur : 0) * 1000 + 4000);
    timer = setTimeout(function () { timer = null; finish(); }, limit);
    try {
      var p = a.play();
      if (p && p.catch) p.catch(function () { setTimeout(finish, 80); });   // blocked before the first tap
    } catch (e) { setTimeout(finish, 80); }
  }

  function packOn() {
    var s = TT.store ? TT.store.settings : {};
    if (!pack.checked && !pack.loading) loadPack();     // portable builds detect it lazily
    return pack.available && s.useRecordings !== false;
  }

  function enqueue(job) {
    job.myToken = token;
    queue.push(job);
    speakNext();
  }

  /* ழ (and to a lesser extent ற) has no English equivalent, so an English voice
     reading the school romanisation "zh" makes a mess of it - this respelling is
     applied ONLY to the spoken hint when the device has no Tamil voice. What is
     printed on the card never changes, and a Tamil voice or a recording always
     wins over any of this. */
  function respell(text, style) {
    if (!text) return text;
    if (style == null) style = 'l';
    if (style === 'keep') return text;
    var to = (style === 'r') ? 'r' : 'l';
    return text.replace(/[zZ]h/g, function (m) { return m.charAt(0) === 'Z' ? to.toUpperCase() : to; });
  }

  function speakText(text, opts) {
    opts = opts || {};
    var s = TT.store ? TT.store.settings : {};
    if (opts.lang === 'ta' && !hasVoiceFor('ta') && !opts.forceLang) {
      /* No Tamil voice on this device → read the romanisation with an Indian English voice */
      text = respell(opts.roman || text, s.zhStyle);
      opts.lang = 'en-IN';
    }
    enqueue({
      text: text,
      lang: opts.lang || 'en-IN',
      voice: opts.lang === 'ta' ? (s.voiceTa || null) : (s.voiceEn || null),
      rate: opts.rate != null ? opts.rate : (s.rate != null ? s.rate : 0.85),
      pitch: opts.pitch != null ? opts.pitch : (s.pitch != null ? s.pitch : 1),
      volume: s.volume != null ? s.volume : 1,
      onend: opts.onend
    });
  }

  /* the chain currently speaking, so cancel() can release whoever is waiting on it */
  var activeChain = null;
  function finishChain() {
    if (!activeChain || activeChain.settled) return;
    activeChain.settled = true;
    activeChain = null;
    if (chainDone) { try { chainDone(); } catch (e) { /* ignore */ } }
  }
  var chainDone = null;

  /** Speak the 💬 sentence — recording when we have one, speech otherwise. */
  function speakSentence(word, opts) {
    opts = opts || {};
    var s = TT.store ? TT.store.settings : {};
    if (s.muted || !word || !word.say) return;
    cancel();
    /* An English voice cannot read Tamil script at all, so a sentence would come out
       as noise. Better to hear the word clearly than the sentence as garbage. */
    function fallback() {
      if (hasVoiceFor('ta')) speakText(word.say, { lang: 'ta', roman: word.sayRo || null, onend: opts.onend });
      else sayWord(word, { only: 'ta', repeats: 1, onend: opts.onend });
    }
    if (!word.id || !packOn()) { fallback(); return; }
    var url = clipUrl(word.id, 'say');
    if (!url) { fallback(); return; }
    playClip(url, { onend: opts.onend, onerror: fallback });
  }

  /** Say a word the way the parent configured it (Tamil, English, repeats…). */
  function sayWord(word, opts) {
    opts = opts || {};
    var s = TT.store ? TT.store.settings : {};
    if (s.muted) return;
    cancel();
    var parts = [];
    var order = opts.order || s.order || 'ta-first';
    var wantTa = s.mode !== 'english' && s.speakTamil !== false;
    var wantEn = s.mode !== 'tamil' && (s.speakEnglish !== false);
    if (opts.only === 'ta') wantEn = false;
    if (opts.only === 'en') wantTa = false;

    function pushTa() { if (wantTa) parts.push({ t: word.ta, l: 'ta' }); }
    function pushEn() { if (wantEn) parts.push({ t: word.en, l: 'en-IN' }); }
    if (order === 'en-first') { pushEn(); pushTa(); } else { pushTa(); pushEn(); }
    if (!parts.length) pushTa();

    var reps = opts.repeats != null ? opts.repeats : (s.repeats != null ? s.repeats : 2);
    reps = U.clamp(reps, 1, 4);
    var gap = s.gapMs != null ? s.gapMs : 650;

    var chain = [];
    for (var r = 0; r < reps; r++) for (var i = 0; i < parts.length; i++) chain.push(parts[i]);

    var done = opts.onend;
    var chainToken = token;                       // a newer tap must silence this chain
    chainDone = done;
    activeChain = { settled: false };

    /* play the human recording for this part if we own one, else use the browser */
    function sayPart(p, next) {
      if (word.id && packOn()) {
        var url = clipUrl(word.id, p.l === 'ta' ? 'ta' : 'en');
        if (url) {
          playClip(url, { onend: next, onerror: function () { talk(p, next); } });
          return;
        }
      }
      talk(p, next);
    }
    function talk(p, next) {
      speakText(p.t, {
        lang: p.l,
        roman: word.ro,
        rate: p.l === 'ta' ? (s.rateTa != null ? s.rateTa : (s.rate != null ? s.rate : 0.8)) : (s.rate != null ? s.rate : 0.85),
        pitch: p.l === 'ta' ? (s.pitchTa != null ? s.pitchTa : (s.pitch != null ? s.pitch : 1)) : (s.pitch != null ? s.pitch : 1),
        onend: next
      });
    }

    (function run(i) {
      if (chainToken !== token) return;                       // cancelled — caller is released by cancel()
      if (i >= chain.length) { finishChain(); return; }
      var p = chain[i];
      sayPart(p, function () {
        if (chainToken !== token) return;
        setTimeout(function () { run(i + 1); }, gap);
      });
    })(0);
  }

  /* ------------------------------------------------------------ sound effects */

  var ac = null, master = null;

  function ctx() {
    if (ac) return ac;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ac = new AC(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination); }
    catch (e) { ac = null; }
    return ac;
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    var c = ctx();
    if (c && c.state === 'suspended') { try { c.resume(); } catch (e) { /* ignore */ } }
    if (synth) { // iOS needs a gesture-initiated speak() before any later speech works
      try {
        var u = new SpeechSynthesisUtterance(' ');
        u.volume = 0; synth.speak(u);
      } catch (e) { /* ignore */ }
    }
  }

  function tone(freq, dur, opts) {
    var c = ctx(); if (!c || !master) return;
    opts = opts || {};
    var t0 = c.currentTime + (opts.at || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), t0 + dur);
    var vol = (opts.gain == null ? 0.35 : opts.gain) * (TT.store ? (TT.store.settings.sfxVolume != null ? TT.store.settings.sfxVolume : 0.6) : 0.6);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, opts) {
    var c = ctx(); if (!c || !master) return;
    opts = opts || {};
    var t0 = c.currentTime + (opts.at || 0);
    var len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(); src.buffer = buf;
    var filt = c.createBiquadFilter();
    filt.type = opts.filter || 'bandpass';
    filt.frequency.value = opts.freq || 1400;
    filt.Q.value = opts.q || 0.8;
    var g = c.createGain();
    g.gain.value = (opts.gain == null ? 0.25 : opts.gain) * (TT.store ? (TT.store.settings.sfxVolume != null ? TT.store.settings.sfxVolume : 0.6) : 0.6);
    src.connect(filt); filt.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur);
  }

  var SFX = {
    tap: function () { tone(660, 0.09, { type: 'triangle', to: 880, gain: 0.22 }); },
    pop: function () { tone(420, 0.09, { type: 'sine', to: 900, gain: 0.3 }); tone(900, 0.07, { type: 'sine', gain: 0.14, at: 0.03 }); },
    flip: function () { noise(0.14, { freq: 2200, gain: 0.18 }); },
    ding: function () { tone(1046, 0.5, { type: 'sine', gain: 0.26 }); tone(1568, 0.45, { type: 'sine', gain: 0.12, at: 0.02 }); },
    correct: function () {
      [523, 659, 784, 1046].forEach(function (f, i) { tone(f, 0.22, { type: 'triangle', gain: 0.26, at: i * 0.075 }); });
      noise(0.3, { freq: 5200, gain: 0.08, at: 0.05 });
    },
    wrong: function () { tone(300, 0.16, { type: 'sawtooth', to: 190, gain: 0.16 }); tone(200, 0.2, { type: 'sine', gain: 0.12, at: 0.14 }); },
    sparkle: function () {
      for (var i = 0; i < 5; i++) tone(1200 + Math.random() * 1800, 0.18, { type: 'sine', gain: 0.1, at: i * 0.045 });
    },
    drum: function () { tone(160, 0.22, { type: 'sine', to: 60, gain: 0.42 }); noise(0.1, { freq: 900, gain: 0.14 }); },
    bell: function () { tone(1320, 0.8, { type: 'sine', gain: 0.2 }); tone(1980, 0.6, { type: 'sine', gain: 0.08, at: 0.01 }); },
    applause: function () {
      for (var i = 0; i < 26; i++) noise(0.07, { freq: 1600 + Math.random() * 1800, gain: 0.11, at: Math.random() * 0.7 });
      tone(880, 0.18, { type: 'triangle', gain: 0.1, at: 0.05 });
    },
    whoosh: function () { noise(0.32, { freq: 900, filter: 'lowpass', gain: 0.2 }); },
    tick: function () { tone(1800, 0.04, { type: 'square', gain: 0.08 }); },
    puri: function () { noise(0.5, { freq: 2600, gain: 0.12 }); },
    animal: function () { tone(520, 0.16, { type: 'sawtooth', to: 320, gain: 0.16 }); tone(700, 0.12, { type: 'triangle', gain: 0.1, at: 0.18 }); }
  };

  function sfx(name) {
    if (TT.store && TT.store.settings.sfx === false) return;
    unlock();
    var f = SFX[name] || SFX.tap;
    try { f(); } catch (e) { /* ignore */ }
  }

  /* periodic "engine is still alive" kick — Chrome sometimes pauses speech */
  setInterval(function () {
    if (synth && speaking && !synth.speaking && !synth.pending) speaking = false;
  }, 1500);

  TT.audio = {
    supported: !!synth,
    unlock: unlock,
    cancel: cancel,
    speakText: speakText,
    sayWord: sayWord,
    /** Play one recording and report when it ends. Books pass `dur` from the
        pack manifest; without it the anti-stall timer cuts long narration off
        at 9 s, which is fine for a word clip and wrong for a page. */
    playClip: playClip,
    sfx: sfx,
    voices: voiceList,
    bestVoice: bestVoice,
    respell: respell,
    hasVoiceFor: hasVoiceFor,
    isSpeaking: function () { return speaking || (synth ? synth.speaking : false); },
    sfxNames: Object.keys(SFX),
    /* audio pack */
    loadPack: loadPack,
    speakSentence: speakSentence,
    packStatus: function () {
      if (!pack.checked && !pack.loading) loadPack();
      var n = 0, ks = Object.keys(pack.files);
      for (var i = 0; i < ks.length; i++) n += (pack.files[ks[i]] || []).length;
      return { checked: pack.checked, available: pack.available, embedded: pack.embedded, words: ks.length, clips: n, voices: pack.voices };
    },
    /** Warm the offline cache for every clip (grown-up corner button). */
    prefetchPack: function (onProgress, cb) {
      if (pack.embedded) { var t = 0, ks0 = Object.keys(pack.files); for (var q = 0; q < ks0.length; q++) t += pack.files[ks0[q]].length; if (cb) cb(t); return; }
      var urls = [], ids = Object.keys(pack.files), i, k, url;
      for (i = 0; i < ids.length; i++) {
        for (k = 0; k < (pack.files[ids[i]] || []).length; k++) {
          url = clipUrl(ids[i], pack.files[ids[i]][k]);
          if (url) urls.push(url);
        }
      }
      var total = urls.length, n = 0, at = 0;
      if (!total) { if (cb) cb(0); return; }
      (function step() {
        if (at >= total) { if (cb) cb(n); return; }
        var done = false;
        function next() {
          if (done) return;
          done = true;
          n++; if (onProgress) onProgress(n, total);
          setTimeout(step, 10);
        }
        var a = new Audio();
        a.preload = 'auto';
        a.onloadedmetadata = next;
        a.onerror = next;
        a.src = urls[at++];
        setTimeout(next, 5000);                     // never stall the loop on a dead file
      })();
    }
  };
})(window.TT = window.TT || {});
