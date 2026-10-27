/* ==========================================================================
   Tamil Tutor — data registry
   --------------------------------------------------------------------------
   Words and categories are registered here by the files in js/data/.
   Every data file calls:

     TT.data.category({ key:"animals", en:"Animals", ta:"விலங்குகள்", icon:"🐘", color:"#f97316" });
     TT.data.words("animals", [ { en:"Dog", ta:"நாய்", ro:"naai", img:"🐕", mo:"bounce" }, ... ]);

   Field reference (see README.md → "Adding your own words"):
     en   English word (required)
     ta   Tamil word in Tamil script (required)
     ro   Romanised / how-to-say-it, for grown-ups (required)
     img  picture: an emoji ("🐕") or a drawn sprite ("svg:pomegranate") (required)
     mo   motion/animation name (optional, see css/animations.css)
     say  a short spoken phrase for grown-ups to use with the child (optional)
     note small extra fact shown in "grown-up mode" (optional)
     tag  extra search labels (optional, string or array)
   ========================================================================== */
(function (global) {
  'use strict';

  var TT = global.TT = global.TT || {};
  var TAMIL_RE = /[\u0B80-\u0BFF]/;

  var categories = [];
  var catByKey = Object.create(null);
  var words = [];
  var wordById = Object.create(null);
  var wordsByCat = Object.create(null);
  var dupes = [];

  function slug(str) {
    return String(str).toLowerCase()
      .replace(/[’'`.]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function category(def) {
    if (!def || !def.key) throw new Error('category needs a key');
    if (catByKey[def.key]) return catByKey[def.key];
    var cat = {
      key: def.key,
      en: def.en || def.key,
      ta: def.ta || '',
      icon: def.icon || '🔤',
      color: def.color || '#7c3aed',
      color2: def.color2 || null,
      desc: def.desc || '',
      order: (def.order == null ? categories.length : def.order),
      words: []
    };
    categories.push(cat);
    catByKey[cat.key] = cat;
    wordsByCat[cat.key] = cat.words;
    return cat;
  }

  function word(catKey, w) {
    var cat = catByKey[catKey];
    if (!cat) throw new Error('unknown category: ' + catKey);
    if (!w || !w.en || !w.ta || !w.ro || !w.img) {
      throw new Error('word in ' + catKey + ' is missing a field: ' + JSON.stringify(w));
    }
    var item = {
      id: catKey + '/' + slug(w.en),
      cat: catKey,
      catRef: cat,
      en: String(w.en).trim(),
      ta: String(w.ta).trim(),
      ro: String(w.ro).trim(),
      img: String(w.img).trim(),
      mo: w.mo || null, /* no animation = a still picture, which is most words */
      say: w.say || null,
      note: w.note || null,
      tag: [].concat(w.tag || [])
    };
    if (wordById[item.id]) { dupes.push(item.id); return wordById[item.id]; }
    words.push(item);
    wordById[item.id] = item;
    cat.words.push(item);
    return item;
  }

  function wordsFor(catKey, list) {
    for (var i = 0; i < list.length; i++) word(catKey, list[i]);
  }

  /* ---- queries --------------------------------------------------------- */

  function allWords() { return words; }
  function allCategories() { return categories.slice().sort(function (a, b) { return a.order - b.order; }); }
  function getCat(key) { return catByKey[key] || null; }
  function getWord(id) { return wordById[id] || null; }
  function catWords(key) { return wordsByCat[key] || []; }

  function wordsIn(keys) {
    var out = [];
    for (var i = 0; i < keys.length; i++) out = out.concat(catWords(keys[i]));
    return out;
  }

  function search(q) {
    q = String(q || '').toLowerCase().trim();
    if (!q) return [];
    return words.filter(function (w) {
      return w.en.toLowerCase().indexOf(q) > -1 ||
             w.ro.toLowerCase().indexOf(q) > -1 ||
             w.ta.indexOf(q) > -1 ||
             w.tag.join(' ').toLowerCase().indexOf(q) > -1;
    });
  }

  /* ---- shuffling / picking --------------------------------------------- */

  function shuffle(list, rnd) {
    var a = list.slice(), r = rnd || Math.random, i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(r() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /** n distinct words, optionally restricted to a category, in random order */
  function pick(catKey, n, opts) {
    opts = opts || {};
    var pool = catKey ? catWords(catKey) : words;
    if (opts.exclude) {
      var ex = {};
      opts.exclude.forEach(function (w) { ex[w.id] = 1; });
      pool = pool.filter(function (w) { return !ex[w.id]; });
    }
    return shuffle(pool).slice(0, n);
  }

  TT.data = {
    slug: slug,
    category: category,
    words: wordsFor,
    allWords: allWords,
    allCategories: allCategories,
    getCat: getCat,
    getWord: getWord,
    catWords: catWords,
    wordsIn: wordsIn,
    search: search,
    shuffle: shuffle,
    pick: pick,
    dupeIds: dupes,
    TAMIL_RE: TAMIL_RE
  };
})(typeof window !== 'undefined' ? window : globalThis);
