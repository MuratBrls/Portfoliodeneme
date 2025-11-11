# 📁 Local File Upload Rehberi

## ✅ Basit Çözüm: Local'de Upload, GitHub'a Push

Vercel Blob Storage kurulumu karmaşık olduğu için, daha basit bir yöntem kullanıyoruz:

### 🎯 Nasıl Çalışır?

1. **Local'de file upload yapın** (çalışıyor ✅)
2. **Dosyaları GitHub'a push edin**
3. **Vercel otomatik deploy eder**
4. **Dosyalar sitede görünür!**

---

## 🚀 Adım Adım Kullanım

### 1. Local Development Server'ı Başlatın

```bash
npm run dev
```

Site açılacak: http://localhost:3000

### 2. Admin Paneline Giriş Yapın

1. http://localhost:3000/admin/login adresine gidin
2. Admin şifrenizi girin
3. Admin paneline giriş yapın

### 3. File Upload Yapın

#### Görsel Yükleme:
1. **Görseller** sekmesine gidin
2. **Artist seçin**
3. **Type:** Photo veya Video
4. **Brand** ve **Project Title** girin (isteğe bağlı)
5. **Dosya seçin**
6. **"Yükle" butonuna tıklayın**

#### Profile Image Yükleme:
1. **Sanatçılar** sekmesine gidin
2. **Sanatçı seçin**
3. **"Profil Fotoğrafı Yükle" butonuna tıklayın**
4. **Dosya seçin**
5. **"Yükle" butonuna tıklayın**

### 4. Dosyaları GitHub'a Push Edin

#### Git Komutları:

```bash
# Değişiklikleri kontrol edin
git status

# Tüm değişiklikleri ekleyin
git add .

# Commit yapın
git commit -m "Yeni görseller eklendi"

# GitHub'a push edin
git push origin main
```

### 5. Vercel Otomatik Deploy Eder

- GitHub'a push yaptığınızda Vercel otomatik olarak deploy başlatır
- Deploy tamamlandığında (2-5 dakika) dosyalar sitede görünür
- Vercel Dashboard'dan deploy durumunu takip edebilirsiniz

---

## 📂 Dosya Yapısı

Upload edilen dosyalar şu klasörlerde saklanır:

```
public/
  artists/
    {artist-slug}/
      {brand}__{project}__{type}.{ext}
      profile.{ext}
```

**Örnek:**
```
public/
  artists/
    murat-barlas/
      bts__tk-26__photo.jpg
      profile.jpg
```

---

## ✅ Avantajlar

### Basit ve Pratik:
- ✅ Vercel Blob Storage kurulumu gerekmez
- ✅ Ekstra maliyet yok
- ✅ Local'de çalışır
- ✅ GitHub version control

### Hızlı:
- ✅ Local'de anında upload
- ✅ GitHub'a push (1-2 dakika)
- ✅ Vercel otomatik deploy (2-5 dakika)
- ✅ Toplam: 3-7 dakika

### Güvenli:
- ✅ Dosyalar GitHub'da saklanır
- ✅ Version control
- ✅ Backup otomatik

---

## ⚠️ Dezavantajlar

### Yavaş (Runtime Upload Yok):
- ❌ Vercel'de runtime'da upload yapılamaz
- ❌ Her upload için commit + push gerekir
- ❌ Deploy süresi: 2-5 dakika

### Manuel İşlem:
- ❌ Her upload için GitHub'a push gerekir
- ❌ Otomatik değil, manuel commit gerekir

---

## 🎯 Önerilen Kullanım

### Development (Local):
1. Local'de upload yapın
2. Test edin
3. GitHub'a push edin
4. Vercel deploy eder

### Production (Vercel):
1. Vercel'de upload yapılamaz (mesaj gösterilir)
2. Local'de upload yapın
3. GitHub'a push edin
4. Vercel deploy eder

---

## 📝 Notlar

### Vercel'de Upload Yapılamaz:

Vercel'de file upload yapmaya çalışırsanız şu mesajı görürsünüz:

```
Vercel'de file upload yapılamaz. 
Lütfen dosyaları local'de yükleyin ve GitHub'a push edin.
```

**Çözüm:** Local'de upload yapın ve GitHub'a push edin.

### Dosya Boyutu:

- **Maksimum dosya boyutu:** 10MB
- **Desteklenen formatlar:**
  - **Fotoğraf:** JPG, PNG, WebP, GIF
  - **Video:** MP4, WebM, MOV

### GitHub Limitleri:

- **Maksimum dosya boyutu:** 100MB (GitHub)
- **Repo boyutu:** 1GB (ücretsiz)
- **Önerilen:** Dosyaları optimize edin (sıkıştırın)

---

## 🔄 Workflow Özeti

```
1. Local'de upload yap
   ↓
2. Git add + commit
   ↓
3. Git push origin main
   ↓
4. Vercel otomatik deploy
   ↓
5. Dosyalar sitede görünür! ✅
```

---

## 🆘 Sorun Giderme

### "Vercel'de file upload yapılamaz" Hatası:

**Sebep:** Vercel'de Blob Storage yok.

**Çözüm:** Local'de upload yapın ve GitHub'a push edin.

### Dosyalar GitHub'da Görünmüyor:

**Kontrol:**
1. `git status` - Değişiklikleri kontrol edin
2. `git add .` - Dosyaları ekleyin
3. `git commit -m "message"` - Commit yapın
4. `git push origin main` - Push yapın

### Dosyalar Vercel'de Görünmüyor:

**Kontrol:**
1. Vercel Dashboard > Deployments
2. Son deployment'ı kontrol edin
3. Deploy tamamlandı mı?
4. Logs'da hata var mı?

### Local'de Upload Çalışmıyor:

**Kontrol:**
1. `npm run dev` çalışıyor mu?
2. Admin paneline giriş yaptınız mı?
3. Dosya boyutu 10MB'dan küçük mü?
4. Dosya formatı destekleniyor mu?

---

## 📞 Yardım

Sorun yaşarsanız:
1. Browser console'u kontrol edin (F12)
2. Terminal'de hata mesajlarını kontrol edin
3. Git status'ü kontrol edin
4. Vercel logs'u kontrol edin

---

**Özet:** Local'de upload yapın, GitHub'a push edin, Vercel otomatik deploy eder! 🚀

