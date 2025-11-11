# 🌐 Domain Ekleme ve Limitler Rehberi

## 1. 📍 Kendi Domain'inizi Vercel'e Eklemek

### ✅ Evet, Kendi Domain'inizi Ekleyebilirsiniz!

Vercel'de kendi domain'inizi (örn: `www.kolektif.com` veya `kolektif.com`) **tamamen ücretsiz** olarak ekleyebilirsiniz.

### Adım Adım Domain Ekleme:

#### Adım 1: Domain Satın Alma
1. Domain satın almanız gerekiyor (henüz yoksa):
   - **Önerilen satıcılar:**
     - Namecheap (en popüler, Türkçe destek)
     - GoDaddy
     - Google Domains
     - Cloudflare (en ucuz)
   - Fiyat: Genellikle yıllık $10-15 (TL olarak ~300-500 TL)

#### Adım 2: Vercel'de Domain Ekleme
1. **Vercel Dashboard'a gidin**
2. Projenizi seçin (`portfoliodeneme`)
3. **Settings** > **Domains** sekmesine gidin
4. **Add Domain** butonuna tıklayın
5. Domain'inizi girin (örn: `kolektif.com` veya `www.kolektif.com`)
6. **Add** butonuna tıklayın

#### Adım 3: DNS Ayarları
Vercel size DNS ayarları için talimatlar verecek:

**Seçenek A: A Record (Ana Domain için)**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Seçenek B: CNAME (www için)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Seçenek C: Nameservers (En Kolay)**
Vercel'in nameserver'larını kullanabilirsiniz:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

#### Adım 4: DNS Ayarlarını Yapma
1. Domain satıcınızın panelinden DNS ayarlarına gidin
2. Vercel'in verdiği kayıtları ekleyin
3. **Kaydet** butonuna tıklayın
4. DNS yayılması 5 dakika - 48 saat sürebilir (genellikle 1-2 saat)

