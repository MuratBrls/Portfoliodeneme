# Güvenlik Dokümantasyonu

## Production Deployment Öncesi Kontrol Listesi

### 1. Environment Variables
- [ ] `ADMIN_PASSWORD` environment variable'ı mutlaka ayarlanmalı
- [ ] Şifre en az 12 karakter olmalı
- [ ] Varsayılan şifre (`admin123`) production'da kullanılmamalı
- [ ] `.env.local` dosyası git'e commit edilmemeli (zaten .gitignore'da)

### 2. Admin Panel Güvenliği
- ✅ HTTP-only cookies kullanılıyor
- ✅ Secure flag production'da aktif
- ✅ SameSite=strict ayarı
- ✅ Rate limiting: 5 login attempt / 15 dakika
- ⚠️ Production'da güçlü şifre zorunluluğu kontrol ediliyor

### 3. File Upload Güvenliği
- ✅ Dosya tipi validasyonu (extension + MIME type)
- ✅ Dosya boyutu limiti (50MB)
- ✅ Sadece izin verilen dosya tipleri kabul ediliyor
- ✅ Path traversal koruması
- ✅ Slug validasyonu

### 4. Input Validation
- ✅ Slug validasyonu (sadece alphanumeric, hyphen, underscore)
- ✅ Email validasyonu
- ✅ String sanitization (XSS koruması)
- ✅ Path traversal koruması
- ✅ Reserved name kontrolü

### 5. API Güvenliği
- ✅ Tüm admin endpoint'leri authentication gerektiriyor
- ✅ Rate limiting (contact form: 10/hour, login: 5/15min)
- ✅ Input sanitization
- ✅ Error messages production'da sanitize ediliyor

### 6. Security Headers
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Strict-Transport-Security
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### 7. Contact Form
- ✅ Rate limiting: 10 submission / hour
- ✅ Input validation ve sanitization
- ✅ Email format kontrolü

## Production Deployment Adımları

1. **Environment Variables Ayarla:**
   ```bash
   ADMIN_PASSWORD=güçlü-şifre-buraya
   NODE_ENV=production
   ```

2. **Şifre Güvenliği:**
   - En az 12 karakter
   - Büyük/küçük harf, sayı, özel karakter içermeli
   - Production'da default şifre kullanılmamalı

3. **Build:**
   ```bash
   npm run build
   ```

4. **Test:**
   - Admin panel login testi
   - File upload testi
   - Contact form testi
   - Rate limiting testi

## Güvenlik Notları

- Rate limiting şu anda in-memory olarak çalışıyor. Production'da Redis gibi bir çözüm kullanılması önerilir.
- Contact form şu anda sadece logluyor. Email servisi entegrasyonu yapılmalı.
- Admin password production'da mutlaka değiştirilmeli.
- Debug bilgileri production'da gösterilmiyor.

## Bilinen Sınırlamalar

- Rate limiting in-memory (server restart'ta sıfırlanır)
- Contact form email göndermiyor (sadece logluyor)
- Single admin password (multi-user yok)

## Önerilen İyileştirmeler

1. Redis tabanlı rate limiting
2. Email servisi entegrasyonu (Resend, SendGrid)
3. Database entegrasyonu (şu anda file-based)
4. Multi-user admin sistemi
5. Audit logging
6. CSRF token koruması (Next.js default olarak sağlar ama kontrol edilmeli)

