#!/usr/bin/env node
/* Unidiso — statik site üretici.
   content/site.tr.json ve content/site.en.json → HTML sayfaları.
   Çalıştır: node build.js   (bağımlılık yok) */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
// CSS/JS URL'lerine içerik hash'i ekle: deploy sonrası CDN/tarayıcı önbelleği eski dosyayı sunmasın
const crypto = require('crypto');
const ver = (rel) => crypto.createHash('md5').update(fs.readFileSync(path.join(__dirname, rel))).digest('hex').slice(0, 8);
const ASSET_V = {};
['css/main.css', 'css/effects.css', 'css/depth.css', 'js/main.js', 'js/depth.js'].forEach(f => { ASSET_V[f] = ver(f); });
const asset = (f) => `/${f}?v=${ASSET_V[f]}`;
const PRODUCT_IMG_DIR = path.join(ROOT, 'assets', 'img', 'products');

const ICONS = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><circle cx="17.5" cy="17.5" r="3.5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14h3M13 14h3M8 18h3"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>',
  megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 6v12"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5a5 5 0 0 1 6 5"/></svg>',
  door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5a2 2 0 0 1 2-2h8v18"/><path d="M14 3h4a2 2 0 0 1 2 2v16M2 21h20M11 12h.01"/></svg>',
};

const SYMBOL = '<svg viewBox="0 0 60 60" aria-hidden="true"><rect x="0" y="0" width="27" height="27" rx="3" fill="currentColor"/><rect x="33" y="0" width="27" height="27" rx="3" fill="currentColor"/><rect x="0" y="33" width="27" height="27" rx="3" fill="currentColor"/><circle cx="46.5" cy="46.5" r="13.5" fill="#5EEAD4"/></svg>';
const AURORA = '<div class="grid-bg"></div><div class="aurora"><i class="beam-1"></i><i class="beam-2"></i><i class="glow"></i></div><div class="grain"></div>';

const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

let LANG = 'tr';
let SITE = null;

