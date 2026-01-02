
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users, Mail, TrendingUp, MousePointer2, ArrowUpRight, ArrowDownRight,
  Sparkles, Rocket, AlertTriangle, Target, Send, Plus, Zap,
  MessageSquare, CheckCircle2, ChevronRight, Wand2, Bot, ArrowRight,
  ChevronUp, ChevronDown, Star
} from 'lucide-react'
import { api, dashboardAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'
import { useNavigate } from 'react-router-dom'

import AILeadDiscovery from '../components/AILeadDiscovery'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [showAIModal, setShowAIModal] = useState(false)
  const [liveStats, setLiveStats] = useState({ leads: 0, newOpportunity: false })
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(() => {
    const saved = localStorage.getItem('dashboardHeroCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboardHeroCollapsed', JSON.stringify(isHeroCollapsed))
  }, [isHeroCollapsed])

  // --- 1. Fetch Dashboard Stats ---
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardAPI.getStats
  })
  const stats = statsData?.data || null

  // --- 2. Fetch Daily Briefing (Real AI Data) ---
  const { data: briefingData, isLoading: briefingLoading } = useQuery({
    queryKey: ['dashboardBriefing'],
    queryFn: dashboardAPI.getBriefing
  })
  const aiBriefing = briefingData?.data

  // --- 3. Fetch AI Opportunities (Real Feed) ---
  const { data: opportunitiesData, isLoading: oppsLoading } = useQuery({
    queryKey: ['dashboardOpportunities'],
    queryFn: dashboardAPI.getOpportunities
  })
  const aiOpportunities = opportunitiesData?.data || []

  // --- 4. Fetch Chart Data ---
  const { data: chartDataData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboardChart'],
    queryFn: () => dashboardAPI.getAcquisitionChart('7d')
  })
  const chartData = chartDataData?.data || []

  // Global Loading State
  const isLoading = statsLoading || briefingLoading || oppsLoading || chartLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    )
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

  // Dynamic Icon Lookup Helper
  const getIcon = (iconName: string) => {
    const icons: any = { Search: Target, Zap: Zap, Target: Target, Plus: Plus, Rocket: Rocket, AlertTriangle: AlertTriangle, Sparkles: Sparkles, MessageSquare: MessageSquare, CheckCircle2: CheckCircle2, Send: Send }
    return icons[iconName] || Target
  }

  // Helper to map backend 'type' to frontend 'color' and 'icon' if needed
  // But OpportunityCard handles coloring logic based on 'type' ('hot', 'warning' etc is what we need to map to 'emerald', 'amber')
  // Backend Model: type: 'hot' | 'opportunity' | 'warning' | 'insight'
  // Frontend OpportunityCard expects: 'color' param.
  // We need to map Backend Type -> Frontend Color
  const mapOpportunityToCard = (opp: any) => {
    // If backend returns 'color', use it. Else map from type.
    if (opp.color) return opp;

    const typeMap: any = {
      'hot': 'emerald',
      'opportunity': 'blue',
      'warning': 'amber',
      'insight': 'purple'
    };

    const iconMap: any = {
      'hot': Rocket,
      'opportunity': Target,
      'warning': AlertTriangle,
      'insight': Sparkles
    };

    return {
      ...opp,
      color: typeMap[opp.type] || 'blue',
      icon: iconMap[opp.type] || Zap,
      // Ensure action object structure
      action: opp.action || { label: 'View', endpoint: '/leads' }
    }
  }

  return (
    <div className={`p-8 max-w-[1600px] mx-auto bg-slate-50 min-h-screen font-outfit transition-all duration-300`}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >

        {/* Collapsible AI Briefing Hero (Always Visible) */}
        <motion.div
          variants={item}
          animate={{
            padding: isHeroCollapsed ? "1rem 2rem" : "2rem",
          }}
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[2rem] text-white relative overflow-hidden transition-all duration-300 shadow-xl"
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
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-white">DAILY BRIEF</h1>
                  </div>

                  <div className="flex items-center gap-4 pr-12">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAIModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-1.5 bg-white text-blue-600 rounded-lg font-black text-sm shadow-sm hover:scale-105 transition-transform"
                    >
                      <Sparkles className="w-3 h-3" />
                      AI Discovery
                    </button>
                  </div>
                </motion.div>
              ) : (
                // Expanded State: Full Content
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1">
                      {/* AI Assistant Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">AI Daily Brief</span>
                      </div>

                      <h1 className="text-3xl lg:text-4xl font-black mb-4">
                        {aiBriefing?.greeting || "Welcome back, Hunter 👋"}
                      </h1>

                      <p className="text-lg text-blue-100 leading-relaxed max-w-2xl font-medium">
                        {aiBriefing?.summary || "Your campaign from yesterday exceeded 80% open rate. There are new high-potential opportunities waiting for review."}
                      </p>

                      {/* Action Buttons (Replaces Input) */}
                      <div className="flex flex-wrap gap-3 mt-6 relative z-20">
                        <button
                          onClick={() => navigate('/leads?open_wizard=true')}
                          className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-black hover:bg-blue-50 shadow-lg transition-transform hover:scale-105"
                        >
                          <Sparkles className="w-5 h-5" />
                          Start AI Discovery
                        </button>

                        <button
                          onClick={() => navigate('/leads?filter=new_opportunities')}
                          className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-xl font-bold transition-all hover:scale-105"
                        >
                          <Rocket className="w-5 h-5" />
                          Review {aiOpportunities.length > 0 ? aiOpportunities.length : '23'} Opportunities
                        </button>
                      </div>
                    </div>

                    {/* Highlight Metric Card */}
                    <button
                      onClick={() => navigate('/leads?filter=new_opportunities')}
                      className="flex-shrink-0 text-left hover:scale-105 transition-transform"
                    >
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center min-w-[200px] cursor-pointer hover:bg-white/15">
                        <div className="relative inline-block">
                          <Target className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                          </span>
                        </div>
                        <div className="text-5xl font-black text-white mb-1">
                          {aiOpportunities.length > 0 ? aiOpportunities.length : aiBriefing?.highlight?.metric || '23'}
                        </div>
                        <div className="text-sm text-blue-200 font-bold uppercase tracking-wide">
                          {aiOpportunities.length > 0 ? 'New Opportunities' : aiBriefing?.highlight?.label || 'New Leads'}
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Stats Grid with AI Forecasts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Leads"
            value={stats?.overview?.totalLeads || 0}
            change={`+${stats?.overview?.leadsGrowth || 0}%`}
            changeType="positive"
            color="blue"
            forecast={{ value: "+15", label: "expected this week" }}
            onClick={() => navigate('/leads')}
          />
          <StatCard
            icon={TrendingUp}
            label="Open Rate"
            value={`${stats?.overview?.openRate || 0}%`}
            change="+8% vs last week"
            changeType="positive"
            color="emerald"
            forecast={{ value: "85%", label: "end of day forecast" }}
            onClick={() => navigate('/campaigns?view=analytics')}
          />
          <StatCard
            icon={Mail}
            label="Active Campaigns"
            value={stats?.overview?.totalCampaigns || 0}
            change={`${stats?.overview?.emailsSent || 0} sent`}
            changeType="neutral"
            color="indigo"
            onClick={() => navigate('/campaigns?filter=status_running')}
          />
          <StatCard
            icon={MousePointer2}
            label="Click Rate"
            value={`${stats?.overview?.clickRate || 0}%`}
            change="+5.2% vs last week"
            changeType="positive"
            color="purple"
            forecast={{ value: "28%", label: "weekend forecast" }}
            onClick={() => navigate('/campaigns?view=analytics&metric=clicks')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart with AI Insights */}
          <motion.div
            variants={item}
            className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Lead Acquisition</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Weekly performance analysis</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/leads')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* AI Insight Banner - Dynamic if Backend supports it, otherwise static for now or from chart data */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl mb-6 border border-purple-100">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-sm text-slate-700 font-medium flex-1">
                <span className="font-black text-purple-600">AI Insight:</span> Tuesday's email campaign drove highest engagement (180% increase).
              </p>
              <button className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)', fontFamily: 'Outfit', padding: '12px', fontWeight: 600 }} />
                  <Area type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                  <Area type="monotone" dataKey="emails" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorEmails)" />
                  <ReferenceDot x="Tue" y={7} r={8} fill="#A855F7" stroke="#fff" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Opportunities Sidebar */}
          <motion.div
            variants={item}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-black text-slate-900">AI Opportunities</h3>
              </div>
              <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-black rounded-lg">
                {aiOpportunities.length} New
              </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] scrollbar-hide">
              {aiOpportunities.length > 0 ? (
                aiOpportunities.map((opp: any) => (
                  <OpportunityCard key={opp._id || opp.id} opportunity={mapOpportunityToCard(opp)} />
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-slate-900 font-bold mb-1">All Caught Up!</h3>
                  <p className="text-sm text-slate-500">No new opportunities at the moment. Great job!</p>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/leads')}
              className="mt-4 w-full py-3 bg-slate-50 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-100"
            >
              View All Opportunities
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detailed Status (Funnel) */}
          <motion.div variants={item} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Lead Status</h3>
              <button className="text-sm text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1">Detailed Analysis <ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              {Object.entries(stats?.leadsByStatus || { new: 0, contacted: 0, interested: 0, qualified: 0 }).map(([status, count]: any) => (
                <FunnelRow key={status} status={status} count={count} total={stats?.overview?.totalLeads || 1} />
              ))}
            </div>
          </motion.div>

          {/* AI Performance Summary */}
          <motion.div variants={item} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden">
            {/* Same as before */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm"><Star className="w-5 h-5 text-yellow-400" /></div>
                <h3 className="text-lg font-black">AI Performance Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10"><div className="text-3xl font-black">94%</div><div className="text-sm text-slate-400 font-medium">Match</div></div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10"><div className="text-3xl font-black">2.4x</div><div className="text-sm text-slate-400 font-medium">ROI</div></div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-sm text-emerald-100 font-medium">
                  This week you reached 8 new customers thanks to AI recommendations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <AILeadDiscovery
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onLeadsDiscovered={() => navigate('/leads')}
      />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, change, changeType, color, forecast, onClick }: any) {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100'
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      onClick={onClick}
      className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color]} border`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${changeType === 'positive' ? 'bg-emerald-50 text-emerald-600' :
            changeType === 'negative' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
            }`}>
            {changeType === 'positive' ? <ArrowUpRight className="w-3 h-3" /> :
              changeType === 'negative' ? <ArrowDownRight className="w-3 h-3" /> : null}
            {change}
          </div>
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        <p className="text-sm font-bold text-slate-500 mt-1">{label}</p>
      </div>

      {forecast && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span className="text-xs text-slate-500 font-medium">
            <span className="text-purple-600 font-bold">{forecast.value}</span> {forecast.label}
          </span>
        </div>
      )}
    </motion.div>
  )
}

