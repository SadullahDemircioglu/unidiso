/* Unidiso — demo talebi API'si
   POST /api/demo  → e-posta (SMTP) + isteğe bağlı Telegram / Slack bildirimi
   GET  /api/health
   Ortam değişkenleri: .env.example dosyasına bakın. */
import express from 'express';
import nodemailer from 'nodemailer';

const {
  PORT = 3000,
  SMTP_HOST, SMTP_PORT = '587', SMTP_SECURE = 'false', SMTP_USER, SMTP_PASS,
  MAIL_TO = 'info@unidiso.com', MAIL_FROM,
  TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SLACK_WEBHOOK_URL,
  ALLOWED_ORIGIN = '*'
} = process.env;

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));

// CORS (site ile aynı domain'de nginx arkasındaysa gerekmez; yine de zararsız)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Basit rate limit: IP başına 10 dk'da en fazla 5 istek
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter(t => now - t < win);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 5;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (!v.some(t => now - t < 600000)) hits.delete(k); }, 600000).unref();

const transporter = SMTP_HOST ? nodemailer.createTransport({
  host: SMTP_HOST, port: Number(SMTP_PORT), secure: SMTP_SECURE === 'true',
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
}) : null;

const clean = (v, max = 500) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

app.get('/api/health', (_req, res) => res.json({ ok: true, mail: !!transporter }));

app.post('/api/demo', async (req, res) => {
  const ip = req.ip;
  if (limited(ip)) return res.status(429).json({ ok: false, error: 'rate_limited' });

  const b = req.body || {};
  // Honeypot: gerçek kullanıcı bu alanı doldurmaz
  if (b.website) return res.json({ ok: true });

  const name = clean(b.name, 120), email = clean(b.email, 160), org = clean(b.org, 160),
        role = clean(b.role, 120), product = clean(b.product, 80), lang = clean(b.lang, 5) || 'tr';
  const message = String(b.message ?? '').trim().slice(0, 4000);
  if (!name || !email || !org || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ ok: false, error: 'invalid' });

  const when = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  const lines = [
    `Ad Soyad: ${name}`, `E-posta: ${email}`, `Kurum: ${org}`,
    role ? `Görev: ${role}` : null, `Ürün: ${product || '-'}`, `Dil: ${lang}`,
    `Tarih: ${when}`, `IP: ${ip}`, '', 'Mesaj:', message || '-'
  ].filter(v => v !== null);
  const text = lines.join('\n');
  const html = `<h2 style="font-family:sans-serif">Yeni demo talebi — ${esc(product || 'Ürün seçilmedi')}</h2>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
${[['Ad Soyad', name], ['E-posta', email], ['Kurum', org], ['Görev', role || '-'], ['Ürün', product || '-'], ['Dil', lang], ['Tarih', when]]
  .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join('')}
</table><p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${esc(message || '-')}</p>`;

  const jobs = [];
  if (transporter) {
    jobs.push(transporter.sendMail({
      from: MAIL_FROM || SMTP_USER, to: MAIL_TO, replyTo: email,
      subject: `Demo talebi — ${name} (${org})${product ? ' · ' + product : ''}`,
      text, html
    }));
  }
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    jobs.push(fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: `🎓 Yeni demo talebi\n\n${text}` })
    }));
  }
  if (SLACK_WEBHOOK_URL) {
    jobs.push(fetch(SLACK_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `🎓 *Yeni demo talebi*\n\`\`\`${text}\`\`\`` }) }));
  }

  const results = await Promise.allSettled(jobs);
  const failed = results.filter(r => r.status === 'rejected');
  failed.forEach(r => console.error('[demo] bildirim hatası:', r.reason?.message || r.reason));
  console.log(`[demo] ${when} ${name} <${email}> ${org} ${product || '-'} (${jobs.length - failed.length}/${jobs.length} ok)`);

  if (jobs.length && failed.length === jobs.length) return res.status(502).json({ ok: false, error: 'delivery_failed' });
  res.json({ ok: true });
});

app.use((_req, res) => res.status(404).json({ ok: false }));
app.listen(PORT, () => console.log(`unidiso-api :${PORT} (mail: ${transporter ? SMTP_HOST : 'kapalı'})`));
