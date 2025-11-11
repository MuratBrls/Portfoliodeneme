# 🎉 Deploy Sonrası Kontrol Listesi

## ✅ Deploy Tamamlandı!

Tebrikler! Siteniz artık canlıda.

## 🔍 İlk Kontroller

### 1. Site URL'ini Kontrol Edin
- Vercel Dashboard'da göreceğiniz URL: `https://portfoliodeneme-xxxxx.vercel.app`
- Siteyi tarayıcıda açın ve çalıştığını kontrol edin

### 2. Ana Sayfa Testi
- [ ] Ana sayfa açılıyor mu?
- [ ] Görseller görünüyor mu?
- [ ] Navigation çalışıyor mu?

### 3. Admin Panel Testi
1. `/admin/login` sayfasına gidin
2. Şifre ile giriş yapın: `18811938Murat`
3. Admin panel açılıyor mu?
4. Görseller görünüyor mu?
5. Sanatçılar listeleniyor mu?

### 4. Diğer Sayfalar
- [ ] `/artists` sayfası çalışıyor mu?
- [ ] `/artists/[slug]` sayfaları açılıyor mu?
- [ ] `/editorial` sayfası çalışıyor mu?
- [ ] `/contact` sayfası çalışıyor mu?

## 🔒 Güvenlik Kontrolleri

### 1. Admin Şifresi Kontrolü
- [ ] Admin panele giriş yapabiliyor musunuz?
- [ ] Şifre doğru çalışıyor mu?
- ⚠️ **ÖNEMLİ:** Production'da şifreyi mutlaka değiştirin!

### 2. Environment Variables
- Vercel Dashboard > Settings > Environment Variables
- [ ] `ADMIN_PASSWORD` doğru ayarlanmış mı?
- [ ] `NODE_ENV` = `production` mı?
- [ ] Environment seçenekleri doğru mu? (Production, Preview, Development)

## 🛠️ Sorun Giderme

### Site Açılmıyor
1. Vercel Dashboard > Deployments > Son deployment'a tıklayın
2. "Logs" sekmesine bakın
3. Hata mesajını kontrol edin
4. Build loglarını inceleyin

### Admin Panel Açılmıyor
1. Environment Variables'ı kontrol edin
2. `ADMIN_PASSWORD` doğru mu?
3. Cookie'leri temizleyin ve tekrar deneyin
4. Farklı bir tarayıcıda deneyin

### Görseller Görünmüyor
1. `public/artists/` klasöründeki dosyalar GitHub'a push edildi mi?
2. Vercel'de dosyalar var mı?
3. Browser console'da hata var mı? (F12)

### Build Hatası
1. Vercel Dashboard > Deployments > Logs
2. Hata mesajını okuyun
3. Local'de test edin: `npm run build`
4. Hata devam ederse GitHub'a issue açın

## 🔄 Güncelleme

### Kod Güncelleme
```bash
# Değişiklikleri yapın
git add .
git commit -m "Update message"
git push
```

Vercel otomatik olarak yeni deploy başlatacak!

### Environment Variable Değişikliği
1. Vercel Dashboard > Settings > Environment Variables
2. Variable'ı düzenleyin
3. "Save" tıklayın
4. **"Redeploy" yapın** (önemli!)

## 🌐 Custom Domain (Opsiyonel)

### Domain Eklemek
1. Vercel Dashboard > Settings > Domains
2. Domain'inizi ekleyin (örn: `www.kolektif.com`)
3. DNS ayarlarını yapın:
   - A record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
4. SSL sertifikası otomatik kurulacak (5-10 dakika)

### DNS Ayarları
Vercel size DNS ayarları için detaylı talimatlar verecek.

## 📊 Monitoring

### Vercel Analytics (Opsiyonel)
1. Vercel Dashboard > Analytics
2. Ücretsiz plan için temel analytics mevcut
3. Traffic, performance, errors görüntüleyebilirsiniz

### Logs
1. Vercel Dashboard > Deployments > Logs
2. Real-time logları görüntüleyebilirsiniz
3. Hata ayıklama için kullanabilirsiniz

## 🔐 Production Güvenlik Checklist

- [ ] Admin şifresi güçlü bir şifre ile değiştirildi (en az 12 karakter)
- [ ] Environment variables doğru ayarlandı
- [ ] HTTPS aktif (otomatik)
- [ ] Security headers aktif (next.config.ts'de)
- [ ] Rate limiting çalışıyor
- [ ] File upload güvenliği aktif
- [ ] Input validation çalışıyor

## 📝 Notlar

- İlk deploy 1-2 dakika sürebilir
- Sonraki deploy'lar genellikle 30-60 saniye sürer
- Vercel ücretsiz planında:
  - Unlimited deployments
  - 100GB bandwidth/ay
  - SSL sertifikası dahil
  - Global CDN
  - Preview deployments

## 🆘 Yardım

Sorun yaşarsanız:
1. Vercel Dashboard > Deployments > Logs
2. Browser console (F12)
3. Network tab (F12 > Network)
4. Vercel Documentation: https://vercel.com/docs

---

**Başarılar! 🚀**

Site artık canlıda ve kullanıma hazır!