/* ---------- Mockup'lar (gerçek ekran görüntüsü yoksa) ---------- */
function mockFor(p, compact) {
  const icon = p.icon;
  if (icon === 'calendar') {
    const days = LANG === 'tr' ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    let blocks = [[1,1,2,'Veri Yapıları','D-204'],[1,4,2,'Fizik II','A-101'],[2,2,3,'Mikroekonomi','B-12'],[3,1,2,'Lineer Cebir','D-204'],[3,5,2,'İstatistik','C-301'],[4,2,2,'Algoritma','Lab-2'],[4,5,1,'Seminer','Konf.'],[5,1,3,'Anayasa Hukuku','H-110'],[5,5,2,'Veri Yapıları','D-204']];
    if (LANG === 'en') {
      const tr = {'Veri Yapıları':'Data Structures','Fizik II':'Physics II','Mikroekonomi':'Microeconomics','Lineer Cebir':'Linear Algebra','İstatistik':'Statistics','Algoritma':'Algorithms','Seminer':'Seminar','Anayasa Hukuku':'Const. Law'};
      blocks = blocks.map(([d,r,n,t,c]) => [d,r,n,tr[t]||t,c]);
    }
    const cells = blocks.map(([d,r,n,t,c], i) => `<div style="grid-column:${d};grid-row:${r}/span ${n};background:rgba(94,234,212,${i%3===0?'.9':i%3===1?'.55':'.32'});color:#0B1F1D;border-radius:6px;padding:5px 7px;font-size:10px;font-weight:700;line-height:1.2;overflow:hidden"><span style="display:block">${e(t)}</span><span style="font-weight:500;opacity:.75">${c}</span></div>`).join('');
    const hours = [9,10,11,12,13,14,15].map(h => `<span style="height:34px;display:block;font-size:9px;color:var(--muted-dark)">${h}:00</span>`).join('');
    return `<div class="mock-main" style="grid-column:1/-1;padding:16px">
          <div class="mock-title"><strong>D-plan</strong><em>${LANG==='tr'?'2026 Güz · 0 çakışma':'Fall 2026 · 0 clashes'}</em></div>
          <div style="display:grid;grid-template-columns:36px repeat(5,1fr);gap:6px">
            <div></div>${days.map(d => `<div style="font-size:10px;font-weight:700;color:var(--muted-dark);padding-bottom:2px">${d}</div>`).join('')}
            <div style="display:grid;grid-auto-rows:34px">${hours}</div>
            <div style="grid-column:2/-1;display:grid;grid-template-columns:repeat(5,1fr);grid-auto-rows:34px;gap:6px;background-image:linear-gradient(var(--line-dark) 1px,transparent 1px);background-size:100% 40px">${cells}</div>
          </div>
        </div>`;
  }
  if (icon === 'ticket') {
    const rows = [['#4821','Wi‑Fi erişimi','BT','2s'],['#4820','Transkript talebi','Öğrenci İşleri','5s'],['#4819','Projeksiyon arızası','Teknik','1s']];
    return `<div class="mock-main" style="grid-column:1/-1;padding:16px">
          <div class="mock-title"><strong>Ticket</strong><em>SLA %97</em></div>
          <div class="kpis"><div class="kpi"><small>Açık</small><strong>38</strong></div><div class="kpi"><small>Bugün çözülen</small><strong>112</strong></div><div class="kpi"><small>Ort. süre</small><strong>3s 40d</strong></div></div>
          <div class="rows">${rows.map(([a,b,c,d]) => `<div class="row"><s>${a} ${b}</s><span>${c}</span><span></span><em>${d}</em></div>`).join('')}</div>
        </div>`;
  }
  const side = LANG === 'tr' ? ['Panel','Öğrenci İşleri','İnsan Kaynakları','Satın Alma','Bütçe','Raporlar'] : ['Dashboard','Student Affairs','HR','Procurement','Budget','Reports'];
  const title = p.name.includes(' – ') ? p.name.split(' – ').pop() : p.name;
  const bars = [40,62,55,78,70,88,64,92,75,84];
  const rows = LANG === 'tr'
    ? [['Mühendislik Fak.','1.284','%91','▲ 3'],['İktisadi İdari Bil.','962','%88','▲ 1'],['Fen-Edebiyat','1.105','%84','▼ 2']]
    : [['Engineering','1,284','91%','▲ 3'],['Economics','962','88%','▲ 1'],['Arts & Sciences','1,105','84%','▼ 2']];
  const kp = LANG === 'tr'
    ? [['Aktif öğrenci','14.820','+4,2%'],['Bu dönem kayıt','3.112','+6,8%'],['Bütçe kullanımı','%71','plan']]
    : [['Active students','14,820','+4.2%'],['Term enrolments','3,112','+6.8%'],['Budget used','71%','on plan']];
  return `<div class="mock-side">${side.map((s,i) => `<span class="${i===0?'on':''}">${s}</span>`).join('')}</div>
      <div class="mock-main">
        <div class="mock-title"><strong>${e(title)}</strong><em>${LANG==='tr'?'Canlı':'Live'}</em></div>
        <div class="kpis">${kp.map(([a,b,c]) => `<div class="kpi"><small>${a}</small><strong>${b}</strong><u>${c}</u></div>`).join('')}</div>
        ${compact ? '' : '<div class="chart">' + bars.map(h => `<i style="height:${h}%"></i>`).join('') + '</div>'}
        <div class="rows">${rows.map(([a,b,c,d]) => `<div class="row"><s>${a}</s><span>${b}</span><span>${c}</span><em>${d}</em></div>`).join('')}</div>
      </div>`;
}

function frame(p, compact) {
  const img = path.join(PRODUCT_IMG_DIR, `${p.slug}.png`);
  const body = fs.existsSync(img)
    ? `<img src="/assets/img/products/${p.slug}.png" alt="${e(p.name)}" loading="lazy">`
    : `<div class="mock">${mockFor(p, compact)}</div>`;
  return `<div class="frame"><div class="frame-bar"><i></i><i></i><i></i><b>${e(p.name)}</b></div>${body}<div class="sheen"></div></div>`;
}

