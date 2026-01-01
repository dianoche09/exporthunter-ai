# ⚡ TEK TIKLA KURULUM - 5 DAKİKA!

## 🎯 ADIM 1: Projeyi İndir

Bu klasörü bilgisayarına indir veya:

```bash
# GitHub'dan clone yapacaksan (henüz yok ama gelecekte):
git clone https://github.com/yourname/exporthunter-ai.git
cd exporthunter-ai
```

## 🎯 ADIM 2: Otomatik Kurulum

```bash
# Tüm bağımlılıkları yükle
npm install

# MongoDB ve Redis'i Docker ile başlat
docker-compose up -d

# Environment dosyasını oluştur
cp .env.example .env
```

## 🎯 ADIM 3: API Anahtarlarını Al (5 dakika)

### MongoDB Atlas (ÜCRETSİZ)
1. https://mongodb.com/cloud/atlas/register
2. Create Free Cluster → M0 (512MB Free)
3. Connect → Drivers → Copy connection string
4. `.env` dosyasına yapıştır

### Claude API ($15/ay - TEK ÜCRET)
1. https://console.anthropic.com
2. Get API Key
3. `.env` dosyasına: `ANTHROPIC_API_KEY=sk-ant-...`

### Resend Email (3,000/ay ÜCRETSİZ)
1. https://resend.com/signup
2. Get API Key
3. `.env` dosyasına: `RESEND_API_KEY=re_...`

## 🎯 ADIM 4: ÇALIŞTIR!

```bash
npm run dev
```

**TAMAM!** 🎉

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

---

## 💰 Toplam Maliyet

**İLK 1000 KULLANICI:**
- MongoDB: $0
- Email: $0
- Claude API: $15-20/ay
- **TOPLAM: $20/ay**

**10,000 KULLANICI:**
- MongoDB: $57/ay (M10 cluster)
- Email: $0 (hala free tier)
- Claude API: $100-150/ay
- **TOPLAM: $150-200/ay**

---

## 🚀 Production Deploy (10 dakika, BEDAVA!)

### Frontend → Vercel (Free tier)
```bash
cd frontend
npm install -g vercel
vercel login
vercel deploy --prod
```

### Backend → Railway (Free $5 credit/ay)
```bash
cd backend
npm install -g @railway/cli
railway login
railway link
railway up
```

**Bitti!** Production'da çalışıyor! 🎊

---

## 🐛 Troubleshooting

### "MongoDB connection failed"
```bash
# Local MongoDB kullan
docker-compose up -d mongodb

# .env dosyasında:
MONGODB_URI=mongodb://localhost:27017/exporthunter
```

### "Port 3000 already in use"
```bash
# Portu değiştir
PORT=3002 npm run dev:frontend
```

### "Claude API not working"
- API key doğru mu?
- Billing aktif mi?
- Console.anthropic.com'da kontrol et

---

## 📞 Yardım

- Sorun mu var? Issue aç: github.com/yourname/exporthunter-ai/issues
- Email: support@exporthunter.ai
- Discord: discord.gg/exporthunter

**BAŞARILAR!** 🚀
