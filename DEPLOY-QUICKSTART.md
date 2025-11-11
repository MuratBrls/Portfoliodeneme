# 🚀 Hızlı Deploy Rehberi - Vercel (5 Dakika)

## Adım 1: GitHub'a Yükle (2 dakika)

1. **GitHub'da yeni repository oluştur:**
   - https://github.com/new adresine gidin
   - Repository adı: `portfolio-site` (veya istediğiniz isim)
   - Public veya Private seçin
   - "Create repository" tıklayın

2. **Projeyi GitHub'a push edin:**
   ```bash
   # Eğer henüz git init yapmadıysanız
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADI/portfolio-site.git
   git push -u origin main
   ```

## Adım 2: Vercel'e Deploy Et (3 dakika)

1. **Vercel'e git:**
   - https://vercel.com adresine gidin
   - "Sign Up" ile GitHub hesabınızla giriş yapın

2. **Yeni proje oluştur:**
   - "Add New..." > "Project" tıklayın
   - GitHub repository'nizi seçin
   - "Import" tıklayın

3. **Environment Variables ekle:**
   - "Environment Variables" bölümüne gidin
   - Aşağıdakileri ekleyin:
     ```
     ADMIN_PASSWORD = 18811938Murat
     NODE_ENV = production
     ```
   - "Save" tıklayın

4. **Deploy:**
   - "Deploy" butonuna tıklayın
   - 1-2 dakika bekleyin
   - ✅ Site yayında!

## Adım 3: Domain Ayarla (Opsiyonel)

1. Vercel Dashboard'da projenize gidin
2. "Settings" > "Domains" bölümüne gidin
3. Kendi domain'inizi ekleyin (örn: `www.kolektif.com`)
4. DNS ayarlarını yapın (Vercel size talimatlar verir)

## ✅ Tamamlandı!

Siteniz şu adreste yayında:
- **Vercel URL:** `https://portfolio-site-xxxxx.vercel.app`
- **Custom Domain:** (eğer eklediyseniz) `https://yourdomain.com`

## 🔒 Güvenlik Hatırlatması

Production'da admin şifresini mutlaka değiştirin:
1. Vercel Dashboard > Settings > Environment Variables
2. `ADMIN_PASSWORD` değerini güçlü bir şifre ile değiştirin
3. "Redeploy" yapın

## 🔄 Güncelleme

Siteyi güncellemek için:
1. Kod değişikliklerini yapın
2. GitHub'a push edin: `git push`
3. Vercel otomatik olarak deploy eder

## 📝 Notlar

- İlk deploy 1-2 dakika sürebilir
- Sonraki deploy'lar genellikle 30-60 saniye sürer
- Vercel ücretsiz planında:
  - Unlimited deployments
  - 100GB bandwidth
  - SSL sertifikası dahil
  - Global CDN

## 🆘 Sorun mu Yaşıyorsunuz?

1. **Build hatası:** Vercel Dashboard > Deployments > Logs'u kontrol edin
2. **Environment variables çalışmıyor:** Deploy sonrası değiştiyse "Redeploy" yapın
3. **Admin panel açılmıyor:** Environment variables'ı kontrol edin

---

**Diğer deployment seçenekleri için:** `DEPLOYMENT.md` dosyasına bakın.

