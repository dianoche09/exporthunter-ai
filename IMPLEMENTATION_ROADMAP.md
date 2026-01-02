# 🎯 ExportHunter Bug Fixes & Feature Implementation Roadmap

## Executive Summary

**Objective:** Fix 13 identified bugs and missing features across frontend and backend  
**Timeline:** 3-4 weeks (phased approach)  
**Priority:** Critical fixes first, then feature completion  
**Impact:** Improves user experience, reduces support tickets, enables full platform functionality

### ChromaDB Integration Opportunities

While ChromaDB tools aren't directly available in this environment, the implementation plan should consider ChromaDB for:
- **Knowledge Base Management**: Store API documentation, implementation patterns, and code snippets
- **Progress Tracking**: Index completed tasks, blockers, and solutions
- **Code Search**: Semantic search across codebase for similar implementations
- **Documentation Storage**: Version-controlled implementation guides and best practices

---

## 📊 Task Breakdown Hierarchy

### Phase 1: Critical Authentication & API Fixes (Week 1)
**Goal:** Fix breaking issues that prevent core functionality

#### 1.1 Token Refresh Endpoint Implementation
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 2-3 hours  
**Dependencies:** None

**Atomic Actions:**
1. Create `refreshToken` controller function in `authController.ts`
   - Validate refresh token from request body
   - Verify token signature using `JWT_REFRESH_SECRET`
   - Check token expiration
   - Generate new access token (1 hour expiry)
   - Optionally generate new refresh token (7 days expiry)
   - Return new tokens

2. Add route in `backend/src/routes/auth.ts`
   ```typescript
   router.post('/refresh', refreshToken);
   ```

3. Update frontend interceptor (already exists, verify it works)
   - Test token refresh flow
   - Handle refresh failures gracefully

4. Add error handling
   - Invalid refresh token → 401
   - Expired refresh token → 401
   - User not found → 401

5. Write unit tests
   - Valid refresh token scenario
   - Expired refresh token scenario
   - Invalid refresh token scenario

**Success Criteria:**
- ✅ Token refresh endpoint returns new access token
- ✅ Frontend automatically refreshes expired tokens
- ✅ User stays logged in after token expiry

**Files to Modify:**
- `backend/src/controllers/authController.ts` (add function)
- `backend/src/routes/auth.ts` (add route)
- `frontend/src/services/api.ts` (verify interceptor)

---

#### 1.2 HS Code Search API Fix
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 30 minutes  
**Dependencies:** None

**Atomic Actions:**
1. Fix frontend API call in `frontend/src/services/api.ts`
   ```typescript
   // Change from:
   searchHsCodes: (data: { product: string }) => api.post('/ai/search-hs-codes', data),
   // To:
   searchHsCodes: (data: { product: string }) => api.post('/ai/hs-code-suggestions', data),
   ```

2. Verify backend endpoint exists (`/ai/hs-code-suggestions`)
3. Test HS Code search in Settings page
4. Verify response format matches frontend expectations

**Success Criteria:**
- ✅ HS Code search works in Settings → Product Knowledge Base
- ✅ Results display correctly in dropdown
- ✅ Selection updates form fields

**Files to Modify:**
- `frontend/src/services/api.ts` (1 line change)

---

#### 1.3 Campaign Pause Endpoint
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 1-2 hours  
**Dependencies:** None

**Atomic Actions:**
1. Create `pauseCampaign` controller in `campaignsController.ts`
   ```typescript
   export const pauseCampaign = async (req: AuthRequest, res: Response) => {
     try {
       const { id } = req.params;
       const userId = req.user._id;
       
       const campaign = await Campaign.findOneAndUpdate(
         { _id: id, userId },
         { status: 'paused' },
         { new: true }
       );
       
       if (!campaign) {
         throw new NotFoundError('Campaign');
       }
       
       res.json(ApiResponse.success(campaign));
     } catch (error) {
       // Error handling
     }
   };
   ```

2. Add route in `backend/src/routes/campaigns.ts`
   ```typescript
   router.post('/:id/pause', pauseCampaign);
   ```

3. Add `resumeCampaign` endpoint (optional but recommended)
4. Test pause functionality
5. Verify campaign status updates in database

**Success Criteria:**
- ✅ Campaign pause button works
- ✅ Campaign status updates to 'paused'
- ✅ Paused campaigns don't send emails

