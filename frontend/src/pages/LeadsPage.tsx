
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Sparkles, Mail, Upload, Download, Filter, MoreHorizontal, CheckCircle2, Trash2, Edit, ArrowUpDown, ArrowUp, ArrowDown, X, Radar, Target, Bot, Zap, ChevronUp, ChevronDown, Flame, Briefcase, RefreshCw, Calendar, Clock, MessageSquare, Phone, LayoutGrid, List as ListIcon, Globe, ChevronLeft, ChevronRight, Layout } from 'lucide-react'
import KanbanBoard from '../components/KanbanBoard'
import { leadsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import SupplyChainIntelModal from '../components/SupplyChainIntelModal'
import AILeadDiscovery from '../components/AILeadDiscovery'
import CreateCampaignModal from '../components/CreateCampaignModal'
import LeadModal from '../components/LeadModal'
import SmartSegments from '../components/SmartSegments'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useLocation, useSearchParams } from 'react-router-dom'

export default function LeadsPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list')

  const [statusFilter, setStatusFilter] = useState('all')

  // Initialize from URL to ensure immediate open without useEffect delay
  const [showAIModal, setShowAIModal] = useState(() => {
    return new URLSearchParams(window.location.search).get('open_wizard') === 'true'
  })
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<any[]>([])
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const [editingLead, setEditingLead] = useState<any>(null)
  const [showIntelModal, setShowIntelModal] = useState(false)
  const [selectedLeadForIntel, setSelectedLeadForIntel] = useState<any>(null)
  const [clusterFilter, setClusterFilter] = useState<{ id: string, title: string, leadIds: string[] } | null>(null)

  // Auto-open Wizard if requested via URL or handle filters
  useEffect(() => {
    if (searchParams.get('open_wizard') === 'true') {
      setShowAIModal(true)
    }
    const filter = searchParams.get('filter')
    if (filter === 'unread' || filter === 'new_opportunities') {
      setStatusFilter('new')
    }
  }, [searchParams])

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc'
  })

  // Hero collapse state with persistence
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(() => {
    const saved = localStorage.getItem('leadsHeroCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('leadsHeroCollapsed', JSON.stringify(isHeroCollapsed))
  }, [isHeroCollapsed])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['leads', statusFilter, page],
    queryFn: () => leadsAPI.getLeads({ page, status: statusFilter === 'all' ? undefined : statusFilter })
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: leadsAPI.deleteLead,
    onSuccess: () => {
      toast.success('Lead deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
    onError: () => {
      toast.error('Failed to delete lead')
    }
  })

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsAPI.updateLead(id, { status }),
    onSuccess: () => {
      toast.success('Lead status updated');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  // Import Mutation
  const importMutation = useMutation({
    mutationFn: leadsAPI.importLeads,
    onSuccess: (data: any) => {
      toast.success(`Successfully imported ${data.data.imported} leads!`)
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to import leads')
    }
  })

  const leads = data?.data?.leads || []

  // Logic to handle segment selection
  const handleSelectSegment = (segment: any) => {
    setClusterFilter({
      id: segment.id,
      title: segment.title,
      leadIds: segment.data.map((l: any) => l._id)
    });
    setPage(1);
    toast.success(`Showing ${segment.count} leads from ${segment.title} cluster`);
  }

  const handleStartCampaignFromSegment = (segmentLeads: any[]) => {
    setSelectedLeads(segmentLeads);
    setShowCampaignModal(true);
  }

  // Sorting Logic
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const getSortedLeads = (leadsToSort: any[]) => {
    return [...leadsToSort].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested or specific fields if needed
      if (sortConfig.key === 'companyName') {
        aValue = a.companyName?.toLowerCase() || '';
        bValue = b.companyName?.toLowerCase() || '';
      }
      if (sortConfig.key === 'email') {
        aValue = a.email?.toLowerCase() || '';
        bValue = b.email?.toLowerCase() || '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    })
  }

  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch = lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.tags && lead.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCluster = !clusterFilter || clusterFilter.leadIds.includes(lead._id);

    return matchesSearch && matchesCluster;
  })

  const sortedAndFilteredLeads = getSortedLeads(filteredLeads)

  const handleSelectLead = (lead: any) => {
    const isSelected = selectedLeads.find(l => l._id === lead._id)
    if (isSelected) {
      setSelectedLeads(selectedLeads.filter(l => l._id !== lead._id))
    } else {
      setSelectedLeads([...selectedLeads, lead])
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteMutation.mutate(id)
    }
    setActiveActionId(null)
  }

  const handleEdit = (lead: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingLead(lead);
    setShowLeadModal(true);
    setActiveActionId(null);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="w-4 h-4 text-slate-400 opacity-20 group-hover:opacity-50 transition-opacity" />
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }
  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'Turkey': '🇹🇷',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'USA': '🇺🇸',
      'United States': '🇺🇸',
      'Germany': '🇩🇪',
      'Italy': '🇮🇹',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'UK': '🇬🇧',
      'United Kingdom': '🇬🇧',
      'Russia': '🇷🇺',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
    };
    return flags[country] || '🌐';
  };

  const getLogoUrl = (website?: string) => {
    if (!website) return null;
    try {
      const domain = website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      return `https://logo.clearbit.com/${domain}`;
    } catch {
      return null;
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto bg-slate-50 min-h-screen font-outfit" onClick={() => setActiveActionId(null)}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Lead Radar Hero - Same structure as Dashboard */}
        {/* Collapsible Lead Radar Hero */}
        <motion.div
          variants={item}
          animate={{
            padding: isHeroCollapsed ? "1rem 2rem" : "2rem",
          }}
          className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-[2rem] text-white relative overflow-hidden transition-all duration-300 shadow-xl"
        >
          {/* Toggle Button - Always visible */}
          <button
            onClick={() => setIsHeroCollapsed(!isHeroCollapsed)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-50 backdrop-blur-md transition-colors"
          >
            {isHeroCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-purple-500/30 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {isHeroCollapsed ? (
                // Collapsed State: Compact Bar
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex items-center justify-between h-10"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <Radar className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-white">LEAD RADAR</h1>
                  </div>

                  <div className="flex items-center gap-4 pr-12">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAIModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-1.5 bg-white text-purple-600 rounded-lg font-black text-sm shadow-sm hover:scale-105 transition-transform"
                    >
                      <Sparkles className="w-3 h-3" />
                      AI Discover
                    </button>
                  </div>
                </motion.div>
              ) : (
                // Expanded State: Full Hero Content
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1">
                      {/* Lead Radar Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
                        <Radar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Lead Radar</span>
                      </div>

                      <h1 className="text-3xl lg:text-4xl font-black mb-4">
                        Lead Radar
                      </h1>

                      <p className="text-lg text-blue-100 leading-relaxed max-w-2xl font-medium">
                        AI-powered lead discovery and management. Find new customers worldwide by triggering the discovery engine.
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mt-6">
                        <input
                          type="file"
                          accept=".csv"
                          ref={fileInputRef}
                          onChange={handleImport}
                          className="hidden"
                        />
                        <button
                          onClick={() => setShowAIModal(true)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 rounded-xl font-black hover:bg-purple-50 shadow-lg transition-all"
                        >
                          <Sparkles className="w-4 h-4" />
                          AI Discover
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-xl font-bold transition-all"
                        >
                          {importMutation.isPending ? <LoadingSpinner size="sm" /> : <Upload className="w-4 h-4" />}
                          Import CSV
                        </button>
                        <button
                          onClick={handleExport}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-xl font-bold transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                      </div>
                    </div>

                    {/* Right Side Widget - Like Dashboard */}
                    <div className="flex-shrink-0">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                        <Target className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                        <div className="text-5xl font-black">{leads.length}</div>
                        <div className="text-sm text-blue-200 font-bold mt-1">Total Leads</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Stat Cards - Now in WHITE area like Dashboard */}
        <motion.div variants={item}>
          <SmartSegments
            leads={leads}
            onSelectSegment={handleSelectSegment}
            onStartCampaign={handleStartCampaignFromSegment}
          />
        </motion.div>

        {clusterFilter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Active Cluster Filter</p>
                <p className="text-sm font-bold text-blue-900">{clusterFilter.title}</p>
              </div>
            </div>
            <button
              onClick={() => setClusterFilter(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-bold text-xs border border-blue-100 hover:bg-blue-50 transition-colors"
            >
              <X className="w-4 h-4" /> Clear Filter
            </button>
          </motion.div>
        )}

        {/* Search existing leads bar */}
        <motion.div
          variants={item}
          className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="flex-1 relative w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search your existing leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ListIcon className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                Thumbnail
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Target className="w-4 h-4" />
                Kanban
              </button>
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none min-w-[160px] font-bold text-slate-700 text-sm appearance-none"
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


        {viewMode === 'list' ? (
          <>
            <div className="mt-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-5 w-10 border-b border-slate-100">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedLeads.length > 0 && selectedLeads.length === filteredLeads.length}
                            ref={input => {
                              if (input) {
                                input.indeterminate = selectedLeads.length > 0 && selectedLeads.length < filteredLeads.length;
                              }
                            }}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeads(filteredLeads)
                              } else {
                                setSelectedLeads([])
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                      </th>
                      <th
                        className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer group select-none hover:bg-slate-100 transition-colors border-b border-slate-100"
                        onClick={() => handleSort('companyName')}
                      >
                        <div className="flex items-center gap-2">Company <SortIcon column="companyName" /></div>
                      </th>
                      <th
                        className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer group select-none hover:bg-slate-100 transition-colors border-b border-slate-100"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center gap-2">Contact <SortIcon column="email" /></div>
                      </th>
                      <th
                        className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer group select-none hover:bg-slate-100 transition-colors border-b border-slate-100"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">Status <SortIcon column="status" /></div>
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                        Next Step
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                        Last Activity
                      </th>
                      <th
                        className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer group select-none hover:bg-slate-100 transition-colors border-b border-slate-100"
                        onClick={() => handleSort('aiScore')}
                      >
                        <div className="flex items-center gap-2">Match Score <SortIcon column="aiScore" /></div>
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                        Buying Signals
                      </th>
                      <th className="px-6 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {sortedAndFilteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-16 text-center">
                            <div className="max-w-lg mx-auto">
                              <div className="relative w-32 h-32 mx-auto mb-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl animate-pulse" />
                                <div className="absolute inset-3 bg-white rounded-2xl shadow-inner flex items-center justify-center">
                                  <Radar className="w-12 h-12 text-purple-600" />
                                </div>
                                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 animate-bounce" />
                              </div>
                              <h3 className="text-2xl font-black text-slate-900 mb-2">No Leads Found</h3>
                              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                We couldn't find any leads matching your criteria. Try adjusting your filters or search term.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        sortedAndFilteredLeads.map((lead: any, index: number) => (
                          <motion.tr
                            key={lead._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`hover:bg-blue-50/30 transition-colors group cursor-pointer ${selectedLeads.find(l => l._id === lead._id) ? 'bg-blue-50/50' : ''}`}
                            onClick={() => handleEdit(lead)}
                          >
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={selectedLeads.find(l => l._id === lead._id) !== undefined}
                                  onChange={() => handleSelectLead(lead)}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {getLogoUrl(lead.website) ? (
                                    <img
                                      src={getLogoUrl(lead.website)!}
                                      alt={lead.companyName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-slate-400 font-bold">' + lead.companyName.charAt(0) + '</div>';
                                      }}
                                    />
                                  ) : (
                                    <Building2 className="w-5 h-5 text-slate-300" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-slate-900 line-clamp-1">{lead.companyName}</p>
                                    {lead.aiScore > 80 && <Sparkles className="w-3 h-3 text-yellow-500" />}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                      {getCountryFlag(lead.country)} {lead.country}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-slate-700 font-bold">{lead.email}</p>
                                <p className="text-xs text-slate-400 mt-0.5 font-medium">{lead.website}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                Follow-up
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : 'New'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${lead.aiScore}%` }}
                                    className={`h-full ${getScoreColor(lead.aiScore)}`}
                                  />
                                </div>
                                <span className="text-xs font-black text-slate-700">{lead.aiScore}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-1.5">
                                {lead.aiScore > 75 && (
                                  <div className="p-1.5 bg-orange-50 rounded-lg" title="High Intent">
                                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                                  </div>
                                )}
                                <div className="p-1.5 bg-blue-50 rounded-lg" title="Industry Match">
                                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShowCampaignModal(true); setSelectedLeads([lead]); }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLeadForIntel(lead);
                                    setShowIntelModal(true);
                                  }}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                  title="Strategic Pitch"
                                >
                                  <Zap className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingLead(lead);
                                    setShowLeadModal(true);
                                  }}
                                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : viewMode === 'grid' ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {sortedAndFilteredLeads.map((lead: any, index: number) => (
                <motion.div
                  key={lead._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative cursor-pointer"
                  onClick={() => handleEdit(lead)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden border border-slate-100 shadow-sm">
                      {getLogoUrl(lead.website) ? (
                        <img
                          src={getLogoUrl(lead.website)!}
                          alt={lead.companyName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-slate-300 font-black text-xl">' + lead.companyName.charAt(0) + '</div>';
                          }}
                        />
                      ) : (
                        <Briefcase className="w-7 h-7 text-slate-300" />
                      )}
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${getScoreColor(lead.aiScore)}`}>
                      {lead.aiScore}% Match
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{lead.companyName}</h3>
                    <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>{getCountryFlag(lead.country)}</span>
                      {lead.country}
                    </p>
                  </div>

                  <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 mb-6">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">AI Catch</span>
                    </div>
                    <p className="text-xs text-blue-700 font-bold leading-relaxed line-clamp-2">
                      Market signal detected. {lead.country} RDP demand is surging.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowCampaignModal(true); setSelectedLeads([lead]); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Start Campaign"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLeadForIntel(lead);
                          setShowIntelModal(true);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Strategic Pitch"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div variants={item} className="mt-8">
            <KanbanBoard
              leads={sortedAndFilteredLeads}
              onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
              onEditLead={handleEdit}
            />
          </motion.div>
        )}

        {/* Unified Pagination */}
        {sortedAndFilteredLeads.length > 0 && (
          <div className="mt-12 mb-24 flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="text-sm font-bold text-slate-500">
              Showing <span className="text-slate-900">{(page - 1) * 20 + 1} - {Math.min(page * 20, sortedAndFilteredLeads.length)}</span> of <span className="text-slate-900">{sortedAndFilteredLeads.length}</span> leads
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[1, 2, 3].map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-12 h-12 rounded-xl font-black transition-all ${page === p ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => p + 1)}
                className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Bulk Action Bar */}
        <AnimatePresence>
          {selectedLeads.length > 0 && (
            <motion.div
              initial={{ y: 200, opacity: 0, x: '-50%' }}
              animate={{ y: 0, opacity: 1, x: '-50%' }}
              exit={{ y: 200, opacity: 0, x: '-50%' }}
              className="fixed bottom-10 left-1/2 z-[100] w-max"
            >
              <div className="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-4 pr-8 border-r border-white/10">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl font-black">
                    {selectedLeads.length}
                  </div>
                  <div>
                    <p className="font-black text-sm">Leads Selected</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Batch</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowCampaignModal(true)}
                    className="flex items-center gap-2 px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-black hover:bg-blue-50 transition-all transform hover:scale-105"
                  >
                    <Mail className="w-5 h-5" /> Start Campaign
                  </button>
                  <button
                    onClick={() => setSelectedLeads([])}
                    className="p-3 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AILeadDiscovery
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onLeadsDiscovered={() => {
            queryClient.invalidateQueries({ queryKey: ['leads'] })
          }}
        />

        <LeadModal
          isOpen={showLeadModal}
          onClose={() => setShowLeadModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
          initialData={editingLead}
        />

        <CreateCampaignModal
          isOpen={showCampaignModal}
          onClose={() => {
            setShowCampaignModal(false)
            setSelectedLeads([])
          }}
          selectedLeads={selectedLeads}
        />

        <SupplyChainIntelModal
          isOpen={showIntelModal}
          onClose={() => setShowIntelModal(false)}
          lead={selectedLeadForIntel}
        />
      </motion.div>
    </div >
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
  return colors[status] || 'bg-slate-100 text-slate-800'
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}
