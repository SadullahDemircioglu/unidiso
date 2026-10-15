(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Nav: scroll'da cam pill, mobilde aç/kapa
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    var toggle = nav.querySelector('.nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.querySelectorAll('.nav-links a').forEach(function (a) {
        a.addEventListener('click', function () { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); });
      });
    }
  }

  // ---- Spotlight: kartlarda işaretçiyi takip eden ışık
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.product, .feature').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  // ---- Scroll reveal: görünür olunca sırayla
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else { revealEls.forEach(function (el) { el.classList.add('is-in'); }); }

  // ---- Sayaçlar: data-count ile artan rakam
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var fmt = function (n) { return n.toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'tr-TR'); };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseFloat(el.getAttribute('data-count')), suffix = el.getAttribute('data-suffix') || '';
        cio.unobserve(el);
        if (reduce) { el.textContent = fmt(target) + suffix; return; }
        var start = null, dur = 1600;
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(target * eased)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  // ---- Ekosistem: düğüm ↔ liste eşlemesi, veri paketleri
  var eco = document.querySelector('.eco');
  if (eco) {
    var nodes = eco.querySelectorAll('.eco-node'), items = eco.querySelectorAll('.eco-list a');
    var setOn = function (slug) {
      nodes.forEach(function (n) { n.classList.toggle('is-on', n.getAttribute('data-slug') === slug); });
      items.forEach(function (i) { i.classList.toggle('is-on', i.getAttribute('data-slug') === slug); });
    };
    nodes.forEach(function (n) {
      n.addEventListener('mouseenter', function () { setOn(n.getAttribute('data-slug')); });
      n.addEventListener('click', function () { var a = eco.querySelector('.eco-list a[data-slug="' + n.getAttribute('data-slug') + '"]'); if (a) location.href = a.href; });
    });
    items.forEach(function (i) { i.addEventListener('mouseenter', function () { setOn(i.getAttribute('data-slug')); }); });
    // Paketler: hub'dan düğümlere hareket eden noktalar
    if (!reduce) {
      var svg = eco.querySelector('.eco-svg'), links = eco.querySelectorAll('.eco-svg .link');
      var NS = 'http://www.w3.org/2000/svg';
      links.forEach(function (ln, idx) {
        var dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('r', '3'); dot.setAttribute('class', 'packet');
        var anim = document.createElementNS(NS, 'animateMotion');
        anim.setAttribute('dur', (4 + idx * 0.6) + 's'); anim.setAttribute('repeatCount', 'indefinite'); anim.setAttribute('begin', (idx * 0.5) + 's');
        var mp = document.createElementNS(NS, 'mpath');
        mp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + ln.id);
        anim.appendChild(mp); dot.appendChild(anim); svg.appendChild(dot);
      });
    }
  }

  // ---- Demo formu
  var form = document.querySelector('.form');
  if (form) {
    var to = form.getAttribute('data-to') || '';
    var lang = document.documentElement.lang || 'tr';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('.field[data-required]').forEach(function (f) {
        var input = f.querySelector('input,textarea,select');
        var ok = !!input.value.trim();
        if (ok && input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        f.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });
      if (!valid) { form.querySelector('.is-invalid input, .is-invalid textarea').focus(); return; }
      var endpoint = form.getAttribute('data-endpoint');
      var data = new FormData(form), payload = {}, lines = [];
      data.forEach(function (v, k) { payload[k] = v; });
      payload.lang = lang;
      var labels = {};
      form.querySelectorAll('label[for]').forEach(function (l) { var i = document.getElementById(l.getAttribute('for')); if (i) labels[i.name] = l.textContent; });
      Object.keys(payload).forEach(function (k) { if (payload[k] && k !== 'website' && k !== 'lang') lines.push((labels[k] || k) + ': ' + payload[k]); });
      var subject = lang === 'en' ? 'Demo request — Unidiso' : 'Demo talebi — Unidiso';
      var fallback = function () {
        if (to) window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
        form.classList.add('is-sent');
      };
      var btn = form.querySelector('button[type=submit]');
      if (!endpoint || !window.fetch) return fallback();
      form.classList.remove('is-error'); btn.disabled = true;
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (j) { if (!j.ok) throw new Error('fail'); form.classList.add('is-sent'); })
        .catch(function (err) {
          btn.disabled = false;
          // API yoksa (404) e-posta istemcisine düş; sunucu hatasında uyarı göster
          if (err === 404) return fallback();
          form.classList.add('is-error');
        });
    });
    form.querySelectorAll('input,textarea,select').forEach(function (i) {
      i.addEventListener('input', function () { i.closest('.field').classList.remove('is-invalid'); });
    });
  }
})();