**Files to Modify:**
- `backend/src/controllers/campaignsController.ts` (add function)
- `backend/src/routes/campaigns.ts` (add route)

---

#### 1.4 Campaign Detail API Integration
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 2-3 hours  
**Dependencies:** None

**Atomic Actions:**
1. Create `getCampaign` controller (singular) in `campaignsController.ts`
   ```typescript
   export const getCampaign = async (req: AuthRequest, res: Response) => {
     const { id } = req.params;
     const userId = req.user._id;
     
     const campaign = await Campaign.findOne({ _id: id, userId })
       .populate('leads')
       .lean();
     
     if (!campaign) {
       throw new NotFoundError('Campaign');
     }
     
     // Get email activities for this campaign
     const activities = await EmailActivity.find({ campaignId: id })
       .populate('leadId')
       .lean();
     
     res.json(ApiResponse.success({
       ...campaign,
       activities
     }));
   };
   ```

2. Add route in `backend/src/routes/campaigns.ts`
   ```typescript
   router.get('/:id', getCampaign);
   ```
   ⚠️ **IMPORTANT:** This must be AFTER `/generate-sequence` route to avoid route conflicts

3. Update `CampaignDetailsPage.tsx` to use real API
   ```typescript
   const { id } = useParams();
   const { data, isLoading } = useQuery({
     queryKey: ['campaign', id],
     queryFn: () => campaignsAPI.getCampaign(id!),
     enabled: !!id
   });
   ```

4. Replace mock data with API data
5. Add loading states
6. Add error handling

**Success Criteria:**
- ✅ Campaign detail page shows real data
- ✅ Stats are accurate
- ✅ Lead list is populated
- ✅ Email activities are shown

**Files to Modify:**
- `backend/src/controllers/campaignsController.ts` (add function)
- `backend/src/routes/campaigns.ts` (add route, order matters!)
- `frontend/src/pages/CampaignDetailsPage.tsx` (replace mock data)

---

### Phase 2: Feature Completion (Week 2)
**Goal:** Complete partially implemented features

#### 2.1 Billing Portal Handler
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 30 minutes  
**Dependencies:** None (backend endpoint exists)

**Atomic Actions:**
1. Add handler function in `SettingsPage.tsx`
   ```typescript
   const handleManageSubscription = async () => {
     try {
       const response = await paymentAPI.createPortalSession();
       if (response.data?.url) {
         window.location.href = response.data.url;
       } else {
         toast.error('Failed to get portal URL');
       }
     } catch (error: any) {
       toast.error(error.response?.data?.error || 'Failed to open billing portal');
     }
   };
   ```

2. Connect handler to button
   ```typescript
   <button onClick={handleManageSubscription}>
     Manage Subscription
   </button>
   ```

3. Test Stripe portal redirect
4. Verify error handling

**Success Criteria:**
- ✅ Button opens Stripe customer portal
- ✅ User can manage subscription
- ✅ Errors are handled gracefully

**Files to Modify:**
- `frontend/src/pages/SettingsPage.tsx` (add handler, connect to button)

---

#### 2.2 Lead Detail Page
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 4-6 hours  
**Dependencies:** None

**Atomic Actions:**
1. Create `LeadDetailPage.tsx` component
   - Use existing `LeadModal` as reference
   - Add route parameter handling
   - Fetch lead data from API
   - Display lead information
   - Show supply chain intel
   - Show email history
   - Add edit functionality

2. Add route in `frontend/src/App.tsx`
   ```typescript
   <Route path="/leads/:id" element={<LeadDetailPage />} />
   ```

3. Update `LeadsPage.tsx` to navigate to detail page
   ```typescript
   onClick={() => navigate(`/leads/${lead._id}`)}
   ```

4. Add breadcrumb navigation
5. Add back button
6. Test navigation flow

**Success Criteria:**
- ✅ Clicking lead opens detail page
- ✅ All lead information displays
- ✅ Supply chain intel works
- ✅ Navigation is intuitive

**Files to Create:**
- `frontend/src/pages/LeadDetailPage.tsx`

**Files to Modify:**
- `frontend/src/App.tsx` (add route)
- `frontend/src/pages/LeadsPage.tsx` (add navigation)

---

