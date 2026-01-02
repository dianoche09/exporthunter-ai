# 🐛 Eksik ve Çalışmayan Özellikler

## 🔴 Kritik Eksiklikler

### 1. **Token Refresh Endpoint Eksik**
**Lokasyon:** `frontend/src/services/api.ts:36`
- Frontend'de `auth/refresh` endpoint'i çağrılıyor
- Backend'de bu route tanımlı değil
- **Etki:** Token expire olduğunda kullanıcı otomatik logout oluyor

**Çözüm:**
```typescript
// backend/src/routes/auth.ts
router.post('/refresh', refreshToken);
```

### 2. **HS Code Search API Uyumsuzluğu**
**Lokasyon:** `frontend/src/pages/SettingsPage.tsx:210`
- Frontend: `aiAPI.searchHsCodes(productSearch)` çağrılıyor
- Backend: `/ai/hs-code-suggestions` endpoint'i var
- **Etki:** HS Code arama çalışmıyor

**Çözüm:**
```typescript
// frontend/src/services/api.ts - Düzelt
searchHsCodes: (data: { product: string }) =>
  api.post('/ai/hs-code-suggestions', data), // Mevcut endpoint'i kullan
```

### 3. **Campaign Pause Endpoint Eksik**
**Lokasyon:** `frontend/src/services/api.ts:133`
- Frontend'de `pauseCampaign` API çağrısı var
- Backend'de route tanımlı değil
- **Etki:** Kampanya duraklatma özelliği çalışmıyor

**Çözüm:**
```typescript
// backend/src/routes/campaigns.ts
router.post('/:id/pause', pauseCampaign);

// backend/src/controllers/campaignsController.ts
export const pauseCampaign = async (req: AuthRequest, res: Response) => {
  const campaign = await Campaign.findByIdAndUpdate(
    req.params.id,
    { status: 'paused' },
    { new: true }
  );
  // ...
};
```

### 4. **Smart Assets Sayfası Tamamen Mock**
**Lokasyon:** `frontend/src/pages/SmartAssetsPage.tsx`
- Tüm data hardcoded mock
- Backend entegrasyonu yok
- Upload butonu çalışmıyor
- Analytics gerçek değil

**Eksik Özellikler:**
- Asset upload endpoint
- Asset listesi API
- View tracking API
- Analytics API
- Heatmap data API

**Çözüm:**
```typescript
// backend/src/routes/upload.ts - Yeni endpoint'ler ekle
router.post('/assets', uploadAsset);
router.get('/assets', getAssets);
router.get('/assets/:id/analytics', getAssetAnalytics);
router.post('/assets/:id/track', trackAssetView);
```

### 5. **Settings - CRM Entegrasyonları Çalışmıyor**
**Lokasyon:** `frontend/src/pages/SettingsPage.tsx:191-199`
- CRM toggle'ları sadece frontend state'i değiştiriyor
- Backend'e kayıt yok
- **Etki:** CRM bağlantıları kaydedilmiyor

**Çözüm:**
```typescript
// backend/src/models/User.ts - Yeni field ekle
crmConnections: {
  salesforce: { enabled: Boolean, apiKey: String },
  hubspot: { enabled: Boolean, apiKey: String },
  zoho: { enabled: Boolean, apiKey: String }
}

// backend/src/routes/auth.ts
router.put('/crm-connections', updateCrmConnections);
```

### 6. **Billing - Manage Subscription Butonu Handler Eksik**
**Lokasyon:** `frontend/src/pages/SettingsPage.tsx:894`
- Buton var ama `onClick` handler yok
- ✅ Backend endpoint mevcut: `/api/payment/create-portal-session`
- **Etki:** Butona tıklanınca hiçbir şey olmuyor

**Çözüm:**
```typescript
// frontend/src/pages/SettingsPage.tsx
const handleManageSubscription = async () => {
  try {
    const { data } = await paymentAPI.createPortalSession();
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    toast.error('Failed to open billing portal');
  }
};

// Butona ekle:
<button 
  onClick={handleManageSubscription}
  className="px-6 py-3 bg-white text-slate-900..."
>
  Manage Subscription
</button>
```

## 🟡 Orta Öncelikli Eksiklikler

