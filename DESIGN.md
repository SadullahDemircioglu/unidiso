# Üniversite Çözümleri — Tasarım Sistemi (Huly temelli)
> Aurora through a midnight observatory — koyu hero'da mor→turuncu ışık huzmesi, altında koyu/açık bantlarla dönüşen ürün bölümleri.

**Tema:** mixed (koyu hero + dönüşümlü açık/koyu bölümler)
**Kaynak:** https://styles.refero.design/style/d018e81d-6bb6-4445-86d7-39fd6be7e74d

## Renkler

| Token | Değer | Rol |
|---|---|---|
| `--color-obsidian-canvas` | `#303236` | Koyu bölüm zemini |
| `--color-void` | `#090a0c` | Hero zemini, en derin yüzey |
| `--color-charcoal-card` | `#111111` | Koyu kart yüzeyi |
| `--color-slate-edge` | `#4a4b50` | Koyu yüzeyde ince kenarlık |
| `--color-iron-veil` | `#6b6c6d` | Etiket/arka plan tonu |
| `--color-smoke` | `#95979e` | İkon, ikincil metin |
| `--color-ash` | `#a9a9aa` | Üçüncül metin |
| `--color-frost` | `#d1d1d1` | Açık temada kenarlık |
| `--color-linen` | `#e5e5e7` / `#f6f6f6` | Açık bölüm zemini (ikincil) |
| `--color-snow` | `#ffffff` | Açık bölüm zemini |
| `--color-electric-iris` | `#5683da` | Birincil aksiyon, aktif nav, aurora soğuk ucu |
| `--color-ember-pulse` | `#ff8964` | İkincil vurgu, aurora sıcak ucu, bildirim noktası |
| `--color-molasses` | `#5a250a` | Koyu bağlamda kenarlık/ikon tonu |

Kural: bir ekranda tek `electric-iris` birincil aksiyon; `ember-pulse` sadece etiket, nokta ve gradient durağı olarak. Üçüncü vurgu rengi yok.

## Gradient

- **Aurora (yalnız hero):** `linear-gradient(180deg, #5683da99, #ff8964, #ffffff)` — dar dikey huzme, sayfa genişliğinin %15–25'i. Tüm arka planı kaplamaz.
- **Radial sunburst (kart köşeleri):** `radial-gradient(#ffaa81, #ffda9f, transparent)` 200–400px, %30–50 opaklık.
- **Bölüm geçişi (nadir):** beyaz → `#d5d8f6`.

## Tipografi

- **Display:** Esbuild (yerine Sora / General Sans). 28px üstü; 80px/0.9/-4px, 32px/1/-1.6px. Ağırlık 500–600.
- **UI/Body:** Inter. Body 14px/1.5/-0.14px, body-lg 16px, subheading 18px, heading 24px/1.25.
- Inter'i display boyutlarında kullanma; Esbuild'i 28px altında kullanma.

## Boşluk & Şekil

- Base 4px, max-width 1200px, section gap 96px, kart padding 24px, element gap 12px.
- Radius: butonlar/etiketler 9999px, kartlar 12px, paneller 30px, inputlar 4px.
- Koyu kartlarda gölge yok → 1px `#4a4b50` kenarlık. Ürün ekran görüntüsü çerçevesi: `rgba(0,0,0,.5) 0 6px 25px`.

## Bileşenler

- **Primary pill:** `#5683da` dolgu, beyaz, Inter 14/500, 12px 24px.
- **Ghost pill:** şeffaf, 1px kenarlık, beyaz metin.
- **White pill (hero):** beyaz dolgu, `#090a0c` metin — "Demo talep et" için.
- **Feature card:** `#111111`, 12px radius, 24px padding, 1px kenarlık, köşede opsiyonel radial glow.
- **Tag/chip:** 9999px, 4px 10px, Inter 11/500, kategori rengi %12 opaklık zemin.
- **Product screenshot frame:** 12px radius + yumuşak siyah gölge; aurora üzerinde yüzer.
- **Nav:** hero üzerinde şeffaf, scroll'da backdrop-blur ile koyulaşır.

## Sayfa ritmi

Hero (koyu, aurora, ürün ekranı sağ-altta) → logo şeridi → ürün grid (koyu kartlar, 3–4 sütun) → açık bant: çözüm hikâyesi → koyu bant: metrikler/performans → açık bant: referanslar → CTA → footer.

## Yapma

- Aurora'yı tam arka plan yapma; sayfada bir kez.
- Keskin köşeli buton/etiket yok.
- Üçüncü vurgu rengi ekleme.
- Koyu kartlara drop shadow ekleme.