#### 2.3 CRM Connections Backend
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 3-4 hours  
**Dependencies:** None

**Atomic Actions:**
1. Update User model in `backend/src/models/User.ts`
   ```typescript
   crmConnections: {
     salesforce: {
       enabled: { type: Boolean, default: false },
       apiKey: { type: String },
       instanceUrl: { type: String }
     },
     hubspot: {
       enabled: { type: Boolean, default: false },
       apiKey: { type: String }
     },
     zoho: {
       enabled: { type: Boolean, default: false },
       apiKey: { type: String }
     }
   }
   ```

2. Create `updateCrmConnections` controller
   ```typescript
   export const updateCrmConnections = async (req: AuthRequest, res: Response) => {
     const userId = req.user._id;
     const { crmConnections } = req.body;
     
     const user = await User.findByIdAndUpdate(
       userId,
       { crmConnections },
       { new: true }
     );
     
     res.json(ApiResponse.success({ user }));
   };
   ```

3. Add route in `backend/src/routes/auth.ts`
   ```typescript
   router.put('/crm-connections', authMiddleware, updateCrmConnections);
   ```

4. Update frontend to save CRM connections
   ```typescript
   const handleCrmToggle = async (crm: string) => {
     const updated = { ...crmConnections, [crm]: !crmConnections[crm] };
     setCrmConnections(updated);
     
     await authAPI.updateCrmConnections({ crmConnections: updated });
   };
   ```

5. Load CRM connections on page load
6. Test save/load functionality

**Success Criteria:**
- ✅ CRM toggle states persist
- ✅ Data saves to database
- ✅ Data loads on page refresh

**Files to Modify:**
- `backend/src/models/User.ts` (add schema field)
- `backend/src/controllers/authController.ts` (add function)
- `backend/src/routes/auth.ts` (add route)
- `frontend/src/pages/SettingsPage.tsx` (update handlers)
- `frontend/src/services/api.ts` (add API method)

---

### Phase 3: Smart Assets Module (Week 3)
**Goal:** Implement complete Smart Assets feature

#### 3.1 Smart Assets Backend Foundation
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 6-8 hours  
**Dependencies:** File upload infrastructure

**Atomic Actions:**
1. Create Asset model in `backend/src/models/Asset.ts`
   ```typescript
   interface IAsset {
     userId: ObjectId;
     name: string;
     type: 'catalog' | 'pricing' | 'technical' | 'report';
     fileUrl: string;
     fileSize: number;
     mimeType: string;
     status: 'active' | 'archived';
     metadata: {
       pages?: number;
       thumbnailUrl?: string;
     };
   }
   ```

2. Create AssetView model for tracking
   ```typescript
   interface IAssetView {
     assetId: ObjectId;
     leadId?: ObjectId;
     userId: ObjectId;
     viewedAt: Date;
     duration: number; // seconds
     pagesViewed: number[];
     ipAddress?: string;
     userAgent?: string;
   }
   ```

3. Create asset upload endpoint
   ```typescript
   router.post('/assets', upload.single('file'), uploadAsset);
   ```

4. Create asset list endpoint
   ```typescript
   router.get('/assets', getAssets);
   ```

5. Create asset analytics endpoint
   ```typescript
   router.get('/assets/:id/analytics', getAssetAnalytics);
   ```

6. Create view tracking endpoint
   ```typescript
   router.post('/assets/:id/track', trackAssetView);
   ```

**Success Criteria:**
- ✅ Assets can be uploaded
- ✅ Assets are stored securely
- ✅ View tracking works
- ✅ Analytics are calculated

**Files to Create:**
- `backend/src/models/Asset.ts`
- `backend/src/models/AssetView.ts`
- `backend/src/controllers/assetController.ts`
- `backend/src/routes/assets.ts`

---

#### 3.2 Smart Assets Frontend Integration
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 4-6 hours  
**Dependencies:** 3.1 (Backend foundation)

**Atomic Actions:**
1. Update `SmartAssetsPage.tsx` to use real API
   ```typescript
   const { data: assets } = useQuery({
     queryKey: ['assets'],
     queryFn: () => assetsAPI.getAssets()
   });
   ```

2. Implement file upload
   ```typescript
   const handleUpload = async (file: File) => {
     const formData = new FormData();
     formData.append('file', file);
     await assetsAPI.uploadAsset(formData);
   };
   ```

