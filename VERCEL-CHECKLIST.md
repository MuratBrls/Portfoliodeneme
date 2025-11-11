# Vercel Deploy Kontrol Listesi

## ✅ Doğru Ayarlar

- [x] Repository: MuratBrls/Portfoliodeneme
- [x] Branch: main
- [x] Framework: Next.js
- [x] Build Command: npm run build
- [x] Output Directory: Next.js default
- [x] Install Command: npm install
- [x] ADMIN_PASSWORD: 18811938Murat

## ⚠️ Eksik: NODE_ENV Ekleyin

**Yapmanız Gerekenler:**

1. Environment Variables bölümünde `+ Add More` butonuna tıklayın
2. Yeni variable ekleyin:
   - **Key:** `NODE_ENV`
   - **Value:** `production`
   - **Environment:** Production, Preview, Development (hepsini seçin)
3. "Add" butonuna tıklayın

## 🔍 Environment Variables Kontrolü

Her iki environment variable için şunları kontrol edin:

- ✅ **ADMIN_PASSWORD** = 18811938Murat
- ✅ **NODE_ENV** = production

**Environment seçenekleri:** Production, Preview, Development (hepsini seçin)

## 🚀 Deploy Öncesi Son Kontrol

- [ ] NODE_ENV eklendi
- [ ] ADMIN_PASSWORD doğru
- [ ] Environment seçenekleri doğru (Production, Preview, Development)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `Next.js default`

## 📝 Notlar

- NODE_ENV olmadan da çalışabilir (Next.js otomatik ayarlar) ama eklemek daha iyi
- ADMIN_PASSWORD mutlaka olmalı
- Environment variables ekledikten sonra "Deploy" butonuna tıklayın
- Deploy 1-2 dakika sürebilir

## 🎯 Deploy Sonrası

Deploy tamamlandıktan sonra:

1. Site URL'ini kontrol edin
2. Admin panel'e giriş yapmayı deneyin: `/admin/login`
3. Şifrenin çalıştığını test edin
4. Production'da şifreyi değiştirmeyi unutmayın!

---

**Her şey hazır olduğunda "Deploy" butonuna tıklayın! 🚀**

