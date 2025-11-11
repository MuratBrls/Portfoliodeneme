# 📸 Work Item (Görsel) Oluşturma Rehberi

## 🎯 Work Item Nedir?

Work Item = Ana sayfada görünen görsel veya video. Her work item bir görsel veya video içerir.

## ✅ Work Item Oluşturma (Adım Adım)

### 1. Admin Paneline Giriş Yapın

1. Tarayıcınızda siteyi açın: `https://portfoliodeneme.vercel.app`
2. `/admin/login` adresine gidin
3. Admin şifrenizi girin
4. "Giriş Yap" butonuna tıklayın

### 2. Görseller Sekmesine Gidin

1. Admin panelinde **"Görseller"** sekmesine tıklayın (varsayılan olarak açık)
2. Sayfanın üst kısmında **"GÖRSEL YÜKLE"** formunu göreceksiniz

### 3. Formu Doldurun

**"GÖRSEL YÜKLE" formunda:**

#### a) Sanatçı Seçin:
- **"Sanatçı"** dropdown menüsünden bir sanatçı seçin
- Örnek: "Murat Barlas", "EGE Canim"

#### b) Tür Seçin:
- **"Tür"** dropdown menüsünden seçim yapın:
  - **"Fotoğraf"** → Normal görsel için
  - **"Video"** → Video için (YouTube/Vimeo URL ekleyecekseniz)

#### c) Marka (Opsiyonel):
- **"Marka"** alanına marka adını yazın
- Örnek: "BTS", "Beymen", "Ferrari"
- Boş bırakabilirsiniz

#### d) Proje (Opsiyonel):
- **"Proje"** alanına proje adını yazın
- Örnek: "FW25/26", "TK 26", "CAR 25"
- Boş bırakabilirsiniz

#### e) Dosya Seçin:
- **"Dosya"** alanına tıklayın
- Bilgisayarınızdan bir dosya seçin:
  - **Fotoğraf için:** JPG, PNG, WEBP, GIF
  - **Video için:** Thumbnail görseli (JPG, PNG) - Video dosyası değil!

### 4. Yükle Butonuna Tıklayın

1. Formu doldurduktan sonra **"Yükle"** butonuna tıklayın
2. Dosya yüklenirken **"Yükleniyor..."** mesajı görünecek
3. Yükleme tamamlandığında görsel gallery'de görünecek

## 🎥 Video Work Item Oluşturma (Özel)

### Video Work Item İçin:

1. **Tür:** `Video` seçin
2. **Dosya:** Thumbnail görseli yükleyin (video dosyası değil!)
   - Video'nun thumbnail'i olarak kullanılacak
   - JPG, PNG formatında olmalı
3. **Yükle** butonuna tıklayın
4. Work item oluşturulduktan sonra **Video URL ekleyin** (isteğe bağlı)

### Video URL Ekleme:

1. Oluşturduğunuz video work item'ın üzerine gelin
2. **"Video URL Ekle"** butonuna tıklayın
3. YouTube veya Vimeo URL'sini girin
4. **"Kaydet"** butonuna tıklayın

## 📋 Örnekler

### Örnek 1: Fotoğraf Work Item

```
Sanatçı: Murat Barlas
Tür: Fotoğraf
Marka: BTS
Proje: TK 26
Dosya: bts-photo.jpg
```

**Sonuç:** Ana sayfada görsel olarak görünecek

### Örnek 2: Video Work Item (YouTube)

```
Sanatçı: Murat Barlas
Tür: Video
Marka: BTS
Proje: FW25/26
Dosya: video-thumbnail.jpg (thumbnail görseli)
```

**Sonra Video URL ekleyin:**
```
Video URL: https://youtube.com/watch?v=VIDEO_ID
```

**Sonuç:** Ana sayfada video thumbnail'i görünecek, tıklanınca video oynatılacak

### Örnek 3: Video Work Item (Vimeo)

```
Sanatçı: EGE Canim
Tür: Video
Marka: Beymen
Proje: SS25
Dosya: vimeo-thumbnail.jpg (thumbnail görseli)
```

**Sonra Video URL ekleyin:**
```
Video URL: https://vimeo.com/123456789
```

**Sonuç:** Ana sayfada video thumbnail'i görünecek, tıklanınca video oynatılacak

## 🔍 Work Item'ları Görüntüleme

### Admin Panelde:

1. **Görseller** sekmesine gidin
2. **"Toplam X görsel"** mesajının altında gallery'yi göreceksiniz
3. Her work item bir kart olarak görünecek:
   - Thumbnail görseli
   - Proje adı
   - Sanatçı adı
   - Marka adı
   - Video URL durumu (video ise)

### Ana Sayfada:

1. Ana sayfaya gidin: `/`
2. Tüm work item'lar gallery'de görünecek
3. Fotoğraflar: Tıklanınca lightbox'ta açılır
4. Videolar: Tıklanınca video oynatılır (URL varsa)

## 🗑️ Work Item Silme

1. Admin panelde work item'ın üzerine gelin
2. **"Sil"** butonuna tıklayın
3. Work item silinecek

**Not:** Harici URL'lerden gelen görseller silinemez (sadece yüklenmiş görseller silinebilir)

## 📝 Dosya Adlandırma

Work item oluştururken dosya adı otomatik oluşturulur:

**Format:** `{marka}__{proje}__{tür}.{uzantı}`

**Örnekler:**
- `bts__tk-26__photo.jpg`
- `beymen__fw25-26__video.jpg`
- `ferrari__car-25__photo.jpg`

**Not:** Marka ve proje boşsa, timestamp kullanılır: `upload-1234567890.jpg`

## 🎨 Work Item Özellikleri

### Fotoğraf Work Item:
- ✅ Görsel gösterilir
- ✅ Tıklanınca lightbox'ta açılır
- ✅ Overlay bilgileri (sanatçı, marka, proje)

### Video Work Item (URL yoksa):
- ✅ Thumbnail gösterilir
- ⚠️ Video URL eklenmedi uyarısı
- ✅ Overlay bilgileri (sanatçı, marka, proje)

### Video Work Item (URL varsa):
- ✅ Video thumbnail'i gösterilir
- ✅ Play butonu görünür
- ✅ Tıklanınca video oynatılır
- ✅ Overlay bilgileri yok (video oynatılırken)

## 🆘 Sorun Giderme

### "Yükle" Butonu Çalışmıyor:
1. Tüm alanları doldurduğunuzdan emin olun
2. Dosya seçtiğinizden emin olun
3. Browser console'u kontrol edin (F12)
4. Sayfayı yenileyin

### Dosya Yüklenmiyor:
1. Dosya boyutunu kontrol edin (max 50MB)
2. Dosya formatını kontrol edin (JPG, PNG, WEBP, GIF)
3. Internet bağlantınızı kontrol edin
4. Browser console'u kontrol edin (F12)

### Work Item Görünmüyor:
1. Sayfayı yenileyin
2. Gallery'yi aşağı kaydırın
3. Filtreleri kontrol edin
4. Browser console'u kontrol edin (F12)

### Video URL Eklenmiyor:
1. Video URL'sinin doğru formatda olduğundan emin olun
2. YouTube veya Vimeo URL'si olduğundan emin olun
3. Work item'ın type'ının "video" olduğundan emin olun
4. Browser console'u kontrol edin (F12)

---

**Başka sorularınız varsa sorabilirsiniz! 🚀**

