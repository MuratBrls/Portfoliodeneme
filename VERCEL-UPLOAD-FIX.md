# 🔧 Vercel File Upload Sorun Giderme

## 🐛 Sorun

Vercel'de file upload yaparken "Unexpected token 'R', "Request En"... is not valid JSON" hatası alınıyor.

## 🔍 Olası Nedenler

### 1. Request Body Size Limiti
- Vercel'in request body size limiti: **4.5MB** (Hobby plan)
- Dosya 4.5MB'dan büyükse hata verebilir
- Çözüm: Dosya boyutunu küçültün veya Pro plan'a geçin

### 2. API Route Configuration
- Next.js App Router'da FormData otomatik handle edilir
- Ama bazen Vercel'de sorun olabilir
- Çözüm: API route'un doğru çalıştığından emin olun

### 3. Runtime Configuration
- Vercel'de Node.js runtime version'ı önemli
- Çözüm: `package.json`'da Node.js version belirtin

## ✅ Yapılan Düzeltmeler

### 1. JSON Parse Hatası Düzeltildi
- Response önce text olarak okunuyor
- Sonra JSON'a parse ediliyor
- Parse başarısız olursa kullanıcıya anlamlı hata mesajı gösteriliyor

### 2. Hata Mesajları İyileştirildi
- Dosya boyutu hatası: "Dosya çok büyük. Maksimum dosya boyutu 50MB'dır."
- Oturum hatası: "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın."
- Diğer hatalar: Status code ve mesaj gösteriliyor

## 🔧 Vercel Configuration

### Vercel.json Güncellemesi (Gerekirse)

Eğer sorun devam ederse, `vercel.json` dosyasına şunu ekleyebilirsiniz:

```json
{
  "functions": {
    "src/app/api/admin/works/route.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### Next.js Config (Gerekirse)

`next.config.ts` dosyasına şunu ekleyebilirsiniz:

```typescript
const nextConfig: NextConfig = {
  // ... existing config
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};
```

## 📝 Kontrol Listesi

- [ ] Dosya boyutu 50MB'dan küçük mü?
- [ ] Dosya formatı destekleniyor mu? (JPG, PNG, WEBP, GIF)
- [ ] Vercel'de environment variables doğru mu?
- [ ] API route çalışıyor mu?
- [ ] Browser console'da hata var mı?

## 🆘 Sorun Devam Ederse

1. **Vercel Logs Kontrol:**
   - Vercel Dashboard > Deployments > Son deployment > Logs
   - Hata mesajını kontrol edin

2. **Browser Console Kontrol:**
   - F12 > Console
   - Hata mesajını kontrol edin

3. **Network Tab Kontrol:**
   - F12 > Network
   - Request'i kontrol edin
   - Response'u kontrol edin

4. **Dosya Boyutu Kontrol:**
   - Dosya 4.5MB'dan küçük mü?
   - Dosya formatı doğru mu?

## 🔄 Test Etmek İçin

1. Küçük bir dosya yükleyin (1MB altı)
2. Orta boyutlu bir dosya yükleyin (5-10MB)
3. Büyük bir dosya yükleyin (20-30MB)
4. Her durumda hata mesajını kontrol edin

## 📞 Destek

Sorun devam ederse:
1. Vercel logs'u paylaşın
2. Browser console'u paylaşın
3. Network tab'ı paylaşın
4. Hata mesajını paylaşın

---

**Not:** Vercel Hobby plan'da request body size limiti 4.5MB'dır. Daha büyük dosyalar için Pro plan gerekebilir.