/* ---------- Ekran galerisi (slug.png, slug-2.png, slug-3.png) ---------- */
function galleryImgs(p) {
  const out = [];
  [`${p.slug}.png`, `${p.slug}-2.png`, `${p.slug}-3.png`, `${p.slug}-4.png`].forEach(f => {
    if (fs.existsSync(path.join(PRODUCT_IMG_DIR, f))) out.push('/assets/img/products/' + f);
  });
  return out;
}
function gallery(p, captions) {
  const imgs = galleryImgs(p);
  if (imgs.length < 2) return '';
  const T = UI_TXT();
  const slides = imgs.map((src, i) => `<figure class="gal-slide${i === 0 ? ' is-active' : ''}" data-i="${i}"><div class="frame"><div class="frame-bar"><i></i><i></i><i></i><b>${e(p.name)}</b></div><img src="${src}" alt="${e(p.name)} ${i + 1}" loading="eager" decoding="async"></div></figure>`).join('');
  const tabs = imgs.map((_, i) => `<button type="button" class="gal-tab${i === 0 ? ' is-on' : ''}" role="tab" aria-selected="${i === 0}" data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${e(captions[i] || p.name)}</button>`).join('');
  return `<section class="gal band-dark" data-n="${imgs.length}">
  <div class="gal-sticky">
    ${AURORA.replace('class="aurora"', 'class="aurora" style="opacity:.5"')}
    <div class="container"><div class="sec-head"><h2>${T.screens_title}</h2><p class="muted">${T.screens_lead}</p></div></div>
    <div class="gal-stage">${slides}
      <button type="button" class="gal-arrow gal-prev" aria-label="${T.prev}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button type="button" class="gal-arrow gal-next" aria-label="${T.next}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>
    <div class="container"><div class="gal-tabs" role="tablist">${tabs}</div></div>
  </div>
</section>`;
}
function UI_TXT() {
  return LANG === 'tr'
    ? { screens_title: 'Ürünün içinden', screens_lead: 'Ekranlar arasında geçmek için görsele veya alttaki başlıklara tıklayın.', prev: 'Önceki ekran', next: 'Sonraki ekran' }
    : { screens_title: 'Inside the product', screens_lead: 'Click a screen or a title below to switch between screens.', prev: 'Previous screen', next: 'Next screen' };
}

/* ---------- Ekosistem SVG ---------- */
function ecoSvg(products) {
  const W = 560, H = 520, cx = 280, cy = 260, R = 190;
  const out = [`<svg class="eco-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">`];
  out.push(`<circle class="ring" cx="${cx}" cy="${cy}" r="${R}"/><circle class="ring" cx="${cx}" cy="${cy}" r="${Math.round(R*0.55)}" stroke-dasharray="3 6"/>`);
  const n = products.length, pts = [];
  products.forEach((p, i) => {
    const a = -Math.PI/2 + i * 2*Math.PI/n;
    const x = cx + R*Math.cos(a), y = cy + R*Math.sin(a);
    pts.push([x, y, p]);
    out.push(`<path id="lnk-${p.slug}" class="link" d="M${cx} ${cy} L${x.toFixed(1)} ${y.toFixed(1)}"/>`);
  });
  out.push(`<circle class="hub-pulse" cx="${cx}" cy="${cy}" r="44"/><circle class="hub" cx="${cx}" cy="${cy}" r="44"/>`);
  out.push(`<g transform="translate(${cx-16} ${cy-16})">${SYMBOL.replace(/currentColor/g,'#ffffff').replace('<svg viewBox="0 0 60 60"','<svg viewBox="0 0 60 60" width="32" height="32"')}</g>`);
  for (const [x, y, p] of pts) {
    const name = p.name.length > 16 ? p.name.split(' – ')[0] : p.name;
    out.push(`<g class="eco-node" data-slug="${p.slug}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="30"/>` +
      `<g class="ico" transform="translate(-11 -11) scale(.92)">${ICONS[p.icon].replace('<svg ', '<svg width="24" height="24" ')}</g>` +
      `<text y="50">${e(name)}</text></g>`);
  }
  out.push('</svg>');
  return out.join('');
}

