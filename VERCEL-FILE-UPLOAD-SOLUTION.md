# 🚨 Vercel File Upload Sorunu ve Çözümü

## ❌ Sorun

Vercel'de production ortamında **file system read-only**'dir. Runtime'da `public` klasörüne yazma yapılamaz.

Bu yüzden:
- ❌ File upload çalışmıyor
- ❌ "Yükleme sırasında hata oluştu" hatası alınıyor
- ❌ Dosyalar kaydedilemiyor

## ✅ Çözüm Seçenekleri

### Seçenek 1: Vercel Blob Storage (Önerilen)

Vercel Blob Storage, Vercel'in kendi storage servisidir ve file upload için ideal çözümdür.

#### Avantajlar:
- ✅ Vercel ile entegre
- ✅ Kolay kurulum
- ✅ Ücretsiz tier mevcut
- ✅ CDN desteği
- ✅ Otomatik optimizasyon

#### Kurulum:

1. **Vercel Blob Storage paketini yükleyin:**
```bash
npm install @vercel/blob
```

2. **Vercel Dashboard'da Blob Storage'ı aktifleştirin:**
   - Vercel Dashboard > Storage > Create Database
   - "Blob" seçin
   - Storage'ı oluşturun

3. **Environment Variable ekleyin:**
   - Vercel Dashboard > Settings > Environment Variables
   - `BLOB_READ_WRITE_TOKEN` ekleyin (Vercel otomatik oluşturur)

4. **API route'unu güncelleyin:**
   - File upload endpoint'ini Vercel Blob Storage kullanacak şekilde güncelleyin

### Seçenek 2: External Storage (S3, Cloudinary, etc.)

External storage servisleri kullanarak file upload yapabilirsiniz.

#### Popüler Seçenekler:
- **AWS S3**: En popüler, güvenilir
- **Cloudinary**: Image optimization, CDN
- **Supabase Storage**: Ücretsiz tier, kolay kurulum
- **Uploadcare**: Image optimization, CDN

### Seçenek 3: GitHub + Vercel (Mevcut Çözüm)

Mevcut çözüm: Dosyaları GitHub'a commit edip Vercel'de deploy etmek.

#### Nasıl Çalışır:
1. Local'de file upload yapın
2. Dosyaları GitHub'a commit edin
3. Vercel otomatik deploy eder
4. Dosyalar `public` klasöründe görünür

#### Avantajlar:
- ✅ Ücretsiz
- ✅ Basit
- ✅ Version control

#### Dezavantajlar:
- ❌ Runtime'da upload yapılamaz
- ❌ Her upload için commit gerekir
- ❌ Yavaş (deploy süresi)

## 🎯 Önerilen Çözüm: Vercel Blob Storage

Vercel Blob Storage, Vercel'de file upload için en iyi çözümdür.

### Adım Adım Kurulum:

#### 1. Paketi Yükleyin:
```bash
npm install @vercel/blob
```

#### 2. Vercel Dashboard'da Blob Storage Oluşturun:
1. Vercel Dashboard > Storage > Create Database
2. "Blob" seçin
3. Storage adı: `portfolio-media`
4. Create butonuna tıklayın

#### 3. Environment Variable:
Vercel otomatik olarak `BLOB_READ_WRITE_TOKEN` oluşturur.

#### 4. API Route Güncelleme:

`src/app/api/admin/works/route.ts` dosyasını güncelleyin:

```typescript
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  // ... validation code ...
  
  // Upload to Vercel Blob Storage
  const blob = await put(fileName, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  
  // Save blob URL to metadata
  const publicUrl = blob.url;
  
  return NextResponse.json({
    success: true,
    url: publicUrl,
    message: "Dosya yüklendi",
  });
}
```

#### 5. Metadata Güncelleme:

Blob URL'lerini metadata'da saklamak için `data/artists-metadata.json` yapısını güncelleyin.

## 🔄 Geçici Çözüm (Şu An İçin)

Şu an için file upload Vercel'de çalışmıyor. Geçici çözüm:

### Local Development:
1. Local'de file upload yapın
2. Dosyaları GitHub'a commit edin
3. Vercel otomatik deploy eder

### Production:
1. Dosyaları local'de hazırlayın
2. GitHub'a push edin
3. Vercel otomatik deploy eder

## 📝 Notlar

### Vercel Blob Storage Limitleri:
- ✅ Ücretsiz tier: 1GB storage
- ✅ Ücretsiz tier: 100GB bandwidth/ay
- ✅ CDN dahil
- ✅ Otomatik optimizasyon

### External Storage Limitleri:
- **AWS S3**: Pay as you go
- **Cloudinary**: Ücretsiz tier: 25GB storage
- **Supabase**: Ücretsiz tier: 1GB storage
- **Uploadcare**: Ücretsiz tier: 3GB storage

## 🚀 Hızlı Başlangıç (Vercel Blob Storage)

1. **Paketi yükleyin:**
```bash
npm install @vercel/blob
```

2. **Vercel Dashboard'da Blob Storage oluşturun**

3. **API route'unu güncelleyin** (yukarıdaki örneğe bakın)

4. **Test edin**

## 🔒 Güvenlik

### Vercel Blob Storage:
- ✅ Token-based authentication
- ✅ Access control
- ✅ CDN security
- ✅ HTTPS only

### External Storage:
- ✅ IAM policies (AWS S3)
- ✅ API keys (Cloudinary)
- ✅ Row-level security (Supabase)

## 📞 Yardım

Sorun yaşarsanız:
1. Vercel Blob Storage dokümantasyonuna bakın
2. Vercel support'a danışın
3. External storage dokümantasyonuna bakın

---

**Öneri:** Vercel Blob Storage kullanın - Vercel ile en iyi entegrasyonu sağlar.

