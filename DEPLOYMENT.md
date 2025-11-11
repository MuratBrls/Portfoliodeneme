# Portfolio Site - Deployment Rehberi

Bu dokümantasyon, portfolio siteyi production'a deploy etmek için gerekli adımları içerir.

## 🚀 Hızlı Başlangıç - Vercel (Önerilen)

Vercel, Next.js'in sahibi tarafından geliştirilmiş platformdur ve en kolay deployment yöntemidir.

### Adım 1: Vercel Hesabı Oluştur
1. [Vercel.com](https://vercel.com) adresine gidin
2. "Sign Up" ile GitHub, GitLab veya Email ile hesap oluşturun

### Adım 2: Projeyi Vercel'e Yükle
**Seçenek A: GitHub ile (Önerilen)**
1. Projenizi GitHub'a push edin
2. Vercel'de "New Project" seçin
3. GitHub repository'nizi bağlayın
4. Vercel otomatik olarak Next.js projesini algılar

**Seçenek B: Vercel CLI ile**
```bash
# Vercel CLI'yı global olarak yükleyin
npm i -g vercel

# Proje klasöründe
vercel

# İlk deploy için soruları cevaplayın
# Production deploy için
vercel --prod
```

### Adım 3: Environment Variables Ayarla
1. Vercel Dashboard'da projenize gidin
2. "Settings" > "Environment Variables" bölümüne gidin
3. Aşağıdaki değişkenleri ekleyin:

```
ADMIN_PASSWORD=18811938Murat
NODE_ENV=production
```

**ÖNEMLİ:** Şifreyi production'da mutlaka güçlü bir şifre ile değiştirin!

### Adım 4: Deploy
- GitHub ile bağladıysanız: Her push otomatik deploy edilir
- CLI ile: `vercel --prod` komutunu çalıştırın

### Adım 5: Domain Ayarla (Opsiyonel)
1. Vercel Dashboard'da "Settings" > "Domains"
2. Kendi domain'inizi ekleyin
3. DNS ayarlarını yapın (Vercel size talimatlar verir)

---

## 🌐 Netlify ile Deploy

### Adım 1: Netlify Hesabı
1. [Netlify.com](https://netlify.com) adresine gidin
2. Hesap oluşturun

### Adım 2: Projeyi Deploy Et
**GitHub ile:**
1. "New site from Git" seçin
2. Repository'nizi bağlayın
3. Build ayarları:
   - Build command: `npm run build`
   - Publish directory: `.next`

**Manuel Upload:**
1. Projeyi build edin: `npm run build`
2. Netlify'da "Deploy manually" seçin
3. `.next` klasörünü yükleyin

### Adım 3: Environment Variables
1. "Site settings" > "Environment variables"
2. `ADMIN_PASSWORD` ve `NODE_ENV=production` ekleyin

---

## 🖥️ Kendi Sunucunuzda Deploy (VPS/Dedicated Server)

### Gereksinimler
- Node.js 18+ yüklü
- PM2 (process manager) veya systemd
- Nginx veya Apache (reverse proxy)
- SSL sertifikası (Let's Encrypt)

### Adım 1: Sunucuya Dosyaları Yükle
```bash
# Sunucuya bağlanın
ssh user@your-server.com

# Proje klasörüne gidin
cd /var/www/portfolio-site

# Dosyaları yükleyin (FTP, SCP veya Git ile)
git clone your-repo-url .
# veya
scp -r portfolio-site/* user@server:/var/www/portfolio-site/
```

### Adım 2: Dependencies Yükle
```bash
npm install --production
```

### Adım 3: Environment Variables
```bash
# .env.local dosyası oluştur
nano .env.local

# İçeriğini ekleyin:
ADMIN_PASSWORD=your-strong-password-here
NODE_ENV=production
```

### Adım 4: Build
```bash
npm run build
```

### Adım 5: PM2 ile Çalıştır
```bash
# PM2'yi global olarak yükleyin
npm install -g pm2

# Uygulamayı başlatın
pm2 start npm --name "portfolio-site" -- start

# PM2'nin sunucu başlangıcında otomatik başlaması için
pm2 startup
pm2 save
```

### Adım 6: Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/portfolio-site
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Adım 7: SSL Sertifikası (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🐳 Docker ile Deploy

### Dockerfile Oluştur
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### next.config.ts Güncelleme
```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // Docker için gerekli
  // ... diğer ayarlar
};
```

### Docker Compose
```yaml
version: '3.8'
services:
  portfolio-site:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ADMIN_PASSWORD=your-password-here
      - NODE_ENV=production
    volumes:
      - ./public/artists:/app/public/artists
      - ./data:/app/data
```

### Çalıştırma
```bash
docker-compose up -d
```

---

## ✅ Production Öncesi Kontrol Listesi

- [ ] `ADMIN_PASSWORD` güçlü bir şifre ile değiştirildi (en az 12 karakter)
- [ ] `NODE_ENV=production` ayarlandı
- [ ] Build başarıyla tamamlandı: `npm run build`
- [ ] Tüm environment variables ayarlandı
- [ ] SSL sertifikası kuruldu (HTTPS)
- [ ] Admin panel login testi yapıldı
- [ ] File upload testi yapıldı
- [ ] Contact form testi yapıldı
- [ ] Güvenlik headers kontrol edildi
- [ ] Rate limiting çalışıyor
- [ ] Error handling test edildi

---

## 🔒 Güvenlik Notları

1. **Admin Şifresi:**
   - Production'da mutlaka güçlü bir şifre kullanın
   - En az 12 karakter, büyük/küçük harf, sayı, özel karakter
   - Varsayılan şifre (`admin123`) asla kullanmayın

2. **Environment Variables:**
   - `.env.local` dosyası asla git'e commit edilmemeli
   - Production'da environment variables platform üzerinden ayarlanmalı

3. **File Upload:**
   - Dosya boyutu limiti: 50MB
   - Sadece izin verilen dosya tipleri kabul edilir
   - Path traversal koruması aktif

4. **Rate Limiting:**
   - Login: 5 attempt / 15 dakika
   - Contact form: 10 submission / saat
   - Production'da Redis gibi bir çözüm kullanılması önerilir

---

## 🐛 Sorun Giderme

### Build Hatası
```bash
# Cache'i temizle
rm -rf .next
npm run build
```

### Environment Variables Çalışmıyor
- Vercel/Netlify'da environment variables'ı kontrol edin
- Deploy sonrası environment variables değiştiyse yeniden deploy edin
- `.env.local` dosyasının doğru yerde olduğundan emin olun

### Admin Panel Erişilemiyor
- Cookie ayarlarını kontrol edin (secure, sameSite)
- HTTPS kullanıldığından emin olun
- Environment variable'ın doğru yüklendiğini kontrol edin

### Dosya Upload Çalışmıyor
- Dosya boyutu limitini kontrol edin
- Dosya tipinin izin verilen listede olduğunu kontrol edin
- Disk alanını kontrol edin

---

## 📞 Destek

Sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Server loglarını kontrol edin
3. Environment variables'ı kontrol edin
4. Build loglarını kontrol edin

---

## 🔄 Güncelleme

Siteyi güncellemek için:

**Vercel/Netlify:**
- GitHub'a push yapın, otomatik deploy edilir

**VPS:**
```bash
git pull
npm install
npm run build
pm2 restart portfolio-site
```

**Docker:**
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