/* ---------- Ortak parçalar ---------- */
function head(title, desc) {
  return `<!doctype html>
<html lang="${LANG}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${e(desc)}">
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(desc)}">
<meta property="og:type" content="website">
<link rel="icon" type="image/svg+xml" href="/assets/img/logos/ikon-teal.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/logos/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${asset('css/main.css')}">
<link rel="stylesheet" href="${asset('css/effects.css')}">
<link rel="stylesheet" href="${asset('css/depth.css')}">
</head>
<body>`;
}

function nav(current = '') {
  const S = SITE, P = S.paths, N = S.nav;
  const a = (href, label, key) => `<li><a href="${href}"${key === current ? ' aria-current="page"' : ''}>${label}</a></li>`;
  const links = a(P.home + (LANG === 'tr' ? '#urunler' : '#products'), N.products, 'products') +
                a(P.home + (LANG === 'tr' ? '#neden' : '#why'), N.about, 'about') +
                a(P.contact, N.contact, 'contact');
  return `<header class="nav">
  <div class="container nav-inner">
    <a class="brand" href="${P.home}" aria-label="${S.name}">${SYMBOL}<span class="brand-name">${S.name}<small class="brand-tag">University Digital Solutions</small></span></a>
    <nav aria-label="${N.products}"><ul class="nav-links">${links}</ul></nav>
    <div class="nav-cta">
      <a class="lang" href="${P.other_lang}" hreflang="${LANG === 'tr' ? 'en' : 'tr'}">${P.other_lang_label}</a>
      <a class="btn btn-primary" href="${P.contact}">${N.demo}</a>
      <button class="nav-toggle" aria-label="Menü" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

// Cloudflare Turnstile site key (herkese açık, gizli değil). Yerelde test için
// "her zaman geçer" anahtarı: TURNSTILE_SITEKEY=1x00000000000000000000AA node build.js
const TURNSTILE_SITEKEY = process.env.TURNSTILE_SITEKEY || '0x4AAAAAAFX27_Rqk1g9-T-5';
const ok = v => v != null && String(v).trim() !== '' && !/^TODO/i.test(String(v).trim());
function footer() {
  const S = SITE, F = S.footer, P = S.paths, c = F.contact;
  const prods = S.products.map(p => `<li><a href="${P.products}${p.slug}">${e(p.name)}</a></li>`).join('');
  const comp = F.company_links.map(l => `<li><a href="${l.href}">${e(l.label)}</a></li>`).join('');
  return `<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="${P.home}">${SYMBOL}<span class="brand-name">${S.name}<small class="brand-tag">University Digital Solutions</small></span></a>
        <p>${e(F.about)}</p>
      </div>
      <div><h4>${F.cols.products}</h4><ul>${prods}</ul></div>
      <div><h4>${F.cols.company}</h4><ul>${comp}</ul></div>
      <div><h4>${F.cols.contact}</h4><ul>
        ${ok(c.email) ? `<li><a href="mailto:${e(c.email)}">${e(c.email)}</a></li>` : ''}
        ${ok(c.phone) ? `<li><a href="tel:${e(c.phone).replace(/[^+\d]/g,'')}">${e(c.phone)}</a></li>` : ''}
        ${ok(c.address) ? `<li>${e(c.address)}</li>` : ''}
        ${ok(c.linkedin) ? `<li><a href="${e(c.linkedin)}" rel="noopener">LinkedIn</a></li>` : ''}
      </ul></div>
    </div>
    <div class="footer-bottom"><span>© 2026 ${e(F.copyright)}</span><a class="lang" href="${P.other_lang}">${S.ui.lang_switch}</a></div>
  </div>
</footer>
<script src="${asset('js/main.js')}" defer></script>
<script src="${asset('js/depth.js')}" defer></script>
</body>
</html>`;
}

/* ---------- Sayfalar ---------- */
function pageHome() {
  const S = SITE, H = S.hero, P = S.paths;
  const featured = S.products.find(p => p.featured);
  const cards = S.products.map((p, idx) => {
    const cls = (p.featured ? 'product featured' : 'product') + ' reveal-3d';
    const inner = p.featured ? frame(p, true) : '';
    return `<a class="${cls}" style="--i:${idx}" href="${P.products}${p.slug}">
  <span class="product-icon">${ICONS[p.icon]}</span>
  <span class="tag">${e(p.tag)}</span>
  <h3>${e(p.name)}</h3>
  <p>${e(p.short)}</p>
  <span class="link">${S.ui.learn}</span>
  ${inner}
</a>`;
  }).join('');
  const why = S.why.items.map((w, k) => `<article class="reveal-3d" style="--i:${k}"><h3>${e(w.title)}</h3><p>${e(w.text)}</p></article>`).join('');
  const metricItems = S.metrics.items.filter(m => ok(m.value));
  const metrics = metricItems.map((m, k) => {
    const v = String(m.value).replace(/[.,]/g, '');
    const mt = v.match(/^(\d+)(.*)$/);
    const strong = mt ? `<strong data-count="${mt[1]}" data-suffix="${e(mt[2])}">0</strong>` : `<strong>${e(m.value)}</strong>`;
    return `<div class="metric reveal" style="--i:${k}">${strong}<span>${e(m.label)}</span></div>`;
  }).join('');
  const logoItems = S.logos.items.filter(ok);
  const logos = logoItems.map(u => `<span class="uni">${e(u)}</span>`).join('');
  const anchors = LANG === 'tr' ? ['urunler', 'neden'] : ['products', 'why'];
  const chips = (H.chips || []).map((c, i) => `<div class="chip chip-${i+1}"><span class="dot">${ICONS[c.icon]}</span><span><b>${e(c.b)}</b><small>${e(c.s)}</small></span></div>`).join('');
  const ecoList = S.products.map(p => `<a href="${P.products}${p.slug}" data-slug="${p.slug}"><span class="product-icon">${ICONS[p.icon]}</span>${e(p.name)}</a>`).join('');
  return head(`${S.name} — ${S.tagline}`, S.meta_desc) + nav() + `
<main>
<section class="hero">
  ${AURORA}<canvas class="net" aria-hidden="true"></canvas><div class="orbit" aria-hidden="true"><i></i><i></i></div>
  <div class="container hero-grid">
    <div>
      <h1>${e(H.title)}</h1>
      <p class="hero-lead">${e(H.lead)}</p>
      <div class="hero-actions">
        <a class="btn btn-white" href="${P.contact}">${H.primary}</a>
        <a class="btn btn-ghost" href="#${anchors[0]}">${H.secondary}</a>
      </div>
      <p class="hero-note"><i></i>${e(H.note)}</p>
    </div>
    <div class="hero-visual"><div class="hero-stage">${frame(featured)}${chips}</div></div>
  </div>
</section>

${logoItems.length ? `<div class="logos" aria-label="${e(S.logos.label)}"><div class="logos-inner"><span>${e(S.logos.label)}</span>${logos}<span>${e(S.logos.label)}</span>${logos}</div></div>` : ''}

<section class="section band-dark" id="${anchors[0]}">
  <div class="container">
    <div class="sec-head"><h2>${e(S.products_head.title)}</h2><p class="muted">${e(S.products_head.lead)}</p></div>
    <div class="products">${cards}</div>
  </div>
</section>

<section class="section band-dark">
  ${AURORA.replace('class="aurora"', 'class="aurora" style="opacity:.45"')}
  <div class="container eco">
    <div>
      <div class="sec-head"><h2>${e(S.eco.title)}</h2><p class="muted">${e(S.eco.lead)}</p></div>
      <div class="eco-list">${ecoList}</div>
    </div>
    <div>${ecoSvg(S.products)}</div>
  </div>
</section>

<section class="section band-light" id="${anchors[1]}">
  <div class="container">
    <div class="sec-head"><h2>${e(S.why.title)}</h2><p class="muted">${e(S.why.lead)}</p></div>
    <div class="why">${why}</div>
  </div>
</section>

${metricItems.length >= 2 ? `<section class="section band-dark">
  <div class="container">
    <div class="sec-head"><h2>${e(S.metrics.title)}</h2></div>
    <div class="metrics">${metrics}</div>
  </div>
</section>` : ''}

${ok(S.quote.text) && ok(S.quote.name) ? `<section class="section band-light">
  <div class="container">
    <div class="quote">
      <blockquote>“${e(S.quote.text)}”</blockquote>
      <cite><b>${e(S.quote.name)}</b>${e(S.quote.role)}</cite>
    </div>
  </div>
</section>` : ''}

<section class="section band-white">
  <div class="container">
    <div class="cta">
      ${AURORA}
      <div><h2>${e(S.cta.title)}</h2><p>${e(S.cta.text)}</p></div>
      <div class="actions"><a class="btn btn-white" href="${P.contact}">${S.cta.primary}</a><a class="btn btn-ghost" href="${P.contact}">${S.cta.secondary}</a></div>
    </div>
  </div>
</section>
</main>
` + footer();
}

function pageProduct(p) {
  const S = SITE, P = S.paths, U = S.ui;
  const feats = p.features.map((f, k) => `<div class="feature reveal reveal-3d" style="--i:${k}"><span class="product-icon">${ICONS[p.icon]}</span><h3>${e(f.title)}</h3><p>${e(f.text)}</p></div>`).join('');
  const others = S.products.filter(o => o.slug !== p.slug).map(o => `<a href="${P.products}${o.slug}"><span class="product-icon">${ICONS[o.icon]}</span>${e(o.name)}</a>`).join('');
  const bullets = (p.detail.bullets || []).filter(ok).map(b => `<li>${e(b)}</li>`).join("");
  const contactQ = `${P.contact}?product=${p.slug}`;
  return head(`${p.name} — ${S.name}`, p.short) + nav('products') + `
<main>
<section class="page-hero">
  ${AURORA}
  <div class="container">
    <div class="crumbs"><a href="${P.home}">${S.name}</a><span>/</span><a href="${P.home}#${LANG === 'tr' ? 'urunler' : 'products'}">${U.breadcrumb_products}</a><span>/</span><span>${e(p.name)}</span></div>
    <h1>${e(p.page_title)}</h1>
    <p class="lead">${e(p.lead)}</p>
    <div class="hero-actions"><a class="btn btn-white" href="${contactQ}">${U.product_cta}</a></div>
  </div>
</section>
<div class="showcase"><div class="container">${frame(p)}</div></div>

<section class="section band-light" style="padding-top:0">
  <div class="container">
    <div class="sec-head"><h2>${U.features_title}</h2></div>
    <div class="features">${feats}</div>
  </div>
</section>

${gallery(p, (p.screens || []))}

<section class="section band-white">
  <div class="container split">
    <div class="reveal"><h2>${e(p.detail.title)}</h2><p>${e(p.detail.text)}</p>${bullets ? `<ul>${bullets}</ul>` : ""}</div>
    <div class="split-visual" data-parallax>${frame(p, true)}<div class="split-card c1"><b>${e(p.features[0].title)}</b><small>${e(p.features[0].text)}</small></div><div class="split-card c2"><b>${e(p.features[1].title)}</b><small>${e(p.features[1].text)}</small></div></div>
  </div>
</section>

<section class="section band-light">
  <div class="container">
    <div class="sec-head"><h2>${U.other_products}</h2></div>
    <div class="other-products reveal-stagger">${others}</div>
  </div>
</section>

<section class="section band-white">
  <div class="container">
    <div class="cta">
      ${AURORA}
      <div><h2>${e(S.cta.title)}</h2><p>${e(S.cta.text)}</p></div>
      <div class="actions"><a class="btn btn-white" href="${contactQ}">${S.cta.primary}</a></div>
    </div>
  </div>
</section>
</main>
` + footer();
}

function pageContact() {
  const S = SITE, C = S.contact, F = C.fields, P = S.paths, fc = S.footer.contact;
  const opts = `<option value="">${F.any}</option>` + S.products.map(p => `<option value="${p.slug}">${e(p.name)}</option>`).join('');
  return head(`${C.title} — ${S.name}`, C.lead) + nav('contact') + `
<main>
<section class="page-hero">${AURORA}<div class="container"><h1>${e(C.title)}</h1><p class="lead">${e(C.lead)}</p></div></section>
<section class="section band-light">
  <div class="container contact">
    <div class="contact-info">
      <h2>${S.name}</h2>
      <p>${e(S.footer.about)}</p>
      <dl>
        ${ok(fc.email) ? `<div><dt>${C.info.email}</dt><dd><a href="mailto:${e(fc.email)}">${e(fc.email)}</a></dd></div>` : ''}
        ${ok(fc.phone) ? `<div><dt>${C.info.phone}</dt><dd><a href="tel:${e(fc.phone).replace(/[^+\d]/g,'')}">${e(fc.phone)}</a></dd></div>` : ''}
        ${ok(fc.address) ? `<div><dt>${C.info.address}</dt><dd>${e(fc.address_full || fc.address)}${ok(fc.map_url) ? `<br><a class="map-link" href="${e(fc.map_url)}" target="_blank" rel="noopener">${C.info.map} ↗</a>` : ''}</dd></div>` : ''}
      </dl>
    </div>
    <form class="form" data-to="${ok(C.form_to) ? e(C.form_to) : e(fc.email)}" data-endpoint="/api/demo" novalidate>
      <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0">
      <div class="form-fields" style="display:grid;gap:14px">
        <div class="form-row">
          <div class="field" data-required><label for="f-name">${F.name}</label><input id="f-name" name="name" type="text" autocomplete="name"><span class="err">${F.required}</span></div>
          <div class="field" data-required><label for="f-email">${F.email}</label><input id="f-email" name="email" type="email" autocomplete="email"><span class="err">${F.required}</span></div>
        </div>
        <div class="form-row">
          <div class="field" data-required><label for="f-org">${F.org}</label><input id="f-org" name="org" type="text" autocomplete="organization"><span class="err">${F.required}</span></div>
          <div class="field"><label for="f-role">${F.role}</label><input id="f-role" name="role" type="text" autocomplete="organization-title"></div>
        </div>
        <div class="field"><label for="f-product">${F.product}</label><select id="f-product" name="product">${opts}</select></div>
        <div class="field"><label for="f-msg">${F.message}</label><textarea id="f-msg" name="message"></textarea></div>
        <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITEKEY}" data-language="${LANG}" data-theme="auto"></div>
        <button class="btn btn-primary" type="submit">${F.submit}</button>
        <p class="form-note">${e(F.note)}</p>
      </div>
      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
      <p class="form-success">${e(F.success)}</p>
      <p class="form-error">${e(F.error || (LANG === "tr" ? "Gönderilemedi. Lütfen tekrar deneyin ya da bize e-posta gönderin." : "Could not send. Please try again or email us."))}</p>
    </form>
  </div>
