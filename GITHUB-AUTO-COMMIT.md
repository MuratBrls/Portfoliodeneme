# GitHub Otomatik Commit Kurulumu

Vercel'de admin panelden yapılan artist ekleme/düzenleme/silme işlemleri otomatik olarak GitHub'a commit edilir.

## Gereksinimler

1. **GitHub Personal Access Token (PAT)**
   - GitHub hesabınıza giriş yapın
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token (classic)" tıklayın
   - Token'a bir isim verin (örn: "Vercel Portfolio Auto Commit")
   - Şu izinleri seçin:
     - `repo` (Full control of private repositories)
   - Token'ı oluşturun ve kopyalayın (bir daha gösterilmeyecek!)

2. **Vercel Environment Variables**
   - Vercel dashboard'a gidin
   - Projenizi seçin
   - Settings → Environment Variables
   - Şu değişkenleri ekleyin:
     - `GITHUB_TOKEN`: GitHub Personal Access Token'ınız
     - `GITHUB_OWNER`: GitHub kullanıcı adınız (varsayılan: "MuratBrls")
     - `GITHUB_REPO`: Repository adı (varsayılan: "Portfoliodeneme")

## Nasıl Çalışır?

1. Vercel'de admin panelden artist ekleme/düzenleme/silme yaptığınızda:
   - Metadata dosyası GitHub'dan okunur
   - Güncellemeler yapılır
   - Değişiklikler otomatik olarak GitHub'a commit edilir
   - Vercel otomatik olarak yeni deployment başlatır

2. Local'de çalışırken:
   - Metadata dosyası local file system'den okunur/yazılır
   - GitHub commit yapılmaz (manuel commit yapabilirsiniz)

## Notlar

- GitHub token'ınızı asla public repository'lere commit etmeyin
- Token'ı sadece Vercel environment variables'da saklayın
- Token'ın sadece gerekli izinleri olduğundan emin olun

