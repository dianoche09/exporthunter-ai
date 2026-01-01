# Email & Import/Export API Documentation

## 📧 Email Templates

### Professional Template (Branded + Gradient)
```typescript
import { emailTemplates } from './services/email/templates';

const html = emailTemplates.professional({
  subject: 'Partnership Opportunity',
  body: 'We would like to discuss...',
  companyName: 'ExportHunter',
  senderName: 'John Doe',
  recipientName: 'ABC Company',
  language: 'tr' | 'en' // Turkish or English
});
```

**Features:**
- Gradient header with company branding
- Professional layout with CTA button
- Fully responsive design
- Multi-language support (TR/EN)

### Minimal Template (Clean + Simple)
```typescript
const html = emailTemplates.minimal({
  body: 'Simple message...',
  companyName: 'ExportHunter',
  senderName: 'John Doe',
  language: 'tr' | 'en'
});
```

**Features:**
- Clean, distraction-free design
- Perfect for direct communication
- Faster load times
- Multi-language support (TR/EN)

---

## 🔄 Auto Follow-Up System

### How It Works
- **Day 4**: First follow-up email sent automatically
- **Day 11**: Second follow-up email sent automatically
- **Targeted**: Only sent to unopened emails
- **Scheduled**: Runs every 6 hours
- **Auto-start**: Begins when server starts

### AI-Generated Content
Each follow-up is uniquely generated using Gemini AI based on:
- Original email subject
- Original email body
- Company name
- Follow-up number (1st or 2nd)
- Language preference

### Manual Trigger Endpoints

#### Trigger Follow-Up for Specific Campaign
```http
POST /api/followup/trigger/:campaignId
Authorization: Bearer <token>
Content-Type: application/json

{
  "followUpNumber": 1  // or 2
}
```

**Response:**
```json
{
  "success": true,
  "sent": 15
}
```

#### Manually Process All Follow-Ups
```http
POST /api/followup/process
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Follow-up processing triggered"
}
```

---

## 📥 CSV Import

### Import Leads from CSV
```http
POST /api/import/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "csvContent": "Company Name,Email,Country,City,Industry\nABC Corp,info@abc.com,Turkey,Istanbul,Manufacturing"
}
```

**Features:**
- ✅ **Auto Field Mapping**: Automatically detects CSV headers
- ✅ **Multi-language Support**: Detects Turkish and English headers
- ✅ **Error Reporting**: Returns detailed errors for failed rows
- ✅ **Flexible Format**: Supports various CSV formats

**Supported Headers (Auto-Detected):**

| Field | English Headers | Turkish Headers |
|-------|----------------|-----------------|
| Company Name | company, business, organization | firma, şirket |
| Country | country, nation | ülke |
| City | city, town | şehir |
| Email | email, e-mail, mail | eposta |
| Phone | phone, tel, mobile | telefon |
| Website | website, web, url, site | - |
| Industry | industry, sector | sektör |
| Status | status, state | durum |
| Tags | tag, category | etiket |
| Notes | note, comment, remark | not |
| AI Score | score, rating | puan |

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 45,
    "failed": 2,
    "total": 47,
    "leads": [...],
    "errors": [
      {
        "row": 3,
        "data": {...},
        "error": "Email is required"
      }
    ],
    "fieldMapping": {
      "companyName": "Company Name",
      "email": "Email",
      "country": "Country",
      ...
    }
  }
}
```

---

## 📤 CSV Export

### Export All Leads
```http
GET /api/import/leads/export
Authorization: Bearer <token>
```

### Export with Filters
```http
GET /api/import/leads/export?status=interested&tags=USA,Canada
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by lead status
- `tags` (optional): Comma-separated tags

**Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="leads-export-{timestamp}.csv"`

**CSV Format:**
```csv
Company Name,Country,City,Email,Phone,Website,Industry,Status,Source,Tags,Notes,AI Score,Created At
ABC Corp,Turkey,Istanbul,info@abc.com,+90...,https://abc.com,Manufacturing,interested,ai-discovery,"USA, Canada",Great prospect,85,2024-01-01T12:00:00Z
```

**Excel Compatible:** ✅ Can be opened directly in Excel

---

## 🎯 Usage Examples

### Complete Email Campaign with Follow-Ups

```typescript
// 1. Create campaign with template
const campaign = await Campaign.create({
  userId,
  name: 'Q1 2024 Outreach',
  subject: 'Partnership Opportunity',
  body: 'We would like to discuss...',
  leads: leadIds,
  settings: {
    followUpEnabled: true
  }
});