</section>
${fc.lat && fc.lng ? `<section class="map-sec band-white">
  <div class="container">
    <div class="map-wrap reveal">
      <iframe title="${e(S.name)} — ${C.info.address}" src="https://www.google.com/maps?q=${fc.lat},${fc.lng}&z=16&hl=${LANG}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      <div class="map-card">
        <b>${e(S.name)}</b>
        <span>${e(fc.address_full || fc.address)}</span>
        <div class="map-actions"><a class="btn btn-primary" href="https://www.google.com/maps/dir/?api=1&destination=${fc.lat},${fc.lng}" target="_blank" rel="noopener">${C.info.directions}</a><a class="btn btn-ghost" href="${e(fc.map_url)}" target="_blank" rel="noopener">${C.info.map}</a></div>
      </div>
    </div>
  </div>
</section>` : ''}
</main>
<script>
(function(){var q=new URLSearchParams(location.search).get('product');var s=document.getElementById('f-product');if(q&&s){s.value=q;}})();
</script>
` + footer();
}

/* ---------- Üret ---------- */
function write(rel, content) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  console.log('✓', rel);
}

for (const [lang, out] of [['tr', ''], ['en', 'en/']]) {
  LANG = lang;
  SITE = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', `site.${lang}.json`), 'utf8'));
  const prodDir = lang === 'tr' ? 'urunler/' : 'products/';
  const contactFile = lang === 'tr' ? 'iletisim.html' : 'contact.html';
  write(out + 'index.html', pageHome());
  for (const p of SITE.products) write(out + prodDir + p.slug + '.html', pageProduct(p));
  write(out + contactFile, pageContact());
}
