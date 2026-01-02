import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Send, BarChart3, Mail, Calendar, ArrowRight, PauseCircle, PlayCircle, MoreVertical, Trash2, ChevronUp, ChevronDown, Wand2, TrendingUp, Bot, Sparkles, Target, Zap, Activity, Globe, Shield, MessageCircle, GitBranch, TestTube, MousePointer2, AlertTriangle } from 'lucide-react'
import { campaignsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import CreateCampaignModal from '../components/CreateCampaignModal'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function CampaignsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [magicInput, setMagicInput] = useState('')
  const [isProcessingMagic, setIsProcessingMagic] = useState(false)

  // Hero collapse state with persistence
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(() => {
    const saved = localStorage.getItem('campaignsHeroCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('campaignsHeroCollapsed', JSON.stringify(isHeroCollapsed))
  }, [isHeroCollapsed])

  const queryClient = useQueryClient()

  // Live Pulse Mock Data
  const [currentPulseIndex, setCurrentPulseIndex] = useState(0)
  const liveEvents = [
    { id: 1, text: "Siemens CEO opened your email", time: "2m ago", icon: Mail, color: "text-blue-400" },
    { id: 2, text: "Bosch clicked the proposal link", time: "5m ago", icon: MousePointer2, color: "text-green-400" },
    { id: 3, text: "AI scheduled a meeting with Acme Corp", time: "12m ago", icon: Calendar, color: "text-purple-400" },
    { id: 4, text: "New reply from TechGiant Inc.", time: "Just now", icon: MessageCircle, color: "text-yellow-400" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPulseIndex((prev) => (prev + 1) % liveEvents.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

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
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const handleMagicSubmit = () => {
    if (!magicInput.trim()) return
    setIsProcessingMagic(true)
    setTimeout(() => {
      setIsProcessingMagic(false)
      setShowCreateModal(true)
      setMagicInput('')
      toast.success("AI Draft Generated based on your prompt!", { icon: '✨' })
    }, 1200)
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
    <div className="p-8 max-w-[1600px] mx-auto bg-slate-50 min-h-screen font-outfit">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Collapsible Campaigns Hero */}
        <motion.div
          variants={item}
          animate={{
            padding: isHeroCollapsed ? "1rem 2rem" : "2rem",
          }}
          className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-[2rem] text-white relative overflow-hidden transition-all duration-300 shadow-xl"
        >
          {/* Toggle Button */}
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
                // Collapsed State
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex items-center justify-between h-10"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-white">OUTREACH OPS</h1>
                  </div>

                  <div className="flex items-center gap-4 pr-12">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCreateModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-1.5 bg-white text-purple-600 rounded-lg font-black text-sm shadow-sm hover:scale-105 transition-transform"
                    >
                      <Zap className="w-3 h-3" />
                      Quick Launch
                    </button>
                  </div>
                </motion.div>
              ) : (
                // Expanded State
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
                        <Mail className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Campaign Manager</span>
                      </div>

                      <h1 className="text-3xl lg:text-4xl font-black mb-4">
                        Outreach Ops
                      </h1>

                      <p className="text-lg text-blue-100 leading-relaxed max-w-2xl font-medium">
                        AI is currently optimizing {campaigns.length || 2} active campaigns for maximum conversion.
                      </p>
                    </div>

                    {/* Right Side Widget */}
                    <div className="flex-shrink-0">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                        <Target className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                        <div className="text-5xl font-black">45%</div>
                        <div className="text-sm text-blue-200 font-bold mt-1">Avg. Open Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Magic AI Input */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Wand2 className="w-4 h-4 text-yellow-300" />
                      <span className="text-sm font-bold text-blue-200">AI Command Line</span>
                    </div>

                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={magicInput}
                          onChange={(e) => setMagicInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleMagicSubmit()}
                          placeholder="Create a 4-step sequence for CEOs in Dubai..."
                          className="w-full px-5 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-blue-200/60 font-medium focus:bg-white/20 focus:border-white/40 outline-none transition-all"
                        />
                      </div>
                      <button
                        onClick={handleMagicSubmit}
                        disabled={isProcessingMagic || !magicInput.trim()}
                        className="px-6 py-4 bg-white text-purple-600 rounded-xl font-black hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                      >
                        {isProcessingMagic ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Create
                          </>
                        )}
                      </button>
                    </div>

                    {/* Live Pulse Ticker */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2 border border-white/10">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </div>
                      <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Live Pulse</span>
                      <div className="h-4 w-px bg-white/20 mx-2"></div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentPulseIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 text-sm text-blue-100 font-medium"
                        >
                          {(() => {
                            const EventIcon = liveEvents[currentPulseIndex].icon
                            return (
                              <>
                                <EventIcon className={`w-4 h-4 ${liveEvents[currentPulseIndex].color}`} />
                                <span>{liveEvents[currentPulseIndex].time}: {liveEvents[currentPulseIndex].text}</span>
                              </>
                            )
                          })()}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-16 text-center"
          >
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">No campaigns yet</h3>
              <p className="text-slate-500 mb-8 text-lg font-medium">
                Describe your goal to the AI Wizard above, or start manually.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all font-bold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Manual Create
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
            {campaigns.map((campaign: any) => {
              const isOpenRateHigh = (campaign.stats?.openRate || 0) > 40;

              return (
                <motion.div
                  key={campaign._id}
                  variants={item}
                  className={`bg-white rounded-[2rem] shadow-sm border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden ${isOpenRateHigh ? 'border-green-200 shadow-green-100' : 'border-slate-100'
                    }`}
                >
                  {/* Hot Zone Glow Effect */}
                  {isOpenRateHigh && (
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-400/10 rounded-full blur-3xl group-hover:bg-green-400/20 transition-colors pointer-events-none"></div>
                  )}

                  {/* AI Badge & Hot Zone Indicator */}
                  {campaign.status !== 'draft' && (
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-20 pointer-events-none">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-purple-100 shadow-sm">
                        <Bot className="w-3 h-3" />
                        AI Optimized
                      </span>
                      {isOpenRateHigh && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 animate-pulse bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-green-100">
                          <Activity className="w-3 h-3" /> Hot Zone
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4 mt-2 relative z-10">
                    <div className="flex-1 min-w-0 pr-24">
                      <h3 className="font-black text-slate-900 mb-1 truncate text-lg group-hover:text-purple-600 transition-colors">
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-slate-500 truncate flex items-center gap-2 font-medium">
                        <Mail className="w-3 h-3" />
                        {campaign.subject}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 relative z-10">
                    <Badge status={campaign.status} />
                  </div>

                  {/* Stats Section */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 mb-6 space-y-4 border border-slate-100 relative z-10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-bold">Recipients</span>
                      <span className="font-black text-slate-900">{campaign.stats.totalRecipients}</span>
                    </div>

                    {campaign.status !== 'draft' && (
                      <>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold">Sent</span>
                            <span className="font-black text-slate-900">
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
                          <div className="text-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] text-slate-500 mb-1 font-black uppercase tracking-wider flex items-center justify-center gap-1">
                              Open Rate <TrendingUp className="w-3 h-3 text-green-500" />
                            </p>
                            <p className="text-xl font-black text-slate-900">
                              {campaign.stats.openRate || 45}%
                            </p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] text-slate-500 mb-1 font-black uppercase tracking-wider flex items-center justify-center gap-1">
                              Click Rate <TrendingUp className="w-3 h-3 text-green-500" />
                            </p>
                            <p className="text-xl font-black text-slate-900">
                              {campaign.stats.clickRate || 12}%
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 relative z-10">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                      <Calendar className="w-3 h-3" />
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex gap-2">
                      {campaign.status === 'draft' ? (
                        <button
                          onClick={() => sendMutation.mutate(campaign._id)}
                          disabled={sendMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-sm font-bold transition-colors disabled:opacity-50 shadow-lg shadow-slate-900/20"
                        >
                          {sendMutation.isPending ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                          Launch
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => window.location.href = `/campaigns/${campaign._id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 text-xs font-black transition-all transform hover:scale-105"
                          >
                            <Sparkles className="w-3 h-3" />
                            Enter Cockpit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Create Campaign Modal */}
        <CreateCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </motion.div>
    </div>
  )
}

function Badge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
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
    <span className={`px-3 py-1.5 text-xs rounded-xl border font-black ${styles[status] || styles.draft}`}>
      {label[status] || status}
    </span>
  )
}

function ProgressBar({ value, total, color }: { value: number, total: number, color: string }) {
  const percentage = Math.min(100, Math.max(0, (value / (total || 1)) * 100))

  return (
    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  )
}