// 2. Send emails using professional template
for (const lead of leads) {
  const html = emailTemplates.professional({
    subject: campaign.subject,
    body: campaign.body,
    companyName: 'ExportHunter',
    senderName: 'Sales Team',
    recipientName: lead.companyName,
    language: 'en'
  });

  await resendService.sendEmail({
    to: lead.email,
    subject: campaign.subject,
    html
  });

  // Track in EmailActivity
  await EmailActivity.create({
    campaignId: campaign._id,
    leadId: lead._id,
    userId,
    status: 'sent',
    sentAt: new Date()
  });
}

// 3. Follow-ups sent automatically!
// Day 4: First follow-up (AI-generated)
// Day 11: Second follow-up (AI-generated)
// Only to unopened emails
```

### Import and Export Workflow

```typescript
// 1. Import leads from CSV
const formData = new FormData();
formData.append('csvContent', csvFileContent);

const importResult = await fetch('/api/import/leads', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ csvContent })
});

// 2. Work with leads
// ... send campaigns, etc.

// 3. Export results
const exportUrl = '/api/import/leads/export?status=interested';
window.location.href = exportUrl; // Triggers download
```

---

## 🛠️ Configuration

### Environment Variables
```env
# Email Service
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=your-name@yourdomain.com
COMPANY_NAME=Your Company
SENDER_NAME=Your Name

# Follow-Up Settings (Optional)
FOLLOWUP_DAY1=4      # Days until first follow-up (default: 4)
FOLLOWUP_DAY2=11     # Days until second follow-up (default: 11)
FOLLOWUP_INTERVAL=6  # Check interval in hours (default: 6)
```

---

## 📊 Follow-Up System Architecture

```
Server Start
    ↓
Initialize FollowUpService
    ↓
Start Scheduler (runs every 6 hours)
    ↓
    ├─→ Find emails sent 4+ days ago (no follow-up 1)
    │   └─→ Generate AI follow-up content
    │       └─→ Send follow-up 1
    │           └─→ Mark followUp1SentAt
    │
    └─→ Find emails sent 11+ days ago (has follow-up 1, no follow-up 2)
        └─→ Generate AI follow-up content
            └─→ Send follow-up 2
                └─→ Mark followUp2SentAt
```

---

## 🎨 Template Preview

### Professional Template
- **Header**: Gradient background (blue)
- **Body**: Clean typography, proper spacing
- **CTA**: Prominent call-to-action button
- **Footer**: Professional signature + unsubscribe
- **Colors**: Brand-aligned color scheme

### Minimal Template
- **Style**: Clean, plain text-like
- **Layout**: Simple vertical layout
- **Typography**: Easy to read, system fonts
- **Footer**: Basic signature line

---

## 🚀 Quick Start

### 1. Enable Follow-Ups
Already enabled by default! The service starts automatically when your server starts.

### 2. Use Templates
```typescript
import { emailTemplates } from './services/email/templates';

// For professional outreach
const html = emailTemplates.professional({...});

// For direct communication
const html = emailTemplates.minimal({...});
```

### 3. Import Leads
```bash
curl -X POST http://localhost:3001/api/import/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"csvContent": "..."}'
```

### 4. Export Leads
```bash
curl -X GET "http://localhost:3001/api/import/leads/export" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o leads.csv
```

---

## ✅ Feature Checklist

- [x] Professional email template (branded + gradient)
- [x] Minimal email template (clean + simple)
- [x] Turkish/English language support
- [x] Auto follow-up Day 4 (AI-generated)
- [x] Auto follow-up Day 11 (AI-generated)
- [x] Only send to unopened emails
- [x] Check every 6 hours
- [x] Auto-start with server
- [x] CSV import with auto field mapping
- [x] CSV export (Excel compatible)
- [x] Error reporting for imports
- [x] Manual follow-up triggers
- [x] Multi-language header detection

---

## 🎓 Best Practices

1. **Templates**: Use `professional` for first outreach, `minimal` for follow-ups
2. **Language**: Always set language parameter based on target market
3. **CSV Import**: Review field mapping before bulk import
4. **Follow-Ups**: Monitor `EmailActivity` to track follow-up performance
5. **Rate Limiting**: Built-in 1-second delay between emails
6. **Testing**: Use `/api/followup/process` to test follow-up logic manually

---

## 🔍 Monitoring

Check follow-up service status in server logs:
```
✅ MongoDB connected successfully
🚀 Server running on port 3001
📧 Auto follow-up schedulers started
🔄 Processing follow-ups...
📬 Found 5 emails for Follow-Up 1
📬 Found 2 emails for Follow-Up 2
📧 Sending Follow-Up 1 to info@example.com...
✅ Follow-Up 1 sent to info@example.com
✅ Follow-ups processed successfully
```
