# 🚀 Vercel Blob Storage Kurulum Rehberi

## 📋 Hızlı Kurulum (5 Dakika)

### Adım 1: Vercel Dashboard'da Blob Storage Oluştur

1. **Vercel Dashboard'a gidin:** https://vercel.com/dashboard
2. **Projenizi seçin:** `portfoliodeneme`
3. **Storage sekmesine gidin:** Sol menüden "Storage" seçin
4. **"Create Database" butonuna tıklayın**
5. **"Blob" seçin**
6. **Storage adı:** `portfolio-media` (veya istediğiniz isim)
7. **"Create" butonuna tıklayın**

### Adım 2: Environment Variable Ekle

1. **Vercel Dashboard > Settings > Environment Variables**
2. **`BLOB_READ_WRITE_TOKEN`** otomatik oluşturulur (Vercel bunu yapar)
3. Eğer görünmüyorsa:
   - Storage > Blob Storage'ınızı seçin
   - "Settings" > "Tokens" sekmesine gidin
   - "Create Token" butonuna tıklayın
   - Token'ı kopyalayın
   - Environment Variables'a ekleyin: `BLOB_READ_WRITE_TOKEN`

### Adım 3: Deploy

1. **GitHub'a push yapın** (zaten yaptık)
2. **Vercel otomatik deploy eder**
3. **Deploy tamamlandıktan sonra test edin**

## ✅ Test Etmek İçin

1. Admin paneline giriş yapın: `/admin/login`
2. Görseller sekmesine gidin
3. Bir dosya yüklemeyi deneyin
4. Başarılı olmalı! ✅

## 🔍 Sorun Giderme

### "BLOB_READ_WRITE_TOKEN is not set" Hatası:
1. Vercel Dashboard > Settings > Environment Variables
2. `BLOB_READ_WRITE_TOKEN` var mı kontrol edin
3. Yoksa Storage > Blob Storage > Settings > Tokens'dan oluşturun
4. "Redeploy" yapın

### "Blob Storage'a yükleme başarısız" Hatası:
1. Token'ın doğru olduğundan emin olun
2. Storage'ın aktif olduğundan emin olun
3. Vercel logs'u kontrol edin
4. Storage limitini kontrol edin (ücretsiz: 1GB)

### File Upload Hala Çalışmıyor:
1. Browser console'u kontrol edin (F12)
2. Vercel logs'u kontrol edin
3. Environment variable'ın doğru yüklendiğinden emin olun
4. "Redeploy" yapın

## 📊 Vercel Blob Storage Limitleri

### Ücretsiz Tier:
- ✅ **1GB storage**
- ✅ **100GB bandwidth/ay**
- ✅ **CDN dahil**
- ✅ **Otomatik optimizasyon**

### Pro Plan:
- ✅ **Sınırsız storage**
- ✅ **Sınırsız bandwidth**
- ✅ **Priority support**

## 💰 Maliyet

### Ücretsiz Tier:
- ✅ **Tamamen ücretsiz** (1GB'a kadar)
- ✅ **Yeterli** portfolio site için

### Pro Plan:
- 💰 **$20/ay**
- ✅ **Sınırsız storage**
- ✅ **Sınırsız bandwidth**

## 🔒 Güvenlik

### Token Güvenliği:
- ✅ Token environment variable'da saklanır
- ✅ Public repo'da görünmez
- ✅ Vercel otomatik yönetir

### Access Control:
- ✅ Public access (herkese açık)
- ✅ Private access (token gerekli)
- ✅ CDN security

## 📝 Notlar

### Blob URL Formatı:
- Format: `https://[hash].public.blob.vercel-storage.com/[path]`
- Örnek: `https://abc123.public.blob.vercel-storage.com/artists/murat-barlas/image.jpg`

### File Path:
- Path: `artists/{slug}/{filename}`
- Örnek: `artists/murat-barlas/bts__tk-26__photo.jpg`

### Metadata:
- Blob URL'leri metadata'da saklanır
- File system'deki dosyalar gibi çalışır
- Aynı API kullanılır

## 🆘 Yardım

Sorun yaşarsanız:
1. Vercel Blob Storage dokümantasyonu: https://vercel.com/docs/storage/vercel-blob
2. Vercel support: support@vercel.com
3. Vercel Discord: https://vercel.com/discord

---

**Başarılar! 🚀**

Vercel Blob Storage kurulumu tamamlandıktan sonra file upload çalışacak!

