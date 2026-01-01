# 🎉 ExportHunter AI - Email Service Kurulumu Tamamlandı!

## ✅ Yeni Eklenen Özellikler

### 📧 **Email Service (Backend)**
- ✅ Resend email servisi entegrasyonu
- ✅ Single email gönderimi
- ✅ Batch email (toplu gönderim - 50'ye kadar)
- ✅ Campaign emails (tracking ile)
- ✅ Email tracking (opens & clicks)
- ✅ HTML email templates
- ✅ Rate limiting (saatte 100 email)

### 🎨 **Email UI (Frontend)**
- ✅ CreateCampaignModal - 3 adımlı campaign oluşturma
- ✅ Updated CampaignsPage - Campaign listesi ve yönetimi
- ✅ Updated LeadsPage - Lead seçimi ve campaign oluşturma
- ✅ AI ile otomatik email içeriği oluşturma
- ✅ Çoklu lead seçimi
- ✅ Campaign durumu tracking
- ✅ Email preview
- ✅ Gönderim istatistikleri

---

## 🔧 Kurulum Adımları

### 1. **RESEND_API_KEY Ekleyin**

`.env` dosyanıza Resend API key ekleyin:

```bash
# .env dosyası
RESEND_API_KEY=re_your_api_key_here
```

#### Resend API Key Nasıl Alınır:
1. https://resend.com adresine gidin
2. Ücretsiz hesap oluşturun (ayda 3,000 email FREE!)
3. Dashboard'dan API Keys bölümüne gidin
4. "Create API Key" butonuna tıklayın
5. Key'i kopyalayın ve `.env` dosyasına ekleyin

---

## 📊 API Endpoints

### Campaign Endpoints

#### **Liste**
```
GET /api/campaigns?page=1&limit=20
```

#### **Oluştur**
```
POST /api/campaigns
{
  "name": "Spring Campaign 2024",
  "subject": "Turkish Marble - Special Offer",
  "body": "<html>Your email content</html>",
  "leadIds": ["lead_id_1", "lead_id_2"]
}
```

#### **Gönder**
```
POST /api/campaigns/:id/send
```

#### **İstatistikler**
```
GET /api/campaigns/:id/stats
```

### Tracking Endpoints

#### **Open Tracking**
```
GET /api/track/open/:campaignId/:leadId
```

#### **Click Tracking**
```
GET /api/track/click/:campaignId/:leadId?url=...
```

---

## 🎯 Campaign Oluşturma (Frontend)

### Adım 1: Lead Seçimi
1. **Leads** sayfasına gidin
2. Checkbox'ları kullanarak lead'leri seçin
3. "Create Campaign" butonuna tıklayın

### Adım 2: Campaign Detayları
```javascript
{
  name: "My Campaign",
  subject: "Email Subject",
  // AI ile otomatik oluşturabilirsiniz!
}
```

### Adım 3: Email İçeriği
- **Manuel yazabilirsiniz**, ya da
- **"Generate with AI"** butonuna tıklayın
  - Otomatik olarak lead bilgilerine göre kişiselleştirilmiş email oluşturur
  - Tone seçebilirsiniz: Professional, Friendly, Casual

### Adım 4: Preview & Send
- Email preview'ı görün
- "Send Campaign" ile gönder!

---

## 📈 Email Tracking

### Open Tracking
Campaign'inizdeki her email'de invisible pixel var:
```html
<img src="http://localhost:3001/api/track/open/:campaignId/:leadId" 
     width="1" height="1" />
```

### Click Tracking  
Email içindeki tüm linkler tracking URL'ine wrap edilir:
```
http://localhost:3001/api/track/click/:campaignId/:leadId?url=original_url
```

### İstatistikler
```javascript
{
  sent: 100,
  delivered: 98,
  opened: 45,
  clicked: 12,
  bounced: 2,
  openRate: "45%",
  clickRate: "12%"
}
```

---

## 🎨 Kullanım Örneği

### Backend'de Email Gönderimi
```typescript
import { resendService } from './services/email/resendService';

// Tek email
await resendService.sendSingleEmail({
  to: 'customer@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to ExportHunter!</h1>'
});

// Batch email
await resendService.sendBatchEmail({
  emails: [
    { to: 'user1@example.com', subject: '...', html: '...' },
    { to: 'user2@example.com', subject: '...', html: '...' }
  ]
});

// Campaign email
await resendService.sendCampaignEmail({
  to: 'lead@example.com',
  subject: 'Special Offer',
  html: emailTemplate,
  campaignId: 'camp_123',
  leadId: 'lead_456'
});
```

### Frontend'te Campaign Oluşturma
```typescript
import { campaignsAPI } from './services/api';

// Campaign oluştur
const campaign = await campaignsAPI.createCampaign({
  name: 'Q1 2024 Campaign',
  subject: 'Exclusive Marble Prices',
  body: '<html>Your email</html>',
  leadIds: selectedLeads.map(l => l._id)
});

// Gönder
await campaignsAPI.sendCampaign(campaign.data._id);

// İstatistikleri al
const stats = await campaignsAPI.getCampaignStats(campaign.data._id);
```

---

## 🔐 Rate Limiting

Email gönderiminde rate limiting var:
- **Saatlik limit**: 100 email
- **Günlük limit**: 1000 email (Resend free tier)

Rate limit aşılırsa:
```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again later."
}
```

---

## 📝 Email Template Özellikleri

### Tracking Otomatik Eklenir
```typescript
const template = emailTemplate({
  companyName: 'ABC Corp',
  senderName: 'John Doe',
  senderCompany: 'ExportHunter',
  mainMessage: 'Your email content',
  ctaText: 'View Catalog',
  ctaUrl: 'https://example.com/catalog',
  campaignId: 'camp_123',
  leadId: 'lead_456'
});
```

### Otomatik Özellikler:
- ✅ Responsive design
- ✅ Open tracking pixel
- ✅ Click tracking on all links
- ✅ Professional footers
- ✅ Unsubscribe link

---

## 🚀 Çalıştırma

Artık her şey hazır! Sunucular zaten çalışıyor olmalı:

### Backend
```bash
cd exporthunter-ai/backend
npm run dev
# Running on http://localhost:3001
```

### Frontend
```bash
cd exporthunter-ai/frontend
npm run dev
# Running on http://localhost:3000
```

### Her İkisi Birden
```bash
cd exporthunter-ai
npm run dev
# Both servers running!
```

---

## 🎯 Sıradaki Adımlar

1. **Resend API Key** ekleyin (.env dosyasına)
2. **Login** olun veya **Register** edin
3. **Leads** sayfasından lead'ler ekleyin
4. **Campaign** oluşturun
5. **Email gönderin** ve tracking'i izleyin!

---

## 💡 İpuçları

### ✅ Best Practices
- Email subject'leri kısa ve çekici tutun (max 50 karakter)
- AI ile email oluşturma özelliğini kullanın
- Her zaman email preview yapın
- Tracking istatistiklerini takip edin
- Spam kelimelerden kaçının

### ⚠️ Dikkat Edilmesi Gerekenler
- Resend free tier: Ayda 3,000 email, günde 100
- Rate limiting: Saatte 100 email
- Email doğrulama: İlk önce domain verify yapın
- SPF/DKIM ayarları yapın (production için)

---

## 📚 Kaynaklar

- **Resend Docs**: https://resend.com/docs
- **Gemini AI**: https://ai.google.dev/
- **ExportHunter Issues**: GitHub Issues

---

## 🎉 Tebrikler!

Email servisi başarıyla kuruldu! Artık AI destekli, tracking özellikli profesyonel email campaign'leri gönderebilirsiniz! 🚀

**Happy Emailing!** 📧
