# 🎥 Video Özelliği - YouTube/Vimeo Embed

## 📋 Özellik Özeti

Site artık YouTube ve Vimeo videolarını embed edebiliyor. Video dosyaları siteye yüklenmek yerine, YouTube veya Vimeo'dan embed ediliyor.

## ✅ Yapılanlar

### 1. Video Embed Component
- `src/components/ui/VideoEmbed.tsx` oluşturuldu
- YouTube ve Vimeo URL'lerini otomatik algılıyor
- Video thumbnail gösteriyor
- Tıklanınca video oynatılıyor
- Responsive tasarım

### 2. Metadata Desteği
- `WorkImage` interface'ine `videoUrl` alanı eklendi
- Portfolio metadata'sında video URL'leri saklanıyor
- `data/artists-metadata.json` dosyasında `portfolio` bölümünde video URL'leri tutuluyor

### 3. Admin Panel
- Video URL ekleme/düzenleme formu eklendi
- Her video work item'ında "Video URL Ekle/Düzenle" butonu
- YouTube ve Vimeo URL validasyonu
- Video URL durumu gösterimi (✓ veya ⚠)

### 4. API Endpoint
- `src/app/api/admin/works/video-url/route.ts` oluşturuldu
- Video URL ekleme, güncelleme, silme
- URL validasyonu (YouTube/Vimeo)

### 5. Gallery Güncellemeleri
- `GalleryGridItem` component'i video embed'i destekliyor
- Video thumbnail gösterimi
- Video oynatma butonu
- Dark mode desteği

## 🚀 Kullanım

### Admin Panel'den Video URL Ekleme:

1. **Admin paneline giriş yapın:** `/admin/login`
2. **Görseller sekmesine gidin**
3. **Video type'ı olan bir work item bulun**
4. **"Video URL Ekle" butonuna tıklayın**
5. **YouTube veya Vimeo URL'sini girin:**
   - YouTube: `https://youtube.com/watch?v=VIDEO_ID` veya `https://youtu.be/VIDEO_ID`
   - Vimeo: `https://vimeo.com/VIDEO_ID`
6. **"Kaydet" butonuna tıklayın**

### Desteklenen URL Formatları:

**YouTube:**
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`
- `https://youtube.com/v/VIDEO_ID`

**Vimeo:**
- `https://vimeo.com/VIDEO_ID`
- `https://player.vimeo.com/video/VIDEO_ID`

### Video Thumbnail:

- YouTube: Otomatik olarak YouTube'dan thumbnail alınır
- Vimeo: Otomatik olarak Vimeo'dan thumbnail alınır
- Fallback: Thumbnail yüklenemezse placeholder gösterilir

## 📁 Dosya Yapısı

### Metadata Yapısı:

```json
{
  "artist-slug": {
    "name": "Artist Name",
    "bio": "Bio text",
    "portfolio": {
      "work-id-1": {
        "videoUrl": "https://youtube.com/watch?v=VIDEO_ID"
      },
      "work-id-2": {
        "videoUrl": "https://vimeo.com/VIDEO_ID"
      }
    }
  }
}
```

### Work ID:

Work ID, dosya adından oluşturulur:
- Format: `{artist-slug}-{index}`
- Örnek: `murat-barlas-0`, `murat-barlas-1`

## 🎨 Özellikler

### Video Embed:
- ✅ YouTube ve Vimeo desteği
- ✅ Otomatik thumbnail
- ✅ Play butonu
- ✅ Responsive tasarım
- ✅ Dark mode desteği
- ✅ Autoplay (tıklanınca)
- ✅ Fullscreen desteği

### Admin Panel:
- ✅ Video URL ekleme
- ✅ Video URL düzenleme
- ✅ Video URL silme
- ✅ URL validasyonu
- ✅ Durum göstergesi

### Gallery:
- ✅ Video thumbnail gösterimi
- ✅ Video oynatma
- ✅ Overlay bilgileri (video URL yoksa)
- ✅ Dark mode desteği

## 🔒 Güvenlik

### URL Validasyonu:
- ✅ Sadece YouTube ve Vimeo URL'leri kabul edilir
- ✅ Geçersiz URL'ler reddedilir
- ✅ XSS koruması
- ✅ Path traversal koruması

### API Güvenliği:
- ✅ Authentication gerektirir
- ✅ Slug validasyonu
- ✅ Input sanitization
- ✅ Error handling

## 📝 Notlar

### Video Dosyaları:
- ❌ Video dosyaları siteye yüklenmez
- ✅ Sadece YouTube/Vimeo URL'leri kullanılır
- ✅ Thumbnail'ler otomatik alınır
- ✅ Bandwidth tasarrufu

### Metadata:
- ✅ Video URL'leri metadata'da saklanır
- ✅ Her work item için ayrı video URL
- ✅ Video URL olmayan video'lar placeholder gösterir

### Performance:
- ✅ Video'lar YouTube/Vimeo'dan yüklenir
- ✅ Thumbnail'ler optimize edilmiş
- ✅ Lazy loading
- ✅ CDN desteği (YouTube/Vimeo)

## 🐛 Sorun Giderme

### Video Görünmüyor:
1. Video URL'sinin doğru olduğundan emin olun
2. YouTube/Vimeo URL formatını kontrol edin
3. Video'nun public olduğundan emin olun
4. Browser console'u kontrol edin

### Thumbnail Görünmüyor:
1. Video URL'sinin doğru olduğundan emin olun
2. YouTube/Vimeo'dan thumbnail alınamıyorsa placeholder gösterilir
3. Network tab'ı kontrol edin

### Video Oynatılmıyor:
1. Video URL'sinin doğru olduğundan emin olun
2. Video'nun embed edilebilir olduğundan emin olun
3. Browser console'u kontrol edin
4. Ad blocker'ı kontrol edin

## 🔄 Güncellemeler

### Gelecek Özellikler:
- [ ] Video detay sayfası
- [ ] Video galeri
- [ ] Video arama
- [ ] Video kategorileri
- [ ] Video istatistikleri

---

**Başarılar! 🚀**

