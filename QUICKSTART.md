# ⚡ HIZLI BAŞLANGIÇ - 5 DAKİKADA ÇALIŞIR!

## 🎯 Adım 1: Bağımlılıkları Yükle (2 dakika)

```bash
# Root dizinde
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

## 🎯 Adım 2: Ücretsiz Servisler Kur (5 dakika)

### MongoDB Atlas (ÜCRETSİZ)
1. https://www.mongodb.com/cloud/atlas/register git
2. Ücretsiz cluster oluştur (M0 - 512MB)
3. Database → Connect → Application → Connection string kopyala
4. `.env` dosyasına yapıştır

### Resend Email (3,000 EMAIL/AY ÜCRETSİZ)
1. https://resend.com/signup git
2. API Key al
3. `.env` dosyasına ekle

### Claude API ($15/ay)
1. https://console.anthropic.com git
2. API Key al
3. `.env` dosyasına ekle

## 🎯 Adım 3: Environment Ayarla (1 dakika)

```bash
# .env dosyası oluştur
cp .env.example .env

# Düzenle:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exporthunter
ANTHROPIC_API_KEY=sk-ant-api03-xxx
RESEND_API_KEY=re_xxx
```

## 🎯 Adım 4: Çalıştır! (1 dakika)

```bash
# Development mode (Frontend + Backend)
npm run dev
```

**BAŞARILI!** 🎉

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/health

---

## 🚀 İlk Kullanım

1. http://localhost:3000 aç
2. Kayıt ol (email + şifre)
3. "Find Leads" butonuna tıkla
4. Ürün bilgisi gir: "HPMC, Tile Adhesive, Construction Chemicals"
5. Hedef pazar seç: "UAE, Saudi Arabia"
6. **AI 2 dakikada 50+ müşteri bulur!** 🤖

---

## 💸 Toplam Maliyet

**İLK AY:**
- MongoDB Atlas: $0 (Free tier)
- Resend Email: $0 (3,000 email free)
- Claude API: ~$15
- **TOPLAM: $15**

**SCALE OLDUKTAN SONRA:**
- 1,000 kullanıcı için: ~$100-150/ay
- 10,000 kullanıcı için: ~$500-800/ay

---

## 🐛 Sorun mu Var?

### MongoDB bağlanmıyor?
- Cluster IP whitelist: 0.0.0.0/0 ekle
- Database user şifresinde özel karakter olmasın

### Port zaten kullanımda?
```bash
# Backend portu değiştir
PORT=3002 npm run dev:backend
```

### Claude API çalışmıyor?
- API key doğru mu kontrol et
- Billing hesabını aktifleştir

---

## 📦 Production Deploy (Bedava!)

### Vercel (Frontend)
```bash
cd frontend
vercel deploy
```

### Railway (Backend)
```bash
cd backend
railway login
railway init
railway up
```

**10 dakikada production'da!** 🚀
