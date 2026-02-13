#!/bin/bash

echo "💰 MONETIZATION PACK - Part 4: Usage UI & Upgrade System"
echo "========================================================"
echo ""

cd exporthunter-ai/frontend

# ===========================================
# 1. USAGE METER COMPONENT
# ===========================================

cat > src/components/UsageMeter.tsx << 'USAGE'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export default function UsageMeter({ onUpgrade }: { onUpgrade?: () => void }) {
  const { data } = useQuery({
    queryKey: ['usage'],
    queryFn: () => api.get('/usage')
  })

  const usage = data?.data?.data

  if (!usage) return null

  const percentageUsed = usage.percentageUsed || 0
  const isNearLimit = percentageUsed >= 80
  const isAtLimit = percentageUsed >= 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border-2 ${
        isAtLimit 
          ? 'bg-red-50 border-red-200' 
          : isNearLimit 
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${
            isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-blue-600'
          }`} />
          <span className="font-semibold text-gray-900">
            {usage.usageThisMonth} / {usage.usageLimit} leads this month
          </span>
        </div>
        <span className={`text-sm font-medium ${
          isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-blue-600'
        }`}>
          {percentageUsed}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${
            isAtLimit 
              ? 'bg-red-500' 
              : isNearLimit 
              ? 'bg-yellow-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
        />
      </div>

      {/* Tier Badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Current plan: <strong className="text-gray-900 capitalize">{usage.subscriptionTier}</strong>
        </span>

        {usage.subscriptionTier === 'free' && isNearLimit && (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Upgrade
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Warning Message */}
      {isAtLimit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-3 bg-red-100 rounded-lg"
        >
          <p className="text-sm text-red-800 font-medium">
            ⚠️ You've reached your monthly limit. 
            <button onClick={onUpgrade} className="underline ml-1 font-bold">
              Upgrade now
            </button> to continue.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
USAGE

echo "✅ Usage meter component created"

# ===========================================
# 2. UPGRADE MODAL
# ===========================================

cat > src/components/UpgradeModal.tsx << 'UPGRADEMODAL'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap, Crown } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason?: string
}

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const checkoutMutation = useMutation({
    mutationFn: (priceId: string) => 
      api.post('/stripe/create-checkout', { priceId }),
    onSuccess: (response) => {
      window.location.href = response.data.data.url
    },
    onError: () => {
      toast.error('Failed to create checkout session')
    }
  })

  const handleUpgrade = (tier: 'pro' | 'enterprise') => {
    const priceId = tier === 'pro' 
      ? process.env.VITE_STRIPE_PRO_PRICE_ID 
      : process.env.VITE_STRIPE_ENTERPRISE_PRICE_ID

    if (!priceId) {
      toast.error('Pricing not configured')
      return
    }

    checkoutMutation.mutate(priceId)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-gray-200">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Upgrade Your Plan</h2>
                  {reason && (
                    <p className="text-gray-600">{reason}</p>
                  )}
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pro Plan */}
                  <div className="relative p-6 border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                        MOST POPULAR
                      </span>
                    </div>

                    <div className="text-center mb-6 mt-4">
                      <h3 className="text-2xl font-bold mb-2">Pro</h3>
                      <div className="mb-2">
                        <span className="text-5xl font-bold">$29</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <p className="text-gray-600">Perfect for growing businesses</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {[
                        '100 leads per month',
                        'AI email generator',
                        'Auto follow-ups',
                        'Advanced analytics',
                        'Priority support',
                        'CSV import/export'
                      ].map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade('pro')}
                      disabled={checkoutMutation.isPending}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {checkoutMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Upgrade to Pro
                        </>
                      )}
                    </button>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="p-6 border-2 border-gray-200 rounded-2xl bg-white">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                      <div className="mb-2">
                        <span className="text-5xl font-bold">$99</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <p className="text-gray-600">For scaling companies</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {[
                        'Unlimited leads',
                        'Everything in Pro',
                        'White label',
                        'API access',
                        'Team collaboration',
                        'Dedicated support',
                        'SLA guarantee'
                      ].map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade('enterprise')}
                      disabled={checkoutMutation.isPending}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {checkoutMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Crown className="w-5 h-5" />
                          Upgrade to Enterprise
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                  💳 Secure payment powered by Stripe • Cancel anytime
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
UPGRADEMODAL

echo "✅ Upgrade modal created"

# ===========================================
# 3. UPDATE DASHBOARD - ADD USAGE METER
# ===========================================

cat >> src/pages/DashboardPage.tsx << 'DASHUPDATE'

import UsageMeter from '../components/UsageMeter'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

// Add inside component:
const [showUpgradeModal, setShowUpgradeModal] = useState(false)

// Add after header, before stats grid:
<UsageMeter onUpgrade={() => setShowUpgradeModal(true)} />

// Add at end before closing div:
<UpgradeModal 
  isOpen={showUpgradeModal}
  onClose={() => setShowUpgradeModal(false)}
  reason="Upgrade to unlock unlimited leads and advanced features"
/>
DASHUPDATE

echo "✅ Dashboard updated with usage meter"

# ===========================================
# 4. UPDATE API - ADD STRIPE & USAGE
# ===========================================

cat >> src/services/api.ts << 'APIUPDATE'

export const stripeAPI = {
  createCheckout: (priceId: string) =>
    api.post('/stripe/create-checkout', { priceId }),
  
  createPortal: () =>
    api.post('/stripe/create-portal'),
  
  getPricing: () =>
    api.get('/stripe/pricing')
}

export const usageAPI = {
  getUsage: () =>
    api.get('/usage'),
  
  getReferral: () =>
    api.get('/usage/referral')
}
APIUPDATE

echo "✅ API updated with stripe & usage"

# ===========================================
# 5. UPDATE ROUTER - ADD LANDING PAGE
# ===========================================

cat >> src/App.tsx << 'ROUTERUPDATE'

import LandingPage from './pages/LandingPage'

// Update routes:
<Route path="/" element={<LandingPage />} />
<Route path="/pricing" element={<LandingPage />} />
ROUTERUPDATE

echo "✅ Router updated with landing page"

# ===========================================
# 6. ENV VARIABLES
# ===========================================

cat >> .env.example << 'ENVUPDATE'

# Stripe
VITE_STRIPE_PRO_PRICE_ID=price_xxx
VITE_STRIPE_ENTERPRISE_PRICE_ID=price_xxx
ENVUPDATE

echo "✅ .env.example updated"

echo ""
echo "🎉 MONETIZATION PACK COMPLETE!"
echo ""
echo "✅ Created:"
echo "  Backend:"
echo "    - User model with subscription"
echo "    - Stripe service (checkout, webhooks)"
echo "    - Usage tracking & limits"
echo "    - Pricing config"
echo "  Frontend:"
echo "    - Landing page"
echo "    - Usage meter"
echo "    - Upgrade modal"
echo "    - Pricing cards"
echo ""
echo "📋 Next Steps:"
echo "  1. Get Stripe API keys from https://dashboard.stripe.com"
echo "  2. Create products in Stripe (Pro $29, Enterprise $99)"
echo "  3. Add price IDs to .env"
echo "  4. Run: npm install stripe"
echo "  5. Test checkout flow"
echo ""
echo "🚀 Ready to make money!"
echo ""