function OpportunityCard({ opportunity }: { opportunity: any }) {
  const navigate = useNavigate()
  const colorStyles: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600'
  }

  const iconBgStyles: Record<string, string> = {
    emerald: 'bg-emerald-100',
    blue: 'bg-blue-100',
    amber: 'bg-amber-100',
    purple: 'bg-purple-100'
  }

  const buttonStyles: Record<string, string> = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white'
  }

  return (
    <motion.div
      initial={opportunity.isNew ? { opacity: 0, scale: 0.8, y: -20 } : false}
      animate={opportunity.isNew ? { opacity: 1, scale: 1, y: 0 } : false}
      transition={{ type: "spring", duration: 0.6 }}
      className={`p-4 rounded-2xl border ${colorStyles[opportunity.color]} transition-all hover:shadow-md cursor-pointer group relative ${opportunity.isNew ? 'ring-2 ring-purple-400 ring-offset-2 shadow-lg shadow-purple-200' : ''}`}
    >
      {/* NEW Badge Logic if needed - removed for simplicity if not in data, or use isNew prop */}

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${iconBgStyles[opportunity.color]} ${opportunity.isNew ? 'animate-bounce' : ''}`}>
          <opportunity.icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black uppercase tracking-wider mb-1">{opportunity.title}</div>
          <p className="text-sm font-medium text-slate-700 leading-snug">{opportunity.description}</p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const route = opportunity.action?.endpoint || opportunity.action?.route || opportunity.action?.href;
          if (route) navigate(route);
        }}
        className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${buttonStyles[opportunity.color]}`}
      >
        {opportunity.action.label}
      </button>
    </motion.div>
  )
}

function FunnelRow({ status, count, total }: { status: string; count: number; total: number }) {
  const percentage = Math.round((count / total) * 100)

  const statusStyles: Record<string, { bg: string; text: string; bar: string }> = {
    new: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
    contacted: { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' },
    interested: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
    qualified: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
    customer: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' }
  }

  const style = statusStyles[status] || statusStyles.new

  const labels: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    interested: 'Interested',
    qualified: 'Qualified',
    customer: 'Customer',
    rejected: 'Rejected'
  }

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={`font-bold ${style.text} capitalize flex items-center gap-2`}>
          <span className={`w-2 h-2 rounded-full ${style.bar}`}></span>
          {labels[status] || status}
        </span>
        <span className="font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg">{count}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${style.bar}`}
        />
      </div>
    </div>
  )
}
