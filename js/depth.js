/* depth.js — 3D sahne, parçacık ağı, kart eğilme, mıknatıs buton, imleç ışığı */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var narrow = function () { return window.innerWidth < 900; };
  if (reduce) return;

  // ---- Hero başlığı: kelimeleri sar (son kelime vurgulu)
  var h1 = document.querySelector('.hero h1');
  if (h1 && !h1.querySelector('.w')) {
    var words = h1.textContent.trim().split(/\s+/);
    h1.innerHTML = words.map(function (w, i) {
      var hl = /nokta|place|tek/i.test(w) ? ' hl' : '';
      return '<span class="w' + hl + '" style="--n:' + i + '">' + w + '</span>';
    }).join(' ');
  }

  // ---- Hero 3D sahne: fare ile eğilme, kaydırmada düzleşme
  var stage = document.querySelector('.hero-stage');
  var hero = document.querySelector('.hero');
  if (stage && hero) {
    var sx = 0;
    var onScroll = function () {
      var y = window.scrollY, h = hero.offsetHeight || 600;
      var p = Math.min(y / (h * 0.6), 1);
      // tepede hafif yatık (14deg), aşağı indikçe düzleşir ve geri yatar
      sx = 14 - p * 26;
      stage.style.setProperty('--sx', sx.toFixed(2) + 'deg');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    if (fine) {
      hero.addEventListener('pointermove', function (e) {
        if (narrow()) return;
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        stage.style.setProperty('--ry', (px * 14).toFixed(2) + 'deg');
        stage.style.setProperty('--rx', (-py * 10).toFixed(2) + 'deg');
      });
      hero.addEventListener('pointerleave', function () {
        stage.style.setProperty('--ry', '0deg'); stage.style.setProperty('--rx', '0deg');
      });
    }
  }

  // ---- Ürün sayfası vitrini: kaydırdıkça düzleşen ekran
  var show = document.querySelector('.showcase .frame');
  if (show) {
    var onShow = function () {
      var r = show.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(Math.max((vh - r.top) / (vh * 0.7), 0), 1);
      show.style.setProperty('--sx', (16 - p * 16).toFixed(2) + 'deg');
    };
    onShow();
    window.addEventListener('scroll', onShow, { passive: true });
    window.addEventListener('resize', onShow);
  }

  // ---- Kartlar: 3D eğilme + parlama
  if (fine) {
    var cards = document.querySelectorAll('.product, .feature, .why article');
    cards.forEach(function (card) {
      if (card.classList.contains('product') && !card.querySelector('.glare')) {
        var g = document.createElement('i'); g.className = 'glare'; card.appendChild(g);
      }
      var max = card.classList.contains('featured') ? 4 : 8;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * max).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * max).toFixed(2) + 'deg');
        card.style.setProperty('--ga', (Math.atan2(py, px) * 180 / Math.PI + 90).toFixed(0) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg');
      });
    });

    // ---- Mıknatıs butonlar
    document.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.setProperty('--bx', (dx * 0.22).toFixed(1) + 'px');
        b.style.setProperty('--by', (dy * 0.22).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });

    // ---- İmleç ışığı: koyu bantlarda görünür
    var glow = document.createElement('div'); glow.className = 'cursor-glow'; document.body.appendChild(glow);
    var darkSel = '.hero, .band-dark, .cta, .page-hero, .showcase, .footer';
    var raf = null, gx = 0, gy = 0;
    document.addEventListener('pointermove', function (e) {
      gx = e.clientX; gy = e.clientY;
      var over = e.target.closest && e.target.closest(darkSel);
      glow.classList.toggle('is-on', !!over);
      if (!raf) raf = requestAnimationFrame(function () {
        glow.style.setProperty('--cx', gx + 'px'); glow.style.setProperty('--cy', gy + 'px'); raf = null;
      });
    });
    document.addEventListener('pointerleave', function () { glow.classList.remove('is-on'); });
  }

  // ---- Parçacık ağı (hero)
  var canvas = document.querySelector('.hero .net');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d'), W, H, pts = [], mouse = { x: -9999, y: -9999 }, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var N = function () { return narrow() ? 36 : 80; };
    var resize = function () {
      var r = canvas.parentElement.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      for (var i = 0; i < N(); i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: 1 + Math.random() * 1.6 });
    };
    resize();
    window.addEventListener('resize', resize);
    if (fine) {
      canvas.parentElement.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
      canvas.parentElement.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    }
    var visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
    var tick = function () {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        var L = 130;
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          // fareden hafifçe kaç
          var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 150 * 150) { var d = Math.sqrt(d2) || 1; p.x += dx / d * .6; p.y += dy / d * .6; }
          for (var j = i + 1; j < pts.length; j++) {
            var q = pts[j], ex = p.x - q.x, ey = p.y - q.y, e2 = ex * ex + ey * ey;
            if (e2 < L * L) {
              var a = (1 - Math.sqrt(e2) / L) * .35;
              ctx.strokeStyle = 'rgba(94,234,212,' + a.toFixed(3) + ')'; ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
          }
          ctx.fillStyle = 'rgba(94,234,212,.9)';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---- Bölüm başlıkları alt çizgi
  var heads = document.querySelectorAll('.sec-head');
  if (heads.length && 'IntersectionObserver' in window) {
    var hio = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); hio.unobserve(en.target); } }); }, { threshold: 0.4 });
    heads.forEach(function (h) { hio.observe(h); });
  }
})();