#### Adım 5: SSL Sertifikası (Otomatik)
- Vercel **otomatik olarak SSL sertifikası** sağlar (Let's Encrypt)
- HTTPS **tamamen ücretsiz**
- Sertifika otomatik yenilenir
- 5-10 dakika içinde aktif olur

### Domain Yönlendirme Örnekleri:

**www olmadan → www ile:**
- `kolektif.com` → `www.kolektif.com` (veya tam tersi)
- Vercel bunu otomatik yapabilir

**Subdomain ekleme:**
- `admin.kolektif.com`
- `blog.kolektif.com`
- Her biri farklı projeye yönlendirilebilir

### Domain Maliyeti:
- ✅ Vercel'de domain ekleme: **ÜCRETSİZ**
- ✅ SSL sertifikası: **ÜCRETSİZ**
- ✅ HTTPS: **ÜCRETSİZ**
- ✅ DNS yönetimi: **ÜCRETSİZ**
- 💰 Sadece domain satın alma ücreti: ~$10-15/yıl

---

## 2. 💾 Dosyaların Kalıcılığı

### Vercel'de Hosting Kalıcılığı:

#### ✅ Dosyalar Kalıcıdır (Süresiz)

**Vercel Hobby Plan (Ücretsiz):**
- ✅ **Süresiz hosting** (proje aktif olduğu sürece)
- ✅ Proje **asla silinmez** (manuel silmediğiniz sürece)
- ✅ GitHub'a bağlı projeler **otomatik güncellenir**
- ✅ **Sınırsız deployment**
- ✅ **Sınırsız bandwidth** (aylık 100GB'ye kadar ücretsiz)

**Proje Aktif Kalma Koşulları:**
1. GitHub repository'si aktif olduğu sürece
2. Vercel hesabınız aktif olduğu sürece
3. Manuel olarak silmediğiniz sürece

**Dosyalar Nerede Saklanır?**
- ✅ Vercel'in sunucularında (global CDN)
- ✅ GitHub repository'nizde (kaynak kodlar)
- ✅ Her deployment'da otomatik yedeklenir

**Veri Kaybı Riskleri:**
- ❌ Vercel hesabınızı silerseniz → Proje silinir
- ❌ GitHub repository'sini silerseniz → Kaynak kodlar silinir (ama Vercel'deki deployment'lar kalır)
- ✅ GitHub'da repository varsa → Her zaman yeniden deploy edebilirsiniz

**Yedekleme Önerileri:**
1. ✅ GitHub'da repository tutun (otomatik yedek)
2. ✅ Local'de proje klasörünü saklayın
3. ✅ Önemli dosyaları (görseller, data) yedekleyin
4. ✅ Database kullanıyorsanız ayrı yedek alın

---

## 3. 📦 GitHub Push Limitleri

### GitHub Repository Limitleri:

#### ✅ Dosya Boyutu Limitleri:

**Tek Dosya:**
- ⚠️ **100 MB** üzeri dosyalar → GitHub uyarı verir
- ❌ **50 MB** üzeri dosyalar → Push edilemez (otomatik reddedilir)
- ✅ **50 MB altı** → Sorunsuz push edilir

**Repository Toplam Boyutu:**
- ⚠️ **1 GB** üzeri → GitHub uyarı verir
- ⚠️ **5 GB** üzeri → Repository yavaşlar
- ❌ **100 GB** üzeri → GitHub hesap kapatabilir
- ✅ **Önerilen:** 1 GB altı

**Repository Boyutu Önerileri:**
- ✅ Kaynak kodlar: ~10-50 MB (normal)
- ✅ Görseller: ~100-500 MB (kabul edilebilir)
- ✅ Video dosyaları: GitHub'a **eklemeyin** (çok büyük)

#### 🎯 Portfolio Site İçin:

**Mevcut Proje Boyutu:**
- Kaynak kodlar: ~5-10 MB
- Görseller (`public/artists/`): ~50-100 MB (tahmini)
- **Toplam:** ~100 MB altı ✅ (Sorun yok!)

**Öneriler:**
1. ✅ **Görselleri GitHub'a ekleyin** (şu anki durum iyi)
2. ⚠️ **Video dosyaları eklemeyin** (çok büyük)
3. ✅ **Büyük dosyalar için Git LFS kullanın** (100 MB+ için)
4. ✅ **.gitignore ile gereksiz dosyaları hariç tutun**

#### 📊 GitHub LFS (Large File Storage):

**Ne Zaman Kullanılır?**
- 100 MB üzeri dosyalar için
- Video dosyaları için
- Büyük görseller için

**Nasıl Kullanılır?**
```bash
# Git LFS'i yükleyin
git lfs install

# Büyük dosya tiplerini takip edin
git lfs track "*.mp4"
git lfs track "*.mov"
git lfs track "*.jpg" --above=10MB

# Normal git işlemleri
git add .
git commit -m "Add large files"
git push
```

**Git LFS Limitleri:**
- ✅ Ücretsiz plan: **1 GB depolama**
- ✅ Aylık bandwidth: **1 GB**
- 💰 Pro plan: Daha fazla depolama

#### 🚫 GitHub'a Eklememeniz Gerekenler:

1. ❌ **Video dosyaları** (çok büyük)
2. ❌ **Node_modules** (zaten .gitignore'da)
3. ❌ **Build klasörleri** (.next, dist, etc.)
4. ❌ **Environment dosyaları** (.env.local)
5. ❌ **Büyük zip dosyaları**
6. ❌ **Log dosyaları**

#### ✅ GitHub'a Ekleyebilecekleriniz:

1. ✅ **Kaynak kodlar** (src/, public/, etc.)
2. ✅ **Görseller** (jpg, png, svg - makul boyutlarda)
3. ✅ **Config dosyaları** (package.json, tsconfig.json, etc.)
4. ✅ **Dokümantasyon** (README.md, etc.)
5. ✅ **Küçük video dosyaları** (<50 MB)

---

## 4. 💰 Vercel Ücretsiz Plan Limitleri

### Hobby Plan (Ücretsiz):

**Bandwidth:**
- ✅ Aylık **100 GB** ücretsiz
- ⚠️ Aşım durumunda: Ekstra ücret ($20/TB)
- 📊 Portfolio site için: Genellikle yeterli

**Deployments:**
- ✅ **Sınırsız deployment**
- ✅ **Sınırsız preview deployment**
- ✅ Build süresi: **45 dakika/ay** (genellikle yeterli)

**Fonksiyonlar:**
- ✅ **Serverless functions**
- ✅ **100 GB-hours/ay** (genellikle yeterli)

**Team:**
- ✅ **Tek kullanıcı**
- 💰 Team plan: Çoklu kullanıcı ($20/ay)

**Domain:**
- ✅ **Sınırsız custom domain**
- ✅ **Ücretsiz SSL**
- ✅ **Otomatik HTTPS**

**Analytics:**
- ✅ **Temel analytics** (ücretsiz)
- 💰 Pro plan: Gelişmiş analytics

### Pro Plan ($20/ay):

**Ekstra Özellikler:**
- ✅ **Sınırsız bandwidth**
- ✅ **Sınırsız build süresi**
- ✅ **Team özellikleri**
- ✅ **Gelişmiş analytics**
- ✅ **Priority support**

---

## 5. 📈 Portfolio Site İçin Öneriler

### Mevcut Durumunuz:

**Repository Boyutu:**
- ✅ ~100 MB altı (iyi)
- ✅ GitHub limitleri içinde
- ✅ Vercel limitleri içinde

**Bandwidth:**
- ✅ Aylık 100 GB yeterli (genellikle)
- ✅ Görseller optimize edilmiş
- ✅ Next.js image optimization aktif

### Gelecek İçin Öneriler:

1. **Görseller:**
   - ✅ Mevcut boyutlar iyi
   - ✅ Gerekirse görselleri optimize edin
   - ✅ WebP formatı kullanın (daha küçük)

2. **Video Dosyaları:**
   - ❌ GitHub'a eklemeyin
   - ✅ Vercel'e yükleyin (public klasörüne)
   - ✅ Veya harici servis kullanın (Vimeo, YouTube)

3. **Domain:**
   - ✅ Kendi domain'inizi ekleyin
   - ✅ www ve non-www yönlendirmesi yapın
   - ✅ SSL sertifikası otomatik

4. **Yedekleme:**
   - ✅ GitHub'da repository tutun
   - ✅ Local'de proje klasörünü saklayın
   - ✅ Önemli görselleri yedekleyin

---

## 6. 🔒 Güvenlik ve Kalıcılık

### Vercel Güvenliği:

**Otomatik:**
- ✅ SSL sertifikası (Let's Encrypt)
- ✅ HTTPS zorunlu
- ✅ DDoS koruması
- ✅ Global CDN
- ✅ Otomatik yedekleme

**Manuel:**
- ✅ Environment variables güvenli
- ✅ Admin panel şifreli
- ✅ Rate limiting aktif

### Veri Kaybı Önleme:

1. **GitHub Repository:**
   - ✅ Tüm kaynak kodlar GitHub'da
   - ✅ Her değişiklik kayıtlı
   - ✅ Geri dönüş mümkün

2. **Local Yedek:**
   - ✅ Proje klasörünü saklayın
   - ✅ Düzenli yedek alın
   - ✅ Görselleri yedekleyin

3. **Vercel Deployment:**
   - ✅ Her deployment kayıtlı
   - ✅ Önceki versiyonlara dönülebilir
   - ✅ Rollback mümkün

---

## 7. 📝 Özet

### Domain Ekleme:
- ✅ **Ücretsiz** domain ekleme
- ✅ **Ücretsiz** SSL sertifikası
- ✅ **5-10 dakika** içinde aktif
- ✅ **Otomatik** HTTPS

### Kalıcılık:
- ✅ **Süresiz** hosting (proje aktif olduğu sürece)
- ✅ **GitHub'da** yedek (kaynak kodlar)
- ✅ **Vercel'de** deployment'lar
- ✅ **Manuel silmediğiniz sürece** kalıcı

### GitHub Limitleri:
- ✅ **50 MB** altı dosyalar sorunsuz
- ⚠️ **100 MB** üzeri dosyalar uyarı
- ✅ **1 GB** altı repository önerilir
- ✅ **Portfolio site için yeterli**

### Vercel Limitleri:
- ✅ **100 GB/ay** bandwidth (ücretsiz)
- ✅ **Sınırsız** deployment
- ✅ **Sınırsız** custom domain
- ✅ **Portfolio site için yeterli**

---

## 🆘 Sorular ve Cevaplar

**S: Domain'i Vercel'den çıkarabilir miyim?**
C: Evet, istediğiniz zaman kaldırabilirsiniz. Domain satıcınızdan DNS ayarlarını değiştirmeniz yeterli.

**S: Vercel ücretsiz plan yeterli mi?**
C: Evet, portfolio site için ücretsiz plan genellikle yeterli. Bandwidth aşımı olursa pro plan düşünebilirsiniz.

**S: GitHub repository boyutu çok büyürse ne yapmalıyım?**
C: Görselleri optimize edin, video dosyalarını çıkarın, Git LFS kullanın veya harici depolama kullanın.

**S: Vercel'deki dosyalar kaybolur mu?**
C: Hayır, GitHub repository'si varsa her zaman yeniden deploy edebilirsiniz. Ama görselleri yedeklemeniz önerilir.

**S: Domain'i başka bir servise taşıyabilir miyim?**
C: Evet, domain satıcınızdan DNS ayarlarını değiştirmeniz yeterli. Domain'iniz size aittir.

---

**Başka sorularınız varsa sorabilirsiniz! 🚀**

