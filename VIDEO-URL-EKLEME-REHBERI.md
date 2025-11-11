# 🎥 Video URL Ekleme Rehberi

## 📋 Adım Adım Video URL Ekleme

### 1. Video Type'ı Work Item Oluşturma

#### Seçenek A: Yeni Video Work Item Oluşturma
1. **Admin paneline giriş yapın:** `/admin/login`
2. **Görseller sekmesine gidin**
3. **"GÖRSEL YÜKLE" formunu doldurun:**
   - **Sanatçı:** Video'nun ait olduğu sanatçıyı seçin
   - **Tür:** `Video` seçin (önemli!)
   - **Marka:** (Opsiyonel) Marka adı
   - **Proje:** (Opsiyonel) Proje adı
   - **Dosya:** Bir thumbnail görseli yükleyin (video dosyası değil, sadece görsel)
4. **"Yükle" butonuna tıklayın**

#### Seçenek B: Mevcut Work Item'ı Video'ya Çevirme
- Mevcut work item'ları video'ya çeviremezsiniz
- Yeni bir video work item oluşturmanız gerekir

### 2. Video URL Ekleme

1. **Video type'ı olan work item'ı bulun:**
   - Gallery'de video type'ı olan work item'ların altında **"⚠ Video URL eklenmedi"** uyarısı görünecek
   - Video URL'si olan work item'ların altında **"✓ Video URL: ..."** mesajı görünecek

2. **Work item'ın üzerine gelin (hover):**
   - Work item'ın üzerine geldiğinizde overlay görünecek
   - **"Video URL Ekle"** veya **"Video URL Düzenle"** butonu görünecek

3. **"Video URL Ekle" butonuna tıklayın:**
   - Work item'ın altında bir form açılacak
   - **"YouTube veya Vimeo URL"** input alanı görünecek

4. **Video URL'sini girin:**
   - **YouTube için:**
     - `https://youtube.com/watch?v=VIDEO_ID`
     - `https://youtu.be/VIDEO_ID`
     - `https://youtube.com/embed/VIDEO_ID`
   - **Vimeo için:**
     - `https://vimeo.com/VIDEO_ID`
     - `https://player.vimeo.com/video/VIDEO_ID`

5. **"Kaydet" butonuna tıklayın:**
   - Video URL kaydedilecek
   - Work item'ın altında **"✓ Video URL: ..."** mesajı görünecek
   - Liste otomatik güncellenecek

### 3. Video URL Düzenleme

1. **Video URL'si olan work item'ı bulun**
2. **Work item'ın üzerine gelin (hover)**
3. **"Video URL Düzenle" butonuna tıklayın**
4. **Video URL'sini düzenleyin**
5. **"Kaydet" butonuna tıklayın**

### 4. Video URL Silme

1. **Video URL'si olan work item'ı bulun**
2. **Work item'ın üzerine gelin (hover)**
3. **"Video URL Düzenle" butonuna tıklayın**
4. **Video URL input alanını boşaltın**
5. **"Kaydet" butonuna tıklayın**

## 🎯 Örnek Kullanım

### YouTube Video Ekleme:
1. **Video type'ı work item oluşturun:**
   - Sanatçı: Murat Barlas
   - Tür: Video
   - Marka: BTS
   - Proje: FW25/26
   - Dosya: Thumbnail görseli yükleyin

2. **Work item'ın üzerine gelin**
3. **"Video URL Ekle" butonuna tıklayın**
4. **YouTube URL'sini girin:**
   ```
   https://youtube.com/watch?v=dQw4w9WgXcQ
   ```
5. **"Kaydet" butonuna tıklayın**

### Vimeo Video Ekleme:
1. **Video type'ı work item oluşturun**
2. **Work item'ın üzerine gelin**
3. **"Video URL Ekle" butonuna tıklayın**
4. **Vimeo URL'sini girin:**
   ```
   https://vimeo.com/123456789
   ```
5. **"Kaydet" butonuna tıklayın**

## 🔍 Video URL Durumları

### ✅ Video URL Eklendi:
- Work item'ın altında **"✓ Video URL: ..."** mesajı görünecek
- Ana sayfada video thumbnail'i görünecek
- Thumbnail'e tıklanınca video oynatılacak

### ⚠️ Video URL Eklenmedi:
- Work item'ın altında **"⚠ Video URL eklenmedi"** uyarısı görünecek
- Ana sayfada sadece placeholder görünecek
- Video oynatılamaz

## 📝 Notlar

### Thumbnail Görseli:
- Video type'ı work item oluştururken bir thumbnail görseli yükleyin
- Bu görsel video'nun thumbnail'i olarak kullanılacak
- YouTube/Vimeo'dan otomatik thumbnail alınabilir ama custom thumbnail daha iyi görünebilir

### Video URL Formatları:
- **YouTube:** `https://youtube.com/watch?v=VIDEO_ID` veya `https://youtu.be/VIDEO_ID`
- **Vimeo:** `https://vimeo.com/VIDEO_ID`
- Geçersiz URL'ler reddedilecek

### Video Görünürlüğü:
- Video URL'si eklenen work item'lar ana sayfada video thumbnail'i olarak görünecek
- Thumbnail'e tıklanınca video oynatılacak
- Video URL'si olmayan work item'lar placeholder olarak görünecek

## 🆘 Sorun Giderme

### "Video URL Ekle" Butonu Görünmüyor:
1. Work item'ın **type'ının "video" olduğundan** emin olun
2. Work item'ın **üzerine gelin (hover)** - buton overlay'de görünecek
3. Sayfayı yenileyin

### Video URL Kaydedilmiyor:
1. Video URL'sinin **doğru formatda** olduğundan emin olun
2. YouTube veya Vimeo URL'si olduğundan emin olun
3. Browser console'u kontrol edin (F12)
4. Sayfayı yenileyin ve tekrar deneyin

### Video Thumbnail Görünmüyor:
1. Video URL'sinin **doğru olduğundan** emin olun
2. Video'nun **public olduğundan** emin olun
3. Thumbnail görselinin **yüklendiğinden** emin olun
4. Sayfayı yenileyin

### Video Oynatılmıyor:
1. Video URL'sinin **doğru olduğundan** emin olun
2. Video'nun **embed edilebilir olduğundan** emin olun
3. Browser console'u kontrol edin (F12)
4. Ad blocker'ı kontrol edin

---

**Başka sorularınız varsa sorabilirsiniz! 🚀**

