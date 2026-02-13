#!/bin/bash

echo "📧 Email Service Frontend UI oluşturuluyor..."

cd exporthunter-ai/frontend

# ===========================================
# CREATE CAMPAIGN MODAL
# ===========================================

cat > src/components/CreateCampaignModal.tsx << 'CREATECAMPAIGN'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Mail, Users, Sparkles } from 'lucide-react'
import { campaignsAPI, aiAPI } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  selectedLeads?: any[]
}

export default function CreateCampaignModal({ 
  isOpen, 
  onClose, 
  selectedLeads = [] 
}: CreateCampaignModalProps) {
  const [step, setStep] = useState(1) // 1: Details, 2: Content, 3: Preview
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    leadIds: selectedLeads.map(l => l._id)
  })
  
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: campaignsAPI.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign created successfully!')
      onClose()
      resetForm()
    },
    onError: () => {
      toast.error('Failed to create campaign')
    }
  })

  const generateEmailMutation = useMutation({
    mutationFn: aiAPI.generateEmail,
    onSuccess: (response: any) => {
      setFormData({
        ...formData,
        subject: response.data.subject,
        body: response.data.body
      })
      toast.success('Email generated with AI!')
      setStep(2)
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      leadIds: []
    })
    setStep(1)
  }

  const handleCreate = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error('Please fill all fields')
      return
    }
    createMutation.mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Campaign</h2>
              <p className="text-sm text-gray-500">
                Step {step} of 3 • {selectedLeads.length} leads selected
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Q1 Product Launch"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">{selectedLeads.length} leads selected</span>
                  </div>
                  {selectedLeads.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedLeads.slice(0, 5).map((lead) => (
                        <span key={lead._id} className="text-xs bg-white px-2 py-1 rounded border">
                          {lead.companyName}
                        </span>
                      ))}
                      {selectedLeads.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{selectedLeads.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">
                      Generate email content with AI for faster creation
                    </p>
                    <button
                      onClick={() => {
                        if (selectedLeads.length > 0) {
                          generateEmailMutation.mutate({
                            companyName: selectedLeads[0].companyName,
                            product: 'your product',
                            tone: 'professional'
                          })
                        }
                      }}
                      disabled={generateEmailMutation.isPending}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50"
                    >
                      {generateEmailMutation.isPending ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Partnership Opportunity"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Write your email content..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: Keep it concise (150-200 words) and focus on value
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Preview</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Subject:</p>
                    <p className="font-medium text-gray-900">{formData.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Body:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.body}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700">
                  📊 This campaign will be sent to <strong>{selectedLeads.length} leads</strong>.
                  You can track opens and clicks after sending.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !formData.name}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
CREATECAMPAIGN

# ===========================================
# UPDATE CAMPAIGNS PAGE
# ===========================================

cat > src/pages/CampaignsPage.tsx << 'CAMPAIGNSPAGE'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Send, BarChart3, Mail } from 'lucide-react'
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
      toast.success(`Campaign sent to ${response.data.sent} leads!`)
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-500 mt-2">Create and manage your email campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </button>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first email campaign to reach out to your leads
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign: any) => (
            <div key={campaign._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{campaign.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{campaign.subject}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Recipients:</span>
                  <span className="font-medium">{campaign.stats.totalRecipients}</span>
                </div>
                {campaign.status === 'completed' && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sent:</span>
                      <span className="font-medium text-green-600">{campaign.stats.sentCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Opened:</span>
                      <span className="font-medium text-blue-600">{campaign.stats.openedCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Clicked:</span>
                      <span className="font-medium text-purple-600">{campaign.stats.clickedCount}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {campaign.status === 'draft' && (
                  <button
                    onClick={() => sendMutation.mutate(campaign._id)}
                    disabled={sendMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                )}
                {campaign.status === 'completed' && (
                  <button
                    onClick={() => window.location.href = `/campaigns/${campaign._id}/stats`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Stats
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Created {new Date(campaign.createdAt).toLocaleDateString()}
              </p>
            </div>
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

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    sending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    paused: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
CAMPAIGNSPAGE

# ===========================================
# UPDATE API SERVICE
# ===========================================

cat >> src/services/api.ts << 'APIUPDATE'

// Campaigns API endpoints
export const campaignsAPI = {
  getCampaigns: (params?: { page?: number; limit?: number }) =>
    api.get('/campaigns', { params }),

  getCampaign: (id: string) => api.get(`/campaigns/${id}`),

  createCampaign: (data: { name: string; subject: string; body: string; leadIds: string[] }) =>
    api.post('/campaigns', data),

  updateCampaign: (id: string, data: any) => api.put(`/campaigns/${id}`, data),

  deleteCampaign: (id: string) => api.delete(`/campaigns/${id}`),

  sendCampaign: (id: string) => api.post(`/campaigns/${id}/send`),

  getCampaignStats: (id: string) => api.get(`/campaigns/${id}/stats`),
};
APIUPDATE

# ===========================================
# UPDATE LEADS PAGE - ADD CAMPAIGN BUTTON
# ===========================================

cat > src/pages/LeadsPage.tsx << 'LEADSUPDATE'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Sparkles, Mail } from 'lucide-react'
import { leadsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import AILeadDiscovery from '../components/AILeadDiscovery'
import CreateCampaignModal from '../components/CreateCampaignModal'

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAIModal, setShowAIModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<any[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['leads', statusFilter],
    queryFn: () => leadsAPI.getLeads({ status: statusFilter === 'all' ? undefined : statusFilter })
  })

  const leads = data?.data?.leads || []

  const handleSelectLead = (lead: any) => {
    const isSelected = selectedLeads.find(l => l._id === lead._id)
    if (isSelected) {
      setSelectedLeads(selectedLeads.filter(l => l._id !== lead._id))
    } else {
      setSelectedLeads([...selectedLeads, lead])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-2">Manage your potential customers</p>
        </div>
        <div className="flex gap-3">
          {selectedLeads.length > 0 && (
            <button
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Mail className="w-5 h-5" />
              Create Campaign ({selectedLeads.length})
            </button>
          )}
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            AI Discover
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-5 h-5" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="qualified">Qualified</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLeads(leads)
                    } else {
                      setSelectedLeads([])
                    }
                  }}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Sparkles className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500">No leads found</p>
                    <button
                      onClick={() => setShowAIModal(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Discover Leads with AI
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead: any) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.find(l => l._id === lead._id) !== undefined}
                      onChange={() => handleSelectLead(lead)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{lead.companyName}</td>
                  <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                  <td className="px-6 py-4 text-gray-600">{lead.country}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600"
                          style={{ width: `${lead.aiScore}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{lead.aiScore}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AILeadDiscovery isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
      <CreateCampaignModal
        isOpen={showCampaignModal}
        onClose={() => {
          setShowCampaignModal(false)
          setSelectedLeads([])
        }}
        selectedLeads={selectedLeads}
      />
    </div>
  )
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    interested: 'bg-purple-100 text-purple-800',
    qualified: 'bg-green-100 text-green-800',
    customer: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
LEADSUPDATE

echo ""
echo "✅ Email Frontend UI hazır!"
echo ""
echo "📧 Oluşturulan Componentler:"
echo "  - CreateCampaignModal: 3 adımlı campaign oluşturma"
echo "  - Updated CampaignsPage: Campaign listesi ve gönderim"
echo "  - Updated LeadsPage: Lead seçimi ve campaign oluşturma"
echo ""
echo "🎨 Özellikler:"
echo "  - AI ile email içeriği oluşturma"
echo "  - Çoklu lead seçimi"
echo "  - Campaign durumu tracking"
echo "  - Email preview"
echo "  - Gönderim istatistikleri"
echo ""
