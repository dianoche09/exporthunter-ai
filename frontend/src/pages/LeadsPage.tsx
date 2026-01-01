import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Sparkles, Mail, Upload, Download, Filter, MoreHorizontal, CheckCircle2 } from 'lucide-react'
import { leadsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import AILeadDiscovery from '../components/AILeadDiscovery'
import CreateCampaignModal from '../components/CreateCampaignModal'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAIModal, setShowAIModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['leads', statusFilter],
    queryFn: () => leadsAPI.getLeads({ status: statusFilter === 'all' ? undefined : statusFilter })
  })

  const importMutation = useMutation({
    mutationFn: leadsAPI.importLeads,
    onSuccess: (data: any) => {
      toast.success(`Successfully imported ${data.data.data.imported} leads!`)
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to import leads')
    }
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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        importMutation.mutate(content)
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleExport = async () => {
    try {
      const response = await leadsAPI.exportLeads({
        status: statusFilter === 'all' ? undefined : statusFilter
      })
      const url = window.URL.createObjectURL(new Blob([response as any]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Leads exported successfully')
    } catch (error) {
      toast.error('Failed to export leads')
    }
  }

  const filteredLeads = leads.filter((lead: any) =>
    lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leads</h1>
          <p className="text-gray-500 mt-2">Manage and track your potential customers</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            {importMutation.isPending ? <LoadingSpinner size="sm" /> : <Upload className="w-4 h-4" />}
            Import CSV
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2 hidden md:block"></div>

          {selectedLeads.length > 0 ? (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg shadow-green-200"
            >
              <Mail className="w-4 h-4" />
              Campaign ({selectedLeads.length})
            </motion.button>
          ) : (
            <>
              <button
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                AI Discover
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-105">
                <Plus className="w-4 h-4" />
                Add Lead
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center"
      >
        <div className="flex-1 relative w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads by company or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[160px]"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="qualified">Qualified</option>
            <option value="customer">Customer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </motion.div>

      {/* Leads Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left w-12">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads(leads)
                        } else {
                          setSelectedLeads([])
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Score</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">No leads found</p>
                          <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                        </div>
                        <button
                          onClick={() => setShowAIModal(true)}
                          className="mt-2 px-6 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 font-medium transition-colors"
                        >
                          Discover New Leads
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead: any, index: number) => (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-blue-50/30 transition-colors ${selectedLeads.find(l => l._id === lead._id) ? 'bg-blue-50/50' : ''
                        }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedLeads.find(l => l._id === lead._id) !== undefined}
                            onChange={() => handleSelectLead(lead)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{lead.companyName}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-gray-500">{lead.country}</span>
                            {lead.city && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500">{lead.city}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-700">{lead.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{lead.website}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status === 'qualified' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {lead.aiScore > 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${lead.aiScore}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={`h-full rounded-full ${getScoreColor(lead.aiScore)}`}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{lead.aiScore}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

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

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}
