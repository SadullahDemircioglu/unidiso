# Unidiso — Web Sitesi

Statik site: saf HTML + CSS + az JS. Framework yok, build aracı yok.

## Yapı
```
content/site.tr.json   ← Türkçe tüm metinler (hero, ürünler, iletişim, footer)
content/site.en.json   ← İngilizce
build.js               ← JSON'dan HTML üretir (Node, bağımlılık yok)
css/tokens.css         ← renk, tipografi, boşluk tokenları (DESIGN.md'den)
css/main.css           ← yapı ve bileşen stilleri
css/effects.css        ← aurora, ışık, hareket, spotlight efektleri
js/main.js             ← nav, mobil menü, demo formu
assets/img/logos/      ← logo SVG'leri
assets/img/products/   ← ürün ekran görüntüleri (<slug>.png)
index.html, urunler/*.html, iletisim.html   ← üretilen TR sayfalar
en/index.html, en/products/*.html, en/contact.html ← üretilen EN sayfalar
Dockerfile, nginx.conf ← web (nginx) imajı
api/                   ← demo formu backend'i (Node + Nodemailer)
docker-compose.yml     ← Dokploy: web + api
```

## İçerik değiştirmek
1. `content/site.tr.json` ve/veya `content/site.en.json` düzenle.
2. `node build.js` (veya `npm run build`) çalıştır. HTML dosyaları yeniden üretilir.

`TODO:` ile başlayan değerler henüz doldurulmamış içeriktir.

## Ürün ekran görüntüsü eklemek
`assets/img/products/<slug>.png` olarak koy (slug'lar: `erp`, `d-plan`, `ascore`, `crm`, `ticket`,
`personel-verimliligi`, `derslik-verimliligi`; EN için aynı dosyalar kullanılır, EN slug'ları
`staff-efficiency` ve `room-efficiency` olanlar için dosyayı iki adla kopyala). Görsel varsa
build.js CSS mockup yerine görseli kullanır. Önerilen: 1600px+ genişlik, tarayıcı çerçevesiz.

## Yerelde görmek
```
npm run serve
```
`http://localhost:8080` — sayfalar kök yola göre (`/css/...`) bağlı olduğu için dosyayı doğrudan
çift tıklayarak değil, bir sunucu üzerinden açın.

## Demo formu (api/)
Form `POST /api/demo` ile `api/` klasöründeki küçük Node servisine gider; servis SMTP ile
`MAIL_TO` adresine e-posta atar, isteğe bağlı Telegram/Slack bildirimi gönderir. Honeypot alanı
ve IP başına rate limit vardır. API erişilemezse (404) form `mailto:` ile e-posta istemcisine düşer.

Ortam değişkenleri: `api/.env.example`. Yerelde denemek için:
```
cd api && npm install && SMTP_HOST=... SMTP_USER=... SMTP_PASS=... npm start
```

## Dokploy
Repo kökündeki `docker-compose.yml` ile **Compose** servisi olarak ekleyin; `web` (nginx, 80) ve `api`
(Node, 3000) birlikte kalkar, nginx `/api/` yolunu `api` konteynerine yönlendirir. Ortam değişkenlerini
Dokploy'daki Environment bölümüne girin. Domain: `/` TR, `/en/` EN.
