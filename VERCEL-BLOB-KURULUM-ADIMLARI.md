# ✅ Vercel Blob Storage Kurulum Adımları

## 🎯 Şu An Yapmanız Gerekenler

### 1. Custom Prefix: "BLOB" (Değiştirmeyin!)

Ekranda gördüğünüz:
- **Custom Prefix:** `BLOB` (sol taraf)
- **Sabit kısım:** `_READ_WRITE_TOKEN` (sağ taraf)
- **Sonuç:** `BLOB_READ_WRITE_TOKEN` ✅

**ÖNEMLİ:** Prefix'i `BLOB` olarak bırakın! Kodda `BLOB_READ_WRITE_TOKEN` kullanıyoruz.

### 2. Environments: Hepsi İşaretli Olmalı

- ✅ **Development** (işaretli)
- ✅ **Preview** (işaretli)
- ✅ **Production** (işaretli)

Hepsi işaretli olmalı - böylece tüm ortamlarda çalışır.

### 3. "Connect" Butonuna Tıklayın

"Connect" butonuna tıklayın. Vercel otomatik olarak:
- ✅ `BLOB_READ_WRITE_TOKEN` environment variable'ını oluşturacak
- ✅ Tüm environment'lara (Development, Preview, Production) ekleyecek
- ✅ Projeye bağlayacak

## 🚀 Sonraki Adımlar

### 1. Deploy Bekleyin

"Connect" butonuna tıkladıktan sonra:
- Vercel otomatik olarak yeni bir deploy başlatacak
- Environment variable eklenecek
- Deploy tamamlandığında file upload çalışacak

### 2. Test Edin

Deploy tamamlandıktan sonra:
1. Admin paneline giriş yapın: `/admin/login`
2. Görseller sekmesine gidin
3. Bir dosya yüklemeyi deneyin
4. Başarılı olmalı! ✅

## 🔍 Kontrol Etmek İçin

### Environment Variables Kontrol:

1. Vercel Dashboard > Settings > Environment Variables
2. `BLOB_READ_WRITE_TOKEN` görünmeli
3. Environments: Development, Preview, Production (hepsi)
4. Value: Token değeri (gizli)

### Deploy Kontrol:

1. Vercel Dashboard > Deployments
2. Son deployment'ı kontrol edin
3. "Building" veya "Ready" durumunda olmalı
4. Logs'da hata olmamalı

## 📝 Notlar

### Prefix Neden "BLOB"?

- Kodda `process.env.BLOB_READ_WRITE_TOKEN` kullanıyoruz
- Prefix `BLOB` + Sabit `_READ_WRITE_TOKEN` = `BLOB_READ_WRITE_TOKEN` ✅
- Başka bir prefix kullanırsanız kod çalışmaz!

### Environment Variables:

- **Development:** Local development için
- **Preview:** Preview deployments için
- **Production:** Production için
- Hepsi işaretli olmalı!

## 🆘 Sorun Giderme

### "Connect" Butonu Çalışmıyor:
1. Sayfayı yenileyin
2. Tarayıcı cache'ini temizleyin
3. Tekrar deneyin

### Environment Variable Görünmüyor:
1. Vercel Dashboard > Settings > Environment Variables
2. `BLOB_READ_WRITE_TOKEN` arayın
3. Yoksa Storage > Blob Storage > Settings > Tokens'dan oluşturun

### File Upload Hala Çalışmıyor:
1. Deploy'ın tamamlandığından emin olun
2. Environment variable'ın doğru yüklendiğinden emin olun
3. Browser console'u kontrol edin (F12)
4. Vercel logs'u kontrol edin

---

**Özet:** Custom Prefix'i `BLOB` olarak bırakın ve "Connect" butonuna tıklayın! 🚀

