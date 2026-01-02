## v1.1.1 Manual Fix Required

### Billing Button onClick Handler

**File:** `frontend/src/pages/SettingsPage.tsx`  
**Line:** 894

**Current:**
```tsx
<button className="px-6 py-3 bg-white text-slate-900...">
  Manage Subscription
</button>
```

**Replace with:**
```tsx
<button 
  onClick={async () => {
    try {
      const { data } = await paymentAPI.createPortalSession();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to open billing portal');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to open billing portal');
    }
  }}
  className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black hover:bg-slate-100 transition-colors shadow-lg"
>
  Manage Subscription
</button>
```

**Why:** The Manage Subscription button currently has no click handler. This adds the functionality to open the Stripe billing portal.

**Test:** After applying, click the button in Settings > Billing tab and verify it redirects to Stripe portal.
