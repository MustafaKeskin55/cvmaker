# Backend - Laravel (PHP) + MySQL

Bu dizin, acilldesteklazim.com sitesinin backend kodlarını içerir.

## Proje Yapısı

- `/app` - Ana uygulama kodları
  - `/Http/Controllers` - API ve admin kontrolörleri
  - `/Models` - Veri modelleri
- `/database` - Migrationlar ve seed dosyaları
- `/routes` - API ve web rotaları
- `/resources` - Blade şablonları (admin paneli için)

## Kurulum

1. Composer paketlerini kur:
   ```
   composer install
   ```

2. `.env` dosyasını yapılandır:
   ```
   cp .env.example .env
   php artisan key:generate
   ```

3. MySQL veritabanını bağla (`.env` içinde ayarla)

4. Migrasyonları çalıştır:
   ```
   php artisan migrate
   ```

5. Geliştirme sunucusunu başlat:
   ```
   php artisan serve
   ```

## API Endpoint'leri

- `GET /api/hero-section` - Ana sayfa hero bölümü içeriğini getirir
- `GET /api/services` - Hizmetleri listeler
- `GET /api/contact` - İletişim bilgilerini getirir

## Admin Paneli

Admin paneli `/admin` altında erişilebilir. Giriş yapmak için:

- Kullanıcı adı: admin@acilldesteklazim.com
- Şifre: İlk kurulumda ayarlanır 