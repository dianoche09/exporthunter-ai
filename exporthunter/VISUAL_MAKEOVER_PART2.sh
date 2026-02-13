#!/bin/bash

echo "🎨 Visual Makeover Part 2 - Leads & Campaigns..."

cd exporthunter-ai/frontend

# ===========================================
# ENHANCED LEADS PAGE WITH CARD VIEW
# ===========================================

cat > src/pages/LeadsPage.tsx << 'LEADSPAGE'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Sparkles, Mail, Upload, Download,
  Grid, List, MapPin, Globe, Phone, Star, TrendingUp
} from 'lucide-react'
import { leadsAPI, api } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import AILeadDiscovery from '../components/AILeadDiscovery'
import CreateCampaignModal from '../components/CreateCampaignModal'
import toast from 'react-hot-toast'

type ViewMode = 'table' | 'cards'

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAIModal, setShowAIModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const queryClient = useQueryClient()

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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/import/leads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`Imported ${response.data.data.success} leads!`)
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    } catch (error) {
      toast.error('Failed to import leads')
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/import/leads/export', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'leads.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Leads exported!')
    } catch (error) {
      toast.error('Failed to export leads')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Leads
          </h1>
          <p className="text-gray-600 mt-2">Manage your potential customers • {leads.length} total</p>
        </div>
        <div className="flex gap-3">
          {selectedLeads.length > 0 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg"
            >
              <Mail className="w-5 h-5" />
              Campaign ({selectedLeads.length})
            </motion.button>
          )}
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 cursor-pointer">
            <Upload className="w-5 h-5" />
            Import
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            AI Discover
          </button>
        </div>
      </motion.div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="qualified">Qualified</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Leads Display */}
      {leads.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600 mb-6">Start discovering potential customers with AI</p>
          <button
            onClick={() => setShowAIModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 shadow-lg"
          >
            Discover Leads with AI
          </button>
        </motion.div>
      ) : viewMode === 'cards' ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {leads.map((lead: any, index: number) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                isSelected={selectedLeads.find(l => l._id === lead._id) !== undefined}
                onSelect={() => handleSelectLead(lead)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <TableView 
          leads={leads} 
          selectedLeads={selectedLeads}
          onSelectLead={handleSelectLead}
          onSelectAll={(checked) => {
            setSelectedLeads(checked ? leads : [])
          }}
        />
      )}

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

function LeadCard({ lead, isSelected, onSelect, index }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all cursor-pointer ${
        isSelected ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-100 hover:border-blue-200'
      }`}
      onClick={onSelect}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 right-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Company Info */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 pr-8">{lead.companyName}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{lead.country}</span>
          {lead.city && <span>• {lead.city}</span>}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.website && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="truncate">{lead.website}</span>
          </div>
        )}
      </div>

      {/* Status & AI Score */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
          {lead.status}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-900">{lead.aiScore}</span>
          </div>
          {lead.source === 'ai-discovery' && (
            <Sparkles className="w-4 h-4 text-purple-500" />
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TableView({ leads, selectedLeads, onSelectLead, onSelectAll }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
          <tr>
            <th className="px-6 py-4 text-left">
              <input
                type="checkbox"
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded"
              />
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Country</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">AI Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map((lead: any) => (
            <motion.tr
              key={lead._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-blue-50 transition-colors"
            >
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedLeads.find((l: any) => l._id === lead._id) !== undefined}
                  onChange={() => onSelectLead(lead)}
                  className="rounded"
                />
              </td>
              <td className="px-6 py-4 font-medium text-gray-900">{lead.companyName}</td>
              <td className="px-6 py-4 text-gray-600">{lead.email}</td>
              <td className="px-6 py-4 text-gray-600">{lead.country}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${lead.aiScore}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{lead.aiScore}</span>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    interested: 'bg-purple-100 text-purple-700',
    qualified: 'bg-green-100 text-green-700',
    customer: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}
LEADSPAGE

echo ""
echo "✅ Part 2/3 - Enhanced Leads page completed!"
echo ""
