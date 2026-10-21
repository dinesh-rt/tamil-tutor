/* Confetti & star bursts on a single canvas. Respects reduced-motion. */
(function (TT) {
  'use strict';

  var canvas = null, ctx = null, parts = [], raf = null, dpr = 1;
  var COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#0ea5e9', '#a855f7', '#ec4899', '#14b8a6'];

  function ensure() {
    if (canvas) return true;
    canvas = document.getElementById('fx');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'fx';
      canvas.className = 'fx-canvas';
      document.body.appendChild(canvas);
    }
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize, { passive: true });
    return !!ctx;
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function make(x, y, opts) {
    var a = Math.random() * Math.PI * 2;
    var sp = (opts.speed || 7) * (0.4 + Math.random());
    return {
      x: x, y: y,
      vx: Math.cos(a) * sp * (opts.spread || 1),
      vy: Math.sin(a) * sp - (opts.up || 4),
      g: opts.g == null ? 0.16 : opts.g,
      w: 6 + Math.random() * 9,
      h: 8 + Math.random() * 12,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1,
      decay: 0.006 + Math.random() * 0.008,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      shape: Math.random() < 0.25 ? 'star' : (Math.random() < 0.5 ? 'circle' : 'rect')
    };
  }

  function loop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
      if (p.life <= 0 || p.y > window.innerHeight + 60) { parts.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, p.w * 0.5 * dpr, 0, 6.3); ctx.fill();
      } else if (p.shape === 'star') {
        ctx.beginPath();
        for (var k = 0; k < 5; k++) {
          var a1 = (k * 2 * Math.PI) / 5 - Math.PI / 2, a2 = a1 + Math.PI / 5;
          ctx.lineTo(Math.cos(a1) * p.w * dpr, Math.sin(a1) * p.w * dpr);
          ctx.lineTo(Math.cos(a2) * p.w * 0.45 * dpr, Math.sin(a2) * p.w * 0.45 * dpr);
        }
        ctx.closePath(); ctx.fill();
      } else {
        ctx.fillRect(-p.w * 0.5 * dpr, -p.h * 0.5 * dpr, p.w * dpr, p.h * dpr);
      }
      ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(loop);
    else { raf = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  function start() { if (!raf) raf = requestAnimationFrame(loop); }

  function burst(x, y, opts) {
    if (TT.store && TT.store.settings.reduceMotion) return;
    if (TT.util.prefersReducedMotion() && !(opts && opts.force)) return;
    if (!ensure()) return;
    opts = opts || {};
    var n = opts.count || 42;
    for (var i = 0; i < n; i++) parts.push(make(x, y, opts));
    if (parts.length > 700) parts.splice(0, parts.length - 700);
    start();
  }

  function rain(opts) {
    opts = opts || {};
    if (TT.store && TT.store.settings.reduceMotion) return;
    if (!ensure()) return;
    var w = window.innerWidth;
    for (var i = 0; i < (opts.count || 60); i++) {
      var p = make(Math.random() * w, -20 - Math.random() * 300, { g: 0.08, speed: 2, up: -1 });
      p.decay = 0.0035;
      parts.push(p);
    }
    start();
  }

  /** Celebrate at the centre of an element. */
  function atEl(node, opts) {
    var r = node.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, opts);
  }

  TT.confetti = { burst: burst, rain: rain, atEl: atEl, clear: function () { parts = []; if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); } };
})(window.TT = window.TT || {});