/* ---- İç sayfalar: scroll 3D ---- */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce) return;
  var narrow = function () { return window.innerWidth < 900; };

  // reveal-3d / reveal-stagger (IntersectionObserver)
  var els = document.querySelectorAll('.reveal-3d, .reveal-stagger');
  if (els.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('is-in'); }); }

  // Sayfa hero parallax
  var ph = document.querySelector('.page-hero');
  // Split parallax
  var sv = document.querySelector('.split-visual');

  var update = function () {
    var y = window.scrollY, vh = window.innerHeight;
    if (ph) ph.style.setProperty('--sy', Math.min(y, 900));
    if (sv && !narrow()) {
      var sr = sv.getBoundingClientRect();
      var c = (sr.top + sr.height / 2 - vh / 2) / vh; // -1..1
      sv.style.setProperty('--py', Math.max(-1, Math.min(1, c)).toFixed(3));
    }
  };
  update();
  var ticking = false;
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { update(); ticking = false; }); } }, { passive: true });
  window.addEventListener('resize', update);

  // İletişim formu: fareyle eğilme
  var form = document.querySelector('.contact .form');
  if (form && fine) {
    form.addEventListener('pointermove', function (e) {
      var r = form.getBoundingClientRect();
      form.style.setProperty('--fy', (((e.clientX - r.left) / r.width - .5) * 6).toFixed(2));
      form.style.setProperty('--fx', (-((e.clientY - r.top) / r.height - .5) * 6).toFixed(2));
    });
    form.addEventListener('pointerleave', function () { form.style.setProperty('--fy', 0); form.style.setProperty('--fx', 0); });
  }
})();

/* ---- Ürün ekran galerisi: tıklama / ok / klavye / kaydırma (swipe) ---- */
(function () {
  'use strict';
  var gal = document.querySelector('.gal');
  if (!gal) return;
  var slides = [].slice.call(gal.querySelectorAll('.gal-slide'));
  var tabs = [].slice.call(gal.querySelectorAll('.gal-tab'));
  var prev = gal.querySelector('.gal-prev'), next = gal.querySelector('.gal-next');
  var stage = gal.querySelector('.gal-stage');
  var n = slides.length, cur = 0;
  function go(i) {
    cur = Math.max(0, Math.min(n - 1, i));
    slides.forEach(function (s, k) {
      var o = k - cur;
      s.classList.toggle('is-active', o === 0);
      s.classList.toggle('is-prev', o === -1);
      s.classList.toggle('is-next', o === 1);
    });
    tabs.forEach(function (t, k) {
      var on = k === cur;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on && t.scrollIntoView && t.parentNode.scrollWidth > t.parentNode.clientWidth) t.parentNode.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' });
    });
    if (prev) prev.disabled = cur === 0;
    if (next) next.disabled = cur === n - 1;
  }
  slides.forEach(function (s, k) { s.addEventListener('click', function () { if (k !== cur) go(k); }); });
  tabs.forEach(function (t, k) { t.addEventListener('click', function () { go(k); }); });
  if (prev) prev.addEventListener('click', function () { go(cur - 1); });
  if (next) next.addEventListener('click', function () { go(cur + 1); });
  gal.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(cur - 1); } else if (e.key === 'ArrowRight') { go(cur + 1); }
  });
  var x0 = null;
  stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
  go(0);
})();