3. Replace mock data with API data
4. Implement analytics display
5. Add loading states
6. Add error handling
7. Implement view tracking (when asset is opened)

**Success Criteria:**
- ✅ Assets load from API
- ✅ Upload works
- ✅ Analytics display correctly
- ✅ View tracking works

**Files to Modify:**
- `frontend/src/pages/SmartAssetsPage.tsx` (replace mock data)
- `frontend/src/services/api.ts` (add asset API methods)

---

### Phase 4: Polish & Improvements (Week 4)
**Goal:** Improve UX and error handling

#### 4.1 API Key Validation
**Priority:** 🟢 LOW  
**Estimated Time:** 2-3 hours  
**Dependencies:** None

**Atomic Actions:**
1. Create validation service for Gemini API
   ```typescript
   async validateGeminiKey(apiKey: string): Promise<boolean> {
     try {
       const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-2.0-flash' });
       await model.generateContent('test');
       return true;
     } catch {
       return false;
     }
   }
   ```

2. Create validation service for Resend API
   ```typescript
   async validateResendKey(apiKey: string): Promise<boolean> {
     // Test API key with minimal request
   }
   ```

3. Add validation in Settings page
4. Show validation status in UI
5. Prevent saving invalid keys

**Success Criteria:**
- ✅ Invalid API keys are rejected
- ✅ Validation feedback is clear
- ✅ Users can't save invalid keys

**Files to Create:**
- `backend/src/services/validation/apiKeyValidator.ts`

**Files to Modify:**
- `frontend/src/pages/SettingsPage.tsx` (add validation)
- `frontend/src/pages/OnboardingPage.tsx` (add validation)

---

#### 4.2 Error Handling Improvements
**Priority:** 🟢 LOW  
**Estimated Time:** 3-4 hours  
**Dependencies:** None

**Atomic Actions:**
1. Add error boundaries to key pages
2. Improve error messages
3. Add retry mechanisms
4. Add error logging
5. Create error notification system

**Files to Modify:**
- Multiple frontend pages
- `frontend/src/components/ErrorBoundary.tsx` (create if needed)

---

#### 4.3 Loading States
**Priority:** 🟢 LOW  
**Estimated Time:** 2-3 hours  
**Dependencies:** None

**Atomic Actions:**
1. Add loading spinners to async operations
2. Add skeleton loaders for data fetching
3. Improve loading UX

**Files to Modify:**
- `frontend/src/pages/SmartAssetsPage.tsx`
- `frontend/src/pages/SettingsPage.tsx`
- Other pages as needed

---

#### 4.4 Empty States
**Priority:** 🟢 LOW  
**Estimated Time:** 1-2 hours  
**Dependencies:** None

**Atomic Actions:**
1. Add empty states to CampaignsPage
2. Improve empty states in LeadsPage
3. Add helpful CTAs in empty states

**Files to Modify:**
- `frontend/src/pages/CampaignsPage.tsx`
- `frontend/src/pages/LeadsPage.tsx`

---

## 🔄 Workflow Architecture

### Sequential Dependencies
```
Phase 1 (Critical Fixes)
├── 1.1 Token Refresh (Independent)
├── 1.2 HS Code Fix (Independent)
├── 1.3 Campaign Pause (Independent)
└── 1.4 Campaign Detail (Independent)

Phase 2 (Feature Completion)
├── 2.1 Billing Handler (Independent)
├── 2.2 Lead Detail (Independent)
└── 2.3 CRM Backend (Independent)

Phase 3 (Smart Assets)
├── 3.1 Backend Foundation (Must complete first)
└── 3.2 Frontend Integration (Depends on 3.1)

Phase 4 (Polish)
└── All tasks independent
```

### Parallel Execution Opportunities
- **Phase 1:** All 4 tasks can be done in parallel
- **Phase 2:** All 3 tasks can be done in parallel
- **Phase 3:** Sequential (backend → frontend)
- **Phase 4:** All tasks can be done in parallel

### Decision Points
1. **After Phase 1:** Test all critical fixes before proceeding
2. **After Phase 2:** Review feature completeness
3. **After Phase 3:** Test Smart Assets thoroughly
4. **After Phase 4:** Final QA and deployment

---

