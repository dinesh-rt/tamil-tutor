/* Tiny DOM + misc helpers (no dependencies) */
(function (TT) {
  'use strict';

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /** el('button#go.big.round', {props}, children) — tag, optional #id, .classes */
  function el(spec, props, children) {
    var m = /^([a-zA-Z][a-zA-Z0-9-]*)?(?:#([^.[\s]+))?((?:\.[^.]+)*)/.exec(String(spec));
    var node = document.createElement(((m && m[1]) || 'div').toLowerCase());
    if (m && m[2]) node.id = m[2];
    if (m && m[3]) {
      String(m[3]).split('.').forEach(function (chunk) {
        chunk.split(/\s+/).forEach(function (cls) { if (cls) node.classList.add(cls); });
      });
    }
    if (props) for (var k in props) {
      if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
      var v = props[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'class') node.className += (node.className ? ' ' : '') + v;
      else if (k === 'dataset') for (var d in v) node.dataset[d] = v[d];
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (v === true) node.setAttribute(k, '');
      else node.setAttribute(k, v);
    }
    if (children != null) append(node, children);
    return node;
  }

  function append(node, children) {
    if (children == null) return node;
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) append(node, children[i]);
      return node;
    }
    node.appendChild(typeof children === 'object' ? children : document.createTextNode(String(children)));
    return node;
  }

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }

  function on(target, type, fn, opts) { target.addEventListener(type, fn, opts); return function () { target.removeEventListener(type, fn, opts); }; }

  function clamp(n, lo, hi) { return n < lo ? lo : (n > hi ? hi : n); }
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
  function randInt(lo, hi) { return Math.floor(rand(lo, hi + 1)); }
  function pickOne(list) { return list && list.length ? list[Math.floor(Math.random() * list.length)] : null; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function debounce(fn, ms) {
    var t; return function () {
      var self = this, a = arguments;
      clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms || 200);
    };
  }
  function throttle(fn, ms) {
    var last = 0, t;
    return function () {
      var self = this, a = arguments, now = Date.now();
      var wait = ms - (now - last);
      if (wait <= 0) { clearTimeout(t); last = now; fn.apply(self, a); }
      else if (!t) t = setTimeout(function () { last = Date.now(); t = null; fn.apply(self, a); }, wait);
    };
  }
  function todayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function haptic(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) { /* not supported */ }
  }
  function isTouch() { return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0); }

  /* full screen, with graceful failure on desktop/iOS-Safari */
  function toggleFullscreen() {
    var d = document;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) {
        (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      } else {
        var e = d.documentElement;
        var req = e.requestFullscreen || e.webkitRequestFullscreen;
        if (req) req.call(e);
      }
    } catch (err) { /* ignore */ }
  }

  /** shallow-ish copy of a word/category record (arrays one level deep) */
  function clone(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.slice();
    var out = {}, k;
    for (k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
      out[k] = Array.isArray(obj[k]) ? obj[k].slice() : obj[k];
    }
    return out;
  }

  TT.util = {
    qs: qs, qsa: qsa, el: el, append: append, clear: clear, on: on, clone: clone,
    clamp: clamp, rand: rand, randInt: randInt, pickOne: pickOne, esc: esc,
    debounce: debounce, throttle: throttle, todayKey: todayKey,
    prefersReducedMotion: prefersReducedMotion, haptic: haptic,
    isTouch: isTouch, toggleFullscreen: toggleFullscreen
  };
})(window.TT = window.TT || {});
