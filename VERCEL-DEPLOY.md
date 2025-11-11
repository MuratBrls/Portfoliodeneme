# Vercel'e Deploy Adımları

## ✅ 1. GitHub Push Tamamlandı
Projeniz başarıyla GitHub'a yüklendi: https://github.com/MuratBrls/Portfoliodeneme

## 🚀 2. Vercel'e Deploy (5 Dakika)

### Adım 1: Vercel'e Giriş Yap
1. https://vercel.com adresine gidin
2. "Sign Up" butonuna tıklayın
3. "Continue with GitHub" seçin
4. GitHub hesabınızla giriş yapın (MuratBrls)

### Adım 2: Yeni Proje Oluştur
1. Vercel Dashboard'da "Add New..." > "Project" tıklayın
2. GitHub repository listesinden "Portfoliodeneme" repository'sini bulun
3. "Import" butonuna tıklayın

### Adım 3: Project Ayarları
1. **Project Name:** `portfolio-site` (veya istediğiniz isim)
2. **Framework Preset:** Next.js (otomatik algılanacak)
3. **Root Directory:** `./` (varsayılan)
4. **Build Command:** `npm run build` (varsayılan)
5. **Output Directory:** `.next` (varsayılan)

### Adım 4: Environment Variables Ekle
**ÇOK ÖNEMLİ:** Bu adımı yapmadan deploy etmeyin!

1. "Environment Variables" bölümüne gidin
2. Aşağıdaki değişkenleri ekleyin:

```
ADMIN_PASSWORD = 18811938Murat
NODE_ENV = production
```

**Nasıl eklenir:**
- "Key" kısmına: `ADMIN_PASSWORD`
- "Value" kısmına: `18811938Murat`
- "Environment" seçeneklerinden: Production, Preview, Development (hepsini seçin)
- "Add" butonuna tıklayın

Aynı şekilde:
- "Key": `NODE_ENV`
- "Value": `production`
- "Environment": Production, Preview, Development
- "Add" butonuna tıklayın

### Adım 5: Deploy
1. "Deploy" butonuna tıklayın
2. 1-2 dakika bekleyin
3. ✅ Deploy tamamlandığında bir URL alacaksınız: `https://portfoliodeneme-xxxxx.vercel.app`

## 🎉 Tamamlandı!

Siteniz artık canlıda! 

**Site URL'i:** Vercel Dashboard'da göreceksiniz (örn: `https://portfoliodeneme.vercel.app`)

## 🔒 Güvenlik Hatırlatması

**ÖNEMLİ:** Production'da admin şifresini mutlaka değiştirin!

1. Vercel Dashboard > Settings > Environment Variables
2. `ADMIN_PASSWORD` değerini güçlü bir şifre ile değiştirin (en az 12 karakter)
3. "Save" tıklayın
4. "Redeploy" yapın

## 🔄 Güncelleme

Kodunuzu güncellemek için:

```bash
# Değişiklikleri yapın
# Sonra:
git add .
git commit -m "Update message"
git push
```

Vercel otomatik olarak yeni deploy başlatacak!

## 🌐 Custom Domain (Opsiyonel)

Kendi domain'inizi eklemek için:

1. Vercel Dashboard > Settings > Domains
2. Domain'inizi ekleyin (örn: `www.kolektif.com`)
3. Vercel size DNS ayarları için talimatlar verecek
4. DNS ayarlarını yaptıktan sonra SSL sertifikası otomatik kurulacak

## 🆘 Sorun Giderme

### Build Hatası
- Vercel Dashboard > Deployments > Son deployment'a tıklayın
- "Logs" sekmesine bakın
- Hata mesajını kontrol edin

### Admin Panel Açılmıyor
- Environment Variables'ı kontrol edin
- `ADMIN_PASSWORD` doğru ayarlanmış mı?
- Deploy sonrası environment variable eklediyseniz "Redeploy" yapın

### Environment Variables Çalışmıyor
- Environment Variables ekledikten sonra mutlaka "Redeploy" yapın
- Tüm environment'ları (Production, Preview, Development) seçtiğinizden emin olun

## 📞 Yardım

Sorun yaşarsanız:
1. Vercel Dashboard > Deployments > Logs'u kontrol edin
2. Browser console'u kontrol edin (F12)
3. Environment Variables'ı kontrol edin

---

**Başarılar! 🚀**

