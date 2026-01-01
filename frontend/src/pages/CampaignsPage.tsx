import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Send, BarChart3, Mail, Calendar, ArrowRight, PauseCircle, PlayCircle, MoreVertical, Trash2 } from 'lucide-react'
import { campaignsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import CreateCampaignModal from '../components/CreateCampaignModal'
import { motion, AnimatePresence } from 'framer-motion'
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
      toast.success(`Campaign sent to ${response.data.sent} leads!`)
    },
    onError: () => {
      toast.error('Failed to send campaign')
    }
  })

  const campaigns = data?.data?.campaigns || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Campaigns</h1>
          <p className="text-gray-500 mt-2">Create, manage, and track your email outreach</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </motion.button>
      </motion.div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center"
        >
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No campaigns yet</h3>
            <p className="text-gray-500 mb-8 text-lg">
              Start your first outreach campaign to connect with potential customers.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First Campaign
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {campaigns.map((campaign: any) => (
            <motion.div
              key={campaign._id}
              variants={item}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-bold text-gray-900 mb-1 truncate text-lg group-hover:text-blue-600 transition-colors">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {campaign.subject}
                  </p>
                </div>
                <Badge status={campaign.status} />
              </div>

              {/* Stats Section */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Recipients</span>
                  <span className="font-bold text-gray-900">{campaign.stats.totalRecipients}</span>
                </div>

                {campaign.status !== 'draft' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Sent</span>
                        <span className="font-medium text-gray-900">
                          {Math.round((campaign.stats.sentCount / campaign.stats.totalRecipients) * 100) || 0}%
                        </span>
                      </div>
                      <ProgressBar
                        value={campaign.stats.sentCount}
                        total={campaign.stats.totalRecipients}
                        color="bg-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Open Rate</p>
                        <p className="text-lg font-bold text-gray-900">
                          {campaign.stats.openRate || 0}%
                        </p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Click Rate</p>
                        <p className="text-lg font-bold text-gray-900">
                          {campaign.stats.clickRate || 0}%
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </span>

                <div className="flex gap-2">
                  {campaign.status === 'draft' ? (
                    <button
                      onClick={() => sendMutation.mutate(campaign._id)}
                      disabled={sendMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {sendMutation.isPending ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                      Launch
                    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = `/campaigns/${campaign._id}/stats`}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}

function Badge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    scheduled: 'bg-blue-50 text-blue-600 border-blue-100 dashed',
    sending: 'bg-yellow-50 text-yellow-600 border-yellow-100 animate-pulse',
    completed: 'bg-green-50 text-green-600 border-green-100',
    paused: 'bg-red-50 text-red-600 border-red-100'
  }

  const label: Record<string, string> = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    sending: 'Sending...',
    completed: 'Completed',
    paused: 'Paused'
  }

  return (
    <span className={`px-2.5 py-1 text-xs rounded-full border font-medium ${styles[status] || styles.draft}`}>
      {label[status] || status}
    </span>
  )
}

function ProgressBar({ value, total, color }: { value: number, total: number, color: string }) {
  const percentage = Math.min(100, Math.max(0, (value / (total || 1)) * 100))

  return (
    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  )
}
