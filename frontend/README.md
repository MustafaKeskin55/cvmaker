# Frontend - React

Bu dizin, acilldesteklazim.com sitesinin frontend kodlarını içerir.

## Proje Yapısı

- `/src` - Kaynak kodlar
  - `/components` - React bileşenleri
    - Her bileşen kendi klasöründe (ör: `/Header`, `/Footer` vb.)
  - `/pages` - Ana sayfalar
  - `/services` - API bağlantı servisleri
  - `/assets` - Statik dosyalar (resimler, fontlar vb.)
  - `/hooks` - Özel React Hook'ları
  - `/utils` - Yardımcı fonksiyonlar

## Kurulum

1. Npm paketlerini kur:
   ```
   npm install
   ```

2. Geliştirme sunucusunu başlat:
   ```
   npm start
   ```

3. Üretim için derleme:
   ```
   npm run build
   ```

## Bileşen Yapısı

Her bileşen kendi klasöründe bulunur ve şu dosyalara sahiptir:
- `index.jsx` - Ana bileşen kodu
- `styles.module.css` - Bileşene özgü CSS

## API Bağlantıları

API bağlantıları için `/services/api.js` dosyası kullanılır:

- `getHeroSection()` - Ana sayfa hero bölümü içeriğini getirir 
- `getServices()` - Hizmetleri listeler
- `sendContactForm()` - İletişim formunu gönderir 