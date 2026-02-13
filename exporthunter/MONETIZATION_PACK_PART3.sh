#!/bin/bash

echo "💰 MONETIZATION PACK - Part 3: Frontend - Landing & Pricing"
echo "==========================================================="
echo ""

cd exporthunter-ai/frontend

# ===========================================
# 1. LANDING PAGE
# ===========================================

cat > src/pages/LandingPage.tsx << 'LANDING'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, Zap, Target, TrendingUp, Mail, 
  BarChart3, Clock, Shield, Check, ArrowRight 
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ExportHunter AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                AI-Powered Lead Generation
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Find <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfect B2B Leads
              </span>
              <br />in Seconds, Not Days
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              ExportHunter AI uses advanced AI to discover qualified leads, 
              generate personalized emails, and automate your outreach. 
              Start closing deals faster.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-xl text-lg flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-semibold shadow-lg text-lg border border-gray-200"
              >
                View Pricing
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              ✨ No credit card required • 10 free leads to start
            </p>
          </motion.div>

          {/* Hero Image/Demo */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl h-96 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Grow Faster</span>
            </h2>
            <p className="text-xl text-gray-600">
              Powerful AI features that save you hours every day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Sparkles}
              title="AI Lead Discovery"
              description="Find qualified B2B leads based on your ideal customer profile. AI analyzes thousands of companies instantly."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={Mail}
              title="Smart Email Campaigns"
              description="Generate personalized emails with AI. Track opens, clicks, and automate follow-ups for maximum response rate."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-time Analytics"
              description="Beautiful dashboards with actionable insights. See what's working and optimize your outreach strategy."
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon={Target}
              title="Lead Scoring"
              description="AI scores every lead based on conversion probability. Focus on the hottest opportunities first."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={Clock}
              title="Auto Follow-ups"
              description="Set it and forget it. Automated follow-up sequences that run on autopilot to maximize conversions."
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={Shield}
              title="GDPR Compliant"
              description="Built with privacy in mind. Automatic unsubscribe management and full compliance with email regulations."
              gradient="from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12">
            Trusted by Growing Businesses Worldwide
          </h3>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <StatCard number="3,500+" label="Active Users" />
            <StatCard number="50,000+" label="Leads Generated" />
            <StatCard number="94%" label="Customer Satisfaction" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              name="Free"
              price={0}
              description="Perfect to get started"
              features={[
                '10 leads per month',
                'AI lead discovery',
                'Basic email templates',
                'Email tracking',
                'Standard support'
              ]}
              cta="Start Free"
              onCTA={() => navigate('/register')}
            />
            <PricingCard
              name="Pro"
              price={29}
              description="For growing businesses"
              features={[
                '100 leads per month',
                'Everything in Free',
                'AI email generator',
                'Auto follow-ups',
                'Advanced analytics',
                'Priority support',
                'CSV import/export'
              ]}
              cta="Start Pro Trial"
              onCTA={() => navigate('/register')}
              popular
            />
            <PricingCard
              name="Enterprise"
              price={99}
              description="For scaling companies"
              features={[
                'Unlimited leads',
                'Everything in Pro',
                'White label',
                'API access',
                'Team collaboration',
                'Dedicated support',
                'SLA guarantee'
              ]}
              cta="Contact Sales"
              onCTA={() => navigate('/register')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to 10x Your Lead Generation?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using ExportHunter AI
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 font-semibold shadow-xl text-lg"
          >
            Start Free Trial - No Credit Card Required
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto text-center">
          <p>© 2025 ExportHunter AI. All rights reserved.</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, gradient }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  )
}

function StatCard({ number, label }: any) {
  return (
    <div className="text-center">
      <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  )
}

function PricingCard({ name, price, description, features, cta, onCTA, popular }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative p-8 rounded-2xl border-2 ${
        popular 
          ? 'border-blue-600 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50' 
          : 'border-gray-200 bg-white shadow-lg'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="mb-2">
          <span className="text-5xl font-bold">${price}</span>
          <span className="text-gray-600">/month</span>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature: string) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCTA}
        className={`w-full py-3 rounded-xl font-semibold ${
          popular
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {cta}
      </button>
    </motion.div>
  )
}
LANDING

echo "✅ Landing page created"

echo ""
echo "✅ Part 3/4 Landing Page complete!"
echo ""