### 7. **Dashboard API Endpoint'leri ✅ VAR**
**Lokasyon:** `backend/src/routes/dashboard.ts`
- ✅ `dashboardAPI.getBriefing()` - `/api/dashboard/briefing`
- ✅ `dashboardAPI.getOpportunities()` - `/api/dashboard/opportunities`
- ✅ `dashboardAPI.getStats()` - `/api/dashboard/stats`
- ✅ `dashboardAPI.getAcquisitionChart()` - `/api/dashboard/chart/acquisition`

**Durum:** Backend route'ları mevcut, çalışıyor olmalı.

### 8. **Lead Detail Sayfası Eksik**
**Lokasyon:** Frontend'de `/leads/:id` route'u yok
- LeadsPage'de lead'lere tıklanınca detay sayfası açılmıyor
- Supply Chain Intel modal'ı var ama sayfa yok

**Çözüm:**
```typescript
// frontend/src/App.tsx
<Route path="/leads/:id" element={<LeadDetailPage />} />
```

### 9. **Campaign Detail - API Entegrasyonu Eksik**
**Lokasyon:** `frontend/src/pages/CampaignDetailsPage.tsx:12-25`
- **TAMAMEN MOCK DATA KULLANIYOR!**
- API çağrısı yapılmıyor, `useParams().id` kullanılmıyor
- Backend'de `getCampaign` (tekil) endpoint'i yok
- **Etki:** Campaign detay sayfası gerçek data göstermiyor

**Çözüm:**
```typescript
// backend/src/routes/campaigns.ts
router.get('/:id', getCampaign);

// backend/src/controllers/campaignsController.ts
export const getCampaign = async (req: AuthRequest, res: Response) => {
  const campaign = await Campaign.findById(req.params.id)
    .populate('leads')
    .lean();
  // ...
};

// frontend/src/pages/CampaignDetailsPage.tsx
const { data } = useQuery({
  queryKey: ['campaign', id],
  queryFn: () => campaignsAPI.getCampaign(id!)
});
```

### 10. **Onboarding - API Key Validation Eksik**
**Lokasyon:** `frontend/src/pages/OnboardingPage.tsx`
- API key'ler girildiğinde validation yapılmıyor
- Sadece kaydediliyor, geçerli olup olmadığı kontrol edilmiyor

## 🟢 Düşük Öncelikli / UI İyileştirmeleri

### 11. **Error Handling - Bazı Sayfalarda Eksik**
- SmartAssetsPage'de API hataları handle edilmiyor
- SettingsPage'de bazı form validation'lar eksik

### 12. **Loading States Eksik**
- SmartAssetsPage'de upload sırasında loading gösterilmiyor
- SettingsPage'de bazı async işlemlerde loading yok

### 13. **Empty States Eksik**
- CampaignsPage'de kampanya yoksa empty state yok
- LeadsPage'de lead yoksa empty state var ama iyileştirilebilir

## 📋 Öncelik Sırası

### Hemen Düzeltilmesi Gerekenler:
1. ✅ Token refresh endpoint
2. ✅ HS Code search API uyumsuzluğu
3. ✅ Campaign pause endpoint
4. ✅ Smart Assets backend entegrasyonu

### Kısa Vadede:
5. ✅ CRM entegrasyonları backend
6. ✅ Billing portal session
7. ✅ Lead detail sayfası
8. ✅ Dashboard API endpoint kontrolü

### Uzun Vadede:
9. ✅ Onboarding API key validation
10. ✅ Error handling iyileştirmeleri
11. ✅ Loading states
12. ✅ Empty states

## 🔍 Test Edilmesi Gerekenler

1. **Token Expiry Senaryosu:**
   - Login yap
   - Token'ı manuel expire et
   - API çağrısı yap
   - Refresh token çalışıyor mu?

2. **Campaign Pause:**
   - Kampanya oluştur
   - Pause butonuna tıkla
   - Backend'de status güncelleniyor mu?

3. **HS Code Search:**
   - Settings'e git
   - Product Knowledge Base'de HS Code ara
   - Sonuçlar geliyor mu?

4. **Smart Assets:**
   - Assets sayfasına git
   - Upload butonuna tıkla
   - Dosya yükleniyor mu?

5. **CRM Connections:**
   - Settings'te CRM toggle'ları aç/kapat
   - Sayfayı yenile
   - Durum korunuyor mu?

## 📝 Notlar

- Smart Assets özelliği tamamen yeni bir modül gibi görünüyor, backend implementasyonu hiç yapılmamış
- CRM entegrasyonları şu an sadece UI mockup, gerçek entegrasyon yok
- Billing sayfası Stripe entegrasyonu var ama portal session kontrol edilmeli

