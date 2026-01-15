# Vercel Blob Storage - Setup Guide

## 🚀 Deployment Sonrası

### 1. Vercel Dashboard'a Git
https://vercel.com/dashboard

### 2. Environment Variable Ekle

**Settings** → **Environment Variables** → **Add New**

```
Name: BLOB_READ_WRITE_TOKEN
Value: (Otomatik generate edilecek - aşağıda)
```

### 3. Blob Store Oluştur

**Storage** tab → **Create Database** → **Blob**

- Store Name: `portfolio-storage`
- Region: Washington D.C. (IAD)
- ✅ Create

### 4. Token Al

Blob store oluşturduktan sonra:
- **Connect** → **API Token**
- Token'ı kopyala
- Environment Variable olarak ekle

### 5. Redeploy

**Deployments** → Latest → **⋯** → **Redeploy**

---

## ✅ Test

1. Dashboard'a gir: `https://SITE_URL/dashboard`
2. Proje ekle
3. ✅ "Blob Storage" mesajı göreceksin
4. Ana sayfaya git
5. ✅ Yeni proje görünecek!

---

## 📊 Blob Dashboard

Vercel → Storage → portfolio-storage

Buradan görebilirsin:
- `portfolio/projects.json` → Proje verileri
- `portfolio/analytics.json` → Analytics verileri

---

## 🔧 Troubleshooting

**"Unauthorized" hatası:**
- `VITE_DASHBOARD_PASSWORD` environment variable'ı kontrol et

**"Blob not found" hatası:**
- İlk deployment'ta normal (otomatik oluşturulacak)
- Bir kez proje ekle, blob oluşacak

**API 500 error:**
- `BLOB_READ_WRITE_TOKEN` eklenmiş mi kontrol et
- Redeploy yap

---

## 💰 Limits (Free Tier)

- **Storage**: 50GB
- **Bandwidth**: 100GB/month
- **Requests**: Unlimited

Eğer aşarsan Vercel otomatik bildirir, ama portfolio site için çok fazla! 🎉
