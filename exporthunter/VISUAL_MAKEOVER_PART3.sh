#!/bin/bash

echo "🎨 Visual Makeover Part 3 - Campaigns, Login & Confetti..."

cd exporthunter-ai/frontend

# ===========================================
# ENHANCED CAMPAIGNS PAGE
# ===========================================

cat > src/pages/CampaignsPage.tsx << 'CAMPAIGNS'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Plus, Send, BarChart3, Mail, CheckCircle, Clock, Zap } from 'lucide-react'
import { campaignsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import CreateCampaignModal from '../components/CreateCampaignModal'
import toast from 'react-hot-toast'

export default function CampaignsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsAPI.getCampaigns()
  })

  const sendMutation = useMutation({
    mutationFn: campaignsAPI.sendCampaign,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      
      // Confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      toast.success(`🎉 Campaign sent to ${response.data.sent} leads!`)
    },
    onError: () => {
      toast.error('Failed to send campaign')
    }
  })

  const campaigns = data?.data?.campaigns || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Email Campaigns
          </h1>
          <p className="text-gray-600 mt-2">Create and manage your outreach campaigns • {campaigns.length} total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </motion.button>
      </motion.div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first email campaign to reach out to your leads
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Create Campaign
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign: any, index: number) => (
            <CampaignCard
              key={campaign._id}
              campaign={campaign}
              onSend={() => sendMutation.mutate(campaign._id)}
              isSending={sendMutation.isPending}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}

function CampaignCard({ campaign, onSend, isSending, index }: any) {
  const statusConfig = {
    draft: { icon: Clock, color: 'gray', gradient: 'from-gray-500 to-gray-600' },
    scheduled: { icon: Clock, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    sending: { icon: Zap, color: 'yellow', gradient: 'from-yellow-500 to-orange-500' },
    completed: { icon: CheckCircle, color: 'green', gradient: 'from-green-500 to-emerald-500' },
    paused: { icon: Clock, color: 'red', gradient: 'from-red-500 to-pink-500' }
  }

  const config = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.draft
  const StatusIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden group"
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1 text-lg">{campaign.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{campaign.subject}</p>
          </div>
          <div className={`p-2 bg-gradient-to-br ${config.gradient} rounded-xl`}>
            <StatusIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Recipients</span>
            <span className="font-semibold text-gray-900">{campaign.stats.totalRecipients}</span>
          </div>
          
          {campaign.status === 'completed' && (
            <>
              <div className="h-px bg-gray-100" />
              <div className="grid grid-cols-2 gap-3">
                <StatBadge label="Sent" value={campaign.stats.sentCount} color="blue" />
                <StatBadge label="Opened" value={campaign.stats.openedCount} color="green" />
                <StatBadge label="Clicked" value={campaign.stats.clickedCount} color="purple" />
                <StatBadge label="Replied" value={campaign.stats.repliedCount} color="emerald" />
              </div>
              
              {/* Open Rate Progress */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Open Rate</span>
                  <span className="font-semibold">
                    {Math.round((campaign.stats.openedCount / campaign.stats.sentCount) * 100) || 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(campaign.stats.openedCount / campaign.stats.sentCount) * 100 || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {campaign.status === 'draft' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSend}
              disabled={isSending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-md disabled:opacity-50 text-sm font-medium"
            >
              {isSending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Now
                </>
              )}
            </motion.button>
          )}
          {campaign.status === 'completed' && (
            <button
              onClick={() => window.location.href = `/campaigns/${campaign._id}/stats`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-xl hover:from-blue-200 hover:to-purple-200 text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              View Stats
            </button>
          )}
        </div>

        {/* Date */}
        <p className="text-xs text-gray-400 mt-4">
          Created {new Date(campaign.createdAt).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  )
}

function StatBadge({ label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    emerald: 'bg-emerald-100 text-emerald-700'
  }

  return (
    <div className="text-center">
      <div className={`${colors[color]} px-2 py-1 rounded-lg`}>
        <span className="text-lg font-bold">{value}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
CAMPAIGNS

echo ""
echo "✅ Part 3/3 completed!"
echo ""
echo "🎉 FULL VISUAL MAKEOVER COMPLETE!"
echo ""
echo "🎨 Changes Made:"
echo "  ✅ Dashboard: Animated charts (Line, Pie, Bar), CountUp, Framer Motion"
echo "  ✅ Leads: Card view, Table view toggle, Animated progress bars"
echo "  ✅ Campaigns: Confetti on success, Gradient cards, Progress indicators"
echo "  ✅ All: Smooth animations, Hover effects, Gradient backgrounds"
echo ""
echo "📦 New Dependencies:"
echo "  - recharts: Charts library"
echo "  - framer-motion: Animations"
echo "  - react-countup: Number animations"
echo "  - canvas-confetti: Celebration effects"
echo ""
echo "🚀 Installation:"
echo "  cd frontend && npm install"
echo ""
