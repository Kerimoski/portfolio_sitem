# 🚀 Abdulkerim Erdurun - Portfolio Website

Modern ve profesyonel portfolio sitesi. React.js, Tailwind CSS ve GSAP animasyonları ile geliştirilmiştir.

## ✨ Özellikler

### 🎨 **Tasarım ve UI**
- ✅ Modern ve responsive tasarım
- ✅ Koyu tema optimizasyonu
- ✅ GSAP smooth scroll animasyonları
- ✅ TypeWriter efekti terminal simulasyonu
- ✅ Gradient text efektleri
- ✅ Mobile-first responsive tasarım

### 🔧 **Teknik Özellikler**
- ✅ React.js 18+ ile geliştirilmiş
- ✅ Tailwind CSS için optimized styling
- ✅ React Router ile sayfa yönlendirme
- ✅ GSAP ile performanslı animasyonlar
- ✅ Lazy loading ile görsel optimizasyonu
- ✅ PWA desteği

### 📊 **SEO ve Performans**
- ✅ Kapsamlı meta tags (Open Graph, Twitter Cards)
- ✅ Structured Data (JSON-LD)
- ✅ XML Sitemap
- ✅ Robots.txt optimizasyonu
- ✅ Google Analytics entegrasyonu
- ✅ Performans optimizasyonları
- ✅ Lazy loading resimleri

### 🔐 **Gelişmiş Dashboard Sistemi**
- ✅ Güvenli admin paneli (.env ile şifre koruması)
- ✅ **Tam Dinamik Proje Yönetimi:**
  - Default projeler (7 adet) - Korumalı, silinmez
  - User projeler - Eklenebilir, silinebilir, sıralanabilir
  - **Real-time senkronizasyon** ana sayfa ile
  - **Drag & drop benzeri sıralama** (↑↓ butonları)
- ✅ Görsel yükleme ve otomatik optimizasyon
- ✅ Proje sıralama sistemi
- ✅ Veri dışa aktarma özelliği
- ✅ İstatistik görüntüleme
- ✅ 24 saat oturum yönetimi

### 🎯 **Proje Yapısı**
```javascript
// Tutarlı proje formatı
{
  imgSrc: string,        // Görsel URL'i
  title: string,         // Proje başlığı
  tags: array,           // Teknoloji etiketleri
  projectLink: string,   // Proje linki
  id: string,            // Benzersiz ID
  isDefault: boolean     // Default/User ayırımı
}
```

### 📧 **İletişim ve Entegrasyon**
- ✅ Getform.io entegrasyonu
- ✅ Sosyal medya linkleri
- ✅ CV indirme özelliği
- ✅ Analytics tracking

## 🛠️ Teknoloji Yığını

- **Frontend:** React.js, Tailwind CSS, GSAP
- **Routing:** React Router DOM
- **SEO:** React Helmet Async
- **Analytics:** Google Analytics
- **Forms:** Getform.io
- **Build Tool:** Vite

## 🚀 Kurulum

1. **Repository'yi clone edin:**
```bash
git clone https://github.com/kerimerdurun/portfolio.git
cd portfolio
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment dosyası oluşturun:**
```bash
cp .env.example .env.local
```

4. **Environment değişkenlerini düzenleyin:**
```env
VITE_DASHBOARD_PASSWORD=kerimoski2024
VITE_SITE_URL=https://yourdomain.com
VITE_CONTACT_FORM_URL=https://getform.io/f/your_form_id
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

5. **Geliştirme server'ını başlatın:**
```bash
npm run dev
```

## 🔐 Dashboard Kullanımı

### Erişim
- `/dashboard` adresine gidin
- Environment'da tanımlı şifreyi girin (varsayılan: kerimoski2024)

### 🎯 **Proje Yönetimi**
- **Default Projeler:** 
  - 7 adet mevcut proje
  - Silinmez, korunur
  - "Default" etiketi ile gösterilir
  
- **User Projeler:** 
  - Dashboard'dan eklenebilir
  - Silinebilir
  - ↑↓ butonları ile sıralanabilir
  
- **Dinamik Sıralama:**
  - Dashboard'da değiştirdiğiniz sıra ana sayfaya yansır
  - Real-time güncelleme
  - localStorage'da kalıcı

### 📊 **Özellikler**
- Proje kartlarında sıra numarası (#1, #2, ...)
- Görsel optimizasyon (resize + compress)
- JSON export sistemi
- İstatistik görüntüleme
- Analytics tracking

## 🎨 **Nasıl Çalışır**

### Ana Sayfa (`/`)
```javascript
// Default + User projeler birleştirilir
const allProjects = [...defaultProjects, ...userProjects]

// Sıralama uygulanır
const orderedProjects = applyCustomOrder(allProjects)

// Analytics tracking
onClick={() => trackProjectClick(project.title, project.link)}
```

### Dashboard (`/dashboard`)
```javascript
// Proje ekleme
const newProject = {
  imgSrc, title, tags, projectLink,
  id: Date.now(),
  isDefault: false
}

// Sıralama değiştirme
moveProject(projectId, 'up' | 'down')

// Real-time senkronizasyon
window.dispatchEvent(new Event('projectsUpdated'))
```

## 📂 Veri Yapısı

```
localStorage:
├── portfolio-projects        # User projeleri
├── portfolio-projects-order  # Sıralama bilgisi
├── dashboard-auth           # Auth durumu
└── dashboard-auth-time      # Auth zamanı

defaultProjects (kod içi):
├── Gola Atölye
├── DİKOGEM  
├── Taşımacılık
├── Stok Fotoğraf API
├── Didim Rent a Car
├── Emlak
└── Tchala - En özel çay
```

## 🎯 **Yenilikler**

### ✅ **Tam Dinamik Sistem**
- Dashboard'dan eklenen projeler **anında** ana sayfada görünür
- Proje sırası değiştirildiğinde **real-time** güncellenir
- Default projeler korunur, user projeler tam kontrol edilebilir

### ✅ **Gelişmiş Sıralama**
- ↑↓ butonları ile kolay sıralama
- Disabled state için görsel feedback
- Ana sayfa ile %100 senkronize

### ✅ **Optimize UI/UX**
- Proje kartlarında sıra numarası
- Default/User etiketleri
- Korumalı projeler için özel gösterim

## 📞 İletişim

- **Website:** [abdulkerimerdurun.com](https://abdulkerimerdurun.com)
- **Email:** erdurunabdulkerim@gmail.com
- **LinkedIn:** [Abdulkerim Erdurun](https://www.linkedin.com/in/abdulkerim-erdurun-b5ba73239/)
- **GitHub:** [@kerimerdurun](https://github.com/kerimerdurun)

---

⭐ **Bu projeyi beğendiyseniz star vermeyi unutmayın!**

🚀 **Artık tam dinamik bir portfolio sisteminiz var!**
