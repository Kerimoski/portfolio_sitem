# 🚀 Portfolio Hosting Deployment Rehberi

## 📦 Hosting'e Yükleme Adımları

### 1. Build Oluşturma
```bash
npm run build
```

### 2. Hosting'e Yüklenecek Dosyalar
- `dist/` klasöründeki tüm dosyalar
- `public/.htaccess` dosyası (root dizine)

### 3. Hosting Klasör Yapısı
```
public_html/
├── index.html          # dist/index.html
├── assets/             # dist/assets/
├── images/             # public/images/
├── uploads/            # Yüklenen projeler için
├── .htaccess           # public/.htaccess
├── manifest.json       # public/manifest.json
├── robots.txt          # public/robots.txt
└── sitemap.xml         # public/sitemap.xml
```

### 4. Gerekli Hosting Özellikleri
- ✅ PHP 7.4+ (opsiyonel)
- ✅ mod_rewrite desteği (.htaccess için)
- ✅ SSL sertifikası (önerilen)
- ✅ Günlük 10MB+ trafik
- ✅ 100MB+ disk alanı

### 5. Environment Variables (.env.local)
```env
VITE_DASHBOARD_PASSWORD=güvenli_şifre_123
VITE_SITE_URL=https://yourdomain.com
VITE_GA_TRACKING_ID=UA-XXXXXXXX-X
```

### 6. Güvenlik Kontrolleri
- [ ] Dashboard şifresi güçlü mu?
- [ ] HTTPS aktif mi?
- [ ] .htaccess yüklendi mi?
- [ ] Hassas dosyalar gizlendi mi?

### 7. SEO Kontrolleri
- [ ] robots.txt erişilebilir mi?
- [ ] sitemap.xml çalışıyor mu?
- [ ] Google Analytics kuruldu mu?
- [ ] Meta taglar doğru mu?

### 8. Performance Testleri
- [ ] PageSpeed Insights testi
- [ ] Mobile responsive test
- [ ] Image loading test
- [ ] Dashboard access test

## 🔧 Sorun Giderme

### Problem: Dashboard'a erişilemiyor
**Çözüm:** .htaccess dosyasının root dizinde olduğundan emin olun

### Problem: Görsel yüklenmiyor
**Çözüm:** uploads/ klasörünün yazma iznine sahip olduğunu kontrol edin

### Problem: 404 hatası
**Çözüm:** mod_rewrite aktif olduğunu hosting sağlayıcınızdan kontrol edin

### Problem: localStorage çok büyük
**Çözüm:** Eski projeleri silin veya görselleri küçültün

## 📱 Mobile Optimization
- Görsel boyutları 600px max
- JPEG kalitesi %70
- localStorage max 4MB
- Lazy loading aktif

## 🔒 Güvenlik Notları
- Dashboard şifresini düzenli değiştirin
- Backup'ları düzenli alın
- Traffic monitörü kullanın
- Spam koruma aktifleştirin

## 📊 Analytics Kurulumu
1. Google Analytics hesabı oluşturun
2. Tracking ID'yi .env.local'e ekleyin
3. Search Console'a site ekleyin
4. Sitemaps gönderin

## 🚨 Hosting Sonrası Kontrol Listesi
- [ ] Site açılıyor mu?
- [ ] Dashboard çalışıyor mu?
- [ ] Proje ekleme çalışıyor mu?
- [ ] Mobile görünüm tamam mı?
- [ ] Google'da indekslenmiş mi? 