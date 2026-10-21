/* Hand-drawn SVG pictures for things emoji can't do (Tamil snacks, instruments…) */
(function (TT) {
  'use strict';

  var S = {
    papaya: '<ellipse cx="50" cy="56" rx="26" ry="34" fill="#8bc34a"/><ellipse cx="50" cy="56" rx="18" ry="26" fill="#ff9800"/>' +
      '<circle cx="44" cy="50" r="3" fill="#5d4037"/><circle cx="55" cy="58" r="3" fill="#5d4037"/><circle cx="48" cy="66" r="3" fill="#5d4037"/>' +
      '<path d="M50 22c0-6 4-10 9-11" stroke="#4e342e" stroke-width="4" fill="none" stroke-linecap="round"/>',

    pomegranate: '<circle cx="50" cy="58" r="30" fill="#e53935"/><path d="M50 28l-6-10h12z" fill="#c62828"/>' +
      '<path d="M44 18h12v8h-12z" fill="#d81b60"/><circle cx="42" cy="52" r="4" fill="#ffcdd2"/><circle cx="56" cy="50" r="4" fill="#ffcdd2"/>' +
      '<circle cx="49" cy="62" r="4" fill="#ffcdd2"/><circle cx="61" cy="63" r="4" fill="#ffcdd2"/><circle cx="39" cy="66" r="4" fill="#ffcdd2"/>',

    guava: '<circle cx="50" cy="54" r="30" fill="#8bc34a"/><circle cx="50" cy="54" r="19" fill="#f48fb1"/>' +
      '<circle cx="44" cy="50" r="2.6" fill="#fff"/><circle cx="56" cy="50" r="2.6" fill="#fff"/><circle cx="50" cy="60" r="2.6" fill="#fff"/>' +
      '<path d="M50 24v-8" stroke="#4e342e" stroke-width="4" stroke-linecap="round"/>',

    jackfruit: '<ellipse cx="50" cy="56" rx="27" ry="36" fill="#9ccc65"/>' +
      '<g fill="#7cb342"><circle cx="38" cy="40" r="4"/><circle cx="52" cy="34" r="4"/><circle cx="64" cy="44" r="4"/>' +
      '<circle cx="34" cy="58" r="4"/><circle cx="50" cy="54" r="4"/><circle cx="66" cy="60" r="4"/>' +
      '<circle cx="42" cy="74" r="4"/><circle cx="58" cy="76" r="4"/></g>' +
      '<path d="M50 20v-8" stroke="#4e342e" stroke-width="4" stroke-linecap="round"/>',

    idli: '<ellipse cx="50" cy="76" rx="36" ry="12" fill="#b0bec5"/>' +
      '<ellipse cx="36" cy="60" rx="17" ry="14" fill="#fafafa"/><ellipse cx="64" cy="60" rx="17" ry="14" fill="#fafafa"/>' +
      '<ellipse cx="50" cy="42" rx="18" ry="15" fill="#fff"/>' +
      '<circle cx="46" cy="40" r="2" fill="#eceff1"/><circle cx="55" cy="45" r="2" fill="#eceff1"/>',

    laddu: '<circle cx="50" cy="56" r="27" fill="#ffa726"/>' +
      '<g fill="#ff8f00"><circle cx="40" cy="48" r="3.5"/><circle cx="58" cy="46" r="3.5"/><circle cx="50" cy="62" r="3.5"/>' +
      '<circle cx="63" cy="60" r="3.5"/><circle cx="38" cy="64" r="3.5"/></g>' +
      '<g fill="#ffe082"><circle cx="46" cy="36" r="2.5"/><circle cx="55" cy="70" r="2.5"/></g>' +
      '<path d="M50 29c0-5 3-8 7-9" stroke="#8d6e63" stroke-width="3.5" fill="none" stroke-linecap="round"/>',

    murukku: '<path d="M50 22a28 28 0 1 1-.1 56 22 22 0 1 1 .1-44 15 15 0 1 0 .1 30" fill="none" stroke="#d4a017" stroke-width="9" stroke-linecap="round"/>',

    kuzhal: '<rect x="12" y="44" width="76" height="14" rx="7" fill="#8d6e63"/>' +
      '<rect x="12" y="44" width="76" height="6" rx="3" fill="#a1887f"/>' +
      '<g fill="#3e2723"><circle cx="32" cy="51" r="3"/><circle cx="45" cy="51" r="3"/><circle cx="58" cy="51" r="3"/><circle cx="71" cy="51" r="3"/></g>' +
      '<rect x="82" y="42" width="8" height="18" rx="4" fill="#5d4037"/>',

    kolam: '<g fill="#c62828"><circle cx="26" cy="26" r="3.5"/><circle cx="50" cy="26" r="3.5"/><circle cx="74" cy="26" r="3.5"/>' +
      '<circle cx="26" cy="50" r="3.5"/><circle cx="50" cy="50" r="3.5"/><circle cx="74" cy="50" r="3.5"/>' +
      '<circle cx="26" cy="74" r="3.5"/><circle cx="50" cy="74" r="3.5"/><circle cx="74" cy="74" r="3.5"/></g>' +
      '<path d="M14 38c0-14 12-26 26-26s26 12 26 26-12 26-26 26-26-12-26-26z" fill="none" stroke="#f57f17" stroke-width="4"/>' +
      '<path d="M38 62c0-14 12-26 26-26s26 12 26 26-12 26-26 26-26-12-26-26z" fill="none" stroke="#6a1b9a" stroke-width="4"/>',

    head: '<circle cx="50" cy="52" r="30" fill="#ffcc80"/>' +
      '<path d="M20 46c2-18 14-26 30-26s28 8 30 26c-6-8-16-12-30-12s-24 4-30 12z" fill="#424242"/>' +
      '<circle cx="40" cy="52" r="4" fill="#37474f"/><circle cx="60" cy="52" r="4" fill="#37474f"/>' +
      '<path d="M40 68c5 6 15 6 20 0" stroke="#bf360c" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="20" cy="56" r="6" fill="#ffcc80"/><circle cx="80" cy="56" r="6" fill="#ffcc80"/>',

    belly: '<path d="M20 34h60v22c0 17-13 30-30 30S20 73 20 56z" fill="#ffcc80"/>' +
      '<path d="M20 34c8 6 18 9 30 9s22-3 30-9" stroke="#ffb74d" stroke-width="3" fill="none"/>' +
      '<path d="M50 56c-3 4-3 9 0 13 3-4 3-9 0-13z" fill="#ef6c00"/>' +
      '<circle cx="34" cy="46" r="2.5" fill="#ef6c00"/><circle cx="66" cy="46" r="2.5" fill="#ef6c00"/>',

    /* fallback sticker for the sticker book */
    star: '<path d="M50 12l11 24 26 3-19 18 5 26-23-13-23 13 5-26-19-18 26-3z" fill="#fbc02d"/>'
  };

  TT.spriteKeys = Object.keys(S);
  TT.spirteKeys = TT.spriteKeys; /* old alias */

  /** Returns an <svg> string for "svg:name", or null. */
  TT.spriteFor = function (img) {
    if (!img || img.indexOf('svg:') !== 0) return null;
    var name = img.slice(4);
    if (!S[name]) return null;
    return '<svg viewBox="0 0 100 100" role="img" aria-hidden="true" class="pic-svg">' + S[name] + '</svg>';
  };

  TT.hasSprite = function (name) { return !!S[name]; };
  TT.spriteRaw = S;
})(window.TT = window.TT || {});
