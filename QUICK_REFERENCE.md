# ⚡ Quick Reference - Bug Fixes & Features

## 🎯 Top Priority (Do First)

### 1. Token Refresh (2-3 hours)
```typescript
// backend/src/controllers/authController.ts
export const refreshToken = async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  res.json(ApiResponse.success({ token: newToken }));
};

// backend/src/routes/auth.ts
router.post('/refresh', refreshToken);
```

### 2. HS Code Fix (30 min)
```typescript
// frontend/src/services/api.ts - Line 154
searchHsCodes: (data: { product: string }) =>
  api.post('/ai/hs-code-suggestions', data), // Fix: Change endpoint name
```

### 3. Campaign Pause (1-2 hours)
```typescript
// backend/src/controllers/campaignsController.ts
export const pauseCampaign = async (req: AuthRequest, res: Response) => {
  const campaign = await Campaign.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { status: 'paused' },
    { new: true }
  );
  if (!campaign) throw new NotFoundError('Campaign');
  res.json(ApiResponse.success(campaign));
};

// backend/src/routes/campaigns.ts
router.post('/:id/pause', pauseCampaign);
```

### 4. Campaign Detail API (2-3 hours)
```typescript
// backend/src/controllers/campaignsController.ts
export const getCampaign = async (req: AuthRequest, res: Response) => {
  const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('leads')
    .lean();
  if (!campaign) throw new NotFoundError('Campaign');
  res.json(ApiResponse.success(campaign));
};

// backend/src/routes/campaigns.ts - ADD BEFORE /:id/send
router.get('/:id', getCampaign);

// frontend/src/pages/CampaignDetailsPage.tsx
const { data } = useQuery({
  queryKey: ['campaign', id],
  queryFn: () => campaignsAPI.getCampaign(id!)
});
```

---

## 📋 File Change Summary

### Backend Files to Modify
- ✅ `backend/src/controllers/authController.ts` - Add `refreshToken`, `updateCrmConnections`
- ✅ `backend/src/routes/auth.ts` - Add `/refresh`, `/crm-connections`
- ✅ `backend/src/controllers/campaignsController.ts` - Add `pauseCampaign`, `getCampaign`
- ✅ `backend/src/routes/campaigns.ts` - Add `/:id/pause`, `/:id` (GET)
- ✅ `backend/src/models/User.ts` - Add `crmConnections` field
- 🆕 `backend/src/models/Asset.ts` - Create new model
- 🆕 `backend/src/controllers/assetController.ts` - Create new controller
- 🆕 `backend/src/routes/assets.ts` - Create new routes

### Frontend Files to Modify
- ✅ `frontend/src/services/api.ts` - Fix `searchHsCodes`, add asset APIs
- ✅ `frontend/src/pages/SettingsPage.tsx` - Add billing handler, CRM save
- ✅ `frontend/src/pages/CampaignDetailsPage.tsx` - Replace mock data
- ✅ `frontend/src/pages/SmartAssetsPage.tsx` - Replace mock data
- 🆕 `frontend/src/pages/LeadDetailPage.tsx` - Create new page
- ✅ `frontend/src/App.tsx` - Add `/leads/:id` route

---

## 🔥 Critical Path

```
Day 1: Token Refresh + HS Code Fix (3 hours)
Day 2: Campaign Pause + Campaign Detail (4 hours)
Day 3: Billing Handler + Lead Detail (5 hours)
Day 4: CRM Backend (4 hours)
Week 2: Smart Assets (10-14 hours)
Week 3: Polish (8-10 hours)
```

---

## ✅ Testing Checklist

After each fix, test:
- [ ] API endpoint responds correctly
- [ ] Frontend displays data correctly
- [ ] Error handling works
- [ ] Database updates correctly
- [ ] No console errors
- [ ] No TypeScript errors

---

## 🚨 Common Pitfalls

1. **Route Order Matters!**
   - Specific routes (`/generate-sequence`) must come BEFORE parameterized routes (`/:id`)
   
2. **Token Refresh Secret**
   - Must use `JWT_REFRESH_SECRET`, not `JWT_SECRET`

3. **User Ownership**
   - Always check `userId` matches `req.user._id` in queries

4. **Mock Data Removal**
   - Don't forget to remove all mock data when integrating APIs

---

## 📞 Quick Help

**Token not refreshing?**
- Check `JWT_REFRESH_SECRET` is set in `.env`
- Verify frontend interceptor is calling `/auth/refresh`

**Route not working?**
- Check route order (specific before parameterized)
- Verify route is registered in `server.ts`

**Database not updating?**
- Check `userId` filter in query
- Verify Mongoose schema allows the field

---

**See IMPLEMENTATION_ROADMAP.md for detailed instructions**