## 📋 Implementation Checklist

### Week 1: Critical Fixes
- [ ] 1.1 Token Refresh Endpoint
- [ ] 1.2 HS Code Search Fix
- [ ] 1.3 Campaign Pause Endpoint
- [ ] 1.4 Campaign Detail API Integration
- [ ] Test all Phase 1 fixes

### Week 2: Feature Completion
- [ ] 2.1 Billing Portal Handler
- [ ] 2.2 Lead Detail Page
- [ ] 2.3 CRM Connections Backend
- [ ] Test all Phase 2 features

### Week 3: Smart Assets
- [ ] 3.1 Smart Assets Backend Foundation
- [ ] 3.2 Smart Assets Frontend Integration
- [ ] Test Smart Assets module

### Week 4: Polish
- [ ] 4.1 API Key Validation
- [ ] 4.2 Error Handling Improvements
- [ ] 4.3 Loading States
- [ ] 4.4 Empty States
- [ ] Final QA

---

## 🛠️ Resource Requirements

### Development Tools
- TypeScript/JavaScript IDE
- MongoDB client (for database inspection)
- Postman/Insomnia (for API testing)
- Git (for version control)

### Dependencies to Add
- None (all required packages already installed)

### External Services
- Stripe (for billing portal - already configured)
- Google Gemini API (for validation - already configured)
- Resend API (for validation - already configured)

---

## ⚠️ Risk Assessment & Mitigation

### High Risk Items
1. **Smart Assets Module Complexity**
   - **Risk:** Large feature, may take longer than estimated
   - **Mitigation:** Break into smaller sub-tasks, prioritize core functionality

2. **Database Migration (CRM Connections)**
   - **Risk:** Adding fields to User model may require migration
   - **Mitigation:** Test on development database first, use Mongoose schema updates

3. **Route Conflicts**
   - **Risk:** Adding `/:id` route may conflict with other routes
   - **Mitigation:** Place specific routes before parameterized routes

### Medium Risk Items
1. **Token Refresh Security**
   - **Risk:** Improper implementation could create security vulnerabilities
   - **Mitigation:** Follow JWT best practices, test thoroughly

2. **File Upload Security**
   - **Risk:** Malicious file uploads
   - **Mitigation:** Validate file types, scan for viruses, limit file sizes

### Low Risk Items
1. **UI/UX Changes**
   - **Risk:** Breaking existing user flows
   - **Mitigation:** Test thoroughly, get user feedback

---

## 📈 Success Metrics

### Phase 1 Success
- ✅ All critical bugs fixed
- ✅ No breaking changes
- ✅ All tests pass
- ✅ Token refresh works automatically

### Phase 2 Success
- ✅ All partially implemented features complete
- ✅ User can access all advertised features
- ✅ No console errors

### Phase 3 Success
- ✅ Smart Assets fully functional
- ✅ Upload/download works
- ✅ Analytics are accurate

### Phase 4 Success
- ✅ Improved user experience
- ✅ Better error messages
- ✅ Professional polish

---

## 🚀 Quick Start Guide

### For Developers

1. **Start with Phase 1, Task 1.1 (Token Refresh)**
   ```bash
   # 1. Navigate to backend
   cd backend/src/controllers
   
   # 2. Open authController.ts
   # 3. Add refreshToken function
   # 4. Add route in routes/auth.ts
   # 5. Test with Postman
   ```

2. **Test Each Fix Before Moving On**
   - Use Postman/Insomnia to test API endpoints
   - Test frontend changes in browser
   - Verify database updates

3. **Commit After Each Task**
   ```bash
   git add .
   git commit -m "feat: implement token refresh endpoint"
   ```

### For Project Managers

1. **Track Progress Weekly**
   - Review checklist at end of each week
   - Identify blockers early
   - Adjust timeline if needed

2. **Prioritize Based on User Impact**
   - Phase 1 fixes have highest user impact
   - Phase 4 can be deferred if needed

---

## 📝 Notes

- All backend endpoints should use the new `ApiResponse` utility
- All errors should use custom error classes from `utils/errors.ts`
- All routes should have validation using Zod schemas
- Frontend should use React Query for data fetching
- All API calls should handle errors gracefully

---

**Last Updated:** 2024-01-15  
**Version:** 1.0  
**Status:** Ready for Implementation

