import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Globe, ShieldCheck, Activity, Zap, Play, Pause,
    MessageCircle, GitBranch, TestTube, Users, MousePointer2,
    Mail, Clock, CheckCircle2, ChevronRight, AlertTriangle, Send, Bot,
    Sparkles, Search, MoreVertical, ThumbsUp, ThumbsDown
} from 'lucide-react'

// Mock Data
const campaignData = {
    id: '1',
    name: 'CEO Outreach - Dubai Expansion',
    status: 'active',
    health: 98,
    currentRegion: 'USA (East Coast)',
    currentTime: '09:42 AM',
    stats: {
        sent: 1240,
        openRate: 68,
        replyRate: 12,
        meetings: 8
    }
}

export default function CampaignDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'flow' | 'inbox' | 'lab'>('flow')

    return (
        <div className="p-8 max-w-[1600px] mx-auto bg-slate-50 min-h-screen font-outfit">
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-purple-200/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl opacity-30"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 space-y-8"
            >
                {/* Navigation */}
                <button
                    onClick={() => navigate('/campaigns')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Campaigns
                </button>

                {/* Cockpit Header - The "Orchestra Conductor" View */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white/50 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>

                    <div className="flex flex-col xl:flex-row gap-8 justify-between items-start xl:items-center">
                        {/* Title & Timezone Status */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Active Orchestration
                                </span>
                                <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                                    <Clock className="w-4 h-4" /> Started 2 days ago
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2">{campaignData.name}</h1>
                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                                Targeting <span className="text-blue-600 font-bold">Manufacturing CEOs</span> in <span className="text-blue-600 font-bold">Dubai & DACH</span>
                            </div>
                        </div>

                        {/* Secret Sauce Widgets - The "Breaking" Features */}
                        <div className="flex flex-wrap gap-4 w-full xl:w-auto">

                            {/* 1. Smart Timezone Map */}
                            <div className="flex-1 min-w-[280px] bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                                {/* World Map Background Effect */}
                                <div className="absolute inset-0 opacity-20">
                                    <Globe className="w-32 h-32 absolute -right-4 -bottom-8 text-blue-500" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                                            <Globe className="w-3 h-3" /> Time Traveler Mode
                                        </span>
                                        <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse"></span>
                                    </div>
                                    <div className="text-2xl font-black mb-1">Warning Up...</div>
                                    <div className="text-xs text-slate-400 font-medium leading-relaxed">
                                        Sending to <span className="text-white font-bold">{campaignData.currentRegion}</span>.
                                        <br />
                                        Waiting for Tokyo to wake up (3h left).
                                    </div>
                                </div>
                            </div>

                            {/* 2. Domain Health Guard */}
                            <div className="flex-1 min-w-[240px] bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> AI Bodyguard
                                    </span>
                                    <Activity className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="flex items-end gap-2 mb-1">
                                    <span className="text-4xl font-black text-slate-900">{campaignData.health}%</span>
                                    <span className="text-sm font-bold text-green-600 mb-1">Excellent</span>
                                </div>
                                <div className="text-xs text-slate-500 font-medium">
                                    IP reputation is stable.
                                    <br />
                                    <span className="text-blue-600 cursor-pointer hover:underline">View Delivery Report</span>
                                </div>

                                {/* Decorative Heartbeat Line */}
                                <svg className="absolute bottom-0 left-0 w-full h-8 text-green-100/50" viewBox="0 0 100 20" preserveAspectRatio="none">
                                    <path d="M0 10 Q10 10 15 5 T25 15 T35 5 T45 15 T100 10" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>

                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-1 mt-8 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
                        <TabButton
                            active={activeTab === 'flow'}
                            onClick={() => setActiveTab('flow')}
                            icon={GitBranch}
                            label="AI Omni-Flow"
                        />
                        <TabButton
                            active={activeTab === 'inbox'}
                            onClick={() => setActiveTab('inbox')}
                            icon={MessageCircle}
                            label="Smart Inbox"
                            badge={3}
                        />
                        <TabButton
                            active={activeTab === 'lab'}
                            onClick={() => setActiveTab('lab')}
                            icon={TestTube}
                            label="A/B/Z Lab"
                            badge="New"
                        />
                    </div>
                </div>

                {/* Tab Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'flow' && <FlowView />}
                        {activeTab === 'inbox' && <InboxView />}
                        {activeTab === 'lab' && <LabView />}
                    </motion.div>
                </AnimatePresence>

            </motion.div>
        </div>
    )
}

// --- Sub-Components ---

function TabButton({ active, onClick, icon: Icon, label, badge }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-200 ${active
                ? 'bg-white text-blue-600 shadow-md transform scale-105 ring-1 ring-black/5'
                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
            {badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge === 'New' ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {badge}
                </span>
            )}
        </button>
    )
}

function FlowView() {
    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-8 relative">
                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-100"></div>

                    {/* Step 1 */}
                    <TimelineStep
                        icon={Mail}
                        title="Initial Outreach"
                        time="Day 1"
                        status="completed"
                        description="AI generated 1,204 unique variations based on LinkedIn profiles."
                        stats={{ sent: 1240, open: '68%' }}
                    />

                    {/* Step 2 */}
                    <TimelineStep
                        icon={Clock}
                        title="Smart Wait"
                        time="2 Days"
                        status="active"
                        description="Waiting for optimal engagement window."
                        isWait
                    />

                    {/* Step 3 - Omni Channel (LinkedIn) */}
                    <TimelineStep
                        icon={Globe}
                        title="LinkedIn Visit"
                        time="Day 3"
                        status="upcoming"
                        description="AI will visit profiles to trigger notification."
                        tag="Omni-Channel"
                        customColor="text-[#0077B5] bg-[#0077B5]/10 border-[#0077B5]/20"
                        customIconColor="text-[#0077B5]"
                    />

                    {/* Step 4 */}
                    <TimelineStep
                        icon={Mail}
                        title="Value Proposition"
                        time="Day 4"
                        status="upcoming"
                        description="Follow-up with customized case studies."
                    />
                </div>

                <div className="w-full lg:w-96 bg-slate-50 rounded-2xl p-6 border border-slate-100 h-fit sticky top-8">
                    <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Hyper-Personalization
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                        See how AI adapts the message for different leads.
                    </p>

                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">AH</div>
                                <div>
                                    <div className="font-bold text-slate-900 text-sm">To: Ahmet H.</div>
                                    <div className="text-xs text-slate-400">CEO @ TechTr</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 italic">
                                "I saw your recent post about <b>AI expansion</b> on LinkedIn..."
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">SJ</div>
                                <div>
                                    <div className="font-bold text-slate-900 text-sm">To: Sarah J.</div>
                                    <div className="text-xs text-slate-400">Director @ BerlinAuto</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 italic">
                                "Considering <b>BerlinAuto's quarterly growth</b>, I believe..."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TimelineStep({ icon: Icon, title, time, status, description, stats, isWait, tag, customColor, customIconColor }: any) {
    const isCompleted = status === 'completed'
    const isActive = status === 'active'

    // Determine colors based on status or custom override
    let containerClass = isCompleted ? 'bg-green-100 text-green-600' :
        isActive ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-100 text-slate-400'

    if (customColor && !isActive && !isCompleted) {
        containerClass = customColor
    }

    return (
        <div className={`relative flex gap-6 group ${status === 'upcoming' && !customColor ? 'opacity-60' : ''}`}>
            <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${containerClass}`}>
                <Icon className={`w-5 h-5 ${customIconColor || ''}`} />
                {isActive && (
                    <span className="absolute -right-1 -top-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </div>

            <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-black text-lg ${customIconColor ? 'text-slate-900 group-hover:text-[#0077B5] transition-colors' : 'text-slate-900'}`}>{title}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">{time}</span>
                    {tag && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1 ${customColor ? 'bg-[#0077B5]/10 text-[#0077B5]' : 'bg-indigo-100 text-indigo-600'}`}>
                            {customColor ? <Globe className="w-3 h-3" /> : <Zap className="w-3 h-3" />} {tag}
                        </span>
                    )}
                </div>
                <p className="text-slate-500 font-medium mb-3 max-w-lg">{description}</p>

                {stats && (
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg">
                            <Send className="w-3 h-3 text-slate-400" /> {stats.sent}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                            <MousePointer2 className="w-3 h-3" /> {stats.open} Open
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function InboxView() {
    const conversations = [
        { id: 1, name: "Michael Chen", company: "TechFlow", time: "2m", msg: "The pricing looks good, but can we...", status: "Negotiating", color: "bg-blue-100 text-blue-700", active: true },
        { id: 2, name: "Sarah Miller", company: "BerlinAuto", time: "1h", msg: "Let's schedule the demo for...", status: "Closing", color: "bg-purple-100 text-purple-700", active: false },
        { id: 3, name: "Ahmed Yilmaz", company: "GlobalTrade", time: "3h", msg: "Can you send the case studies?", status: "Interested", color: "bg-green-100 text-green-700", active: false },
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
            {/* Conversation List */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-black text-slate-900 text-lg mb-4">Unified Inbox</h3>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {conversations.map((conv) => (
                        <div key={conv.id} className={`p-4 rounded-xl cursor-pointer transition-colors ${conv.active ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <span className="font-bold text-slate-900 block">{conv.name}</span>
                                    <span className="text-xs text-slate-500 font-medium">{conv.company}</span>
                                </div>
                                <span className="text-xs text-slate-400">{conv.time}</span>
                            </div>
                            <p className="text-sm text-slate-600 truncate mb-2">{conv.msg}</p>
                            <div className="flex gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${conv.color}`}>
                                    <ThumbsUp className="w-3 h-3" /> {conv.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">MC</div>
                        <div>
                            <h3 className="font-black text-slate-900">Michael Chen</h3>
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online - Negotiating
                            </span>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50/50">
                    <div className="flex justify-end">
                        <div className="bg-blue-600 text-white max-w-md p-4 rounded-2xl rounded-tr-none shadow-md">
                            <p className="text-sm">Hi Michael, I've reviewed your requirements for the custom API integration.</p>
                        </div>
                    </div>
                    <div className="flex justify-start">
                        <div className="bg-white text-slate-800 max-w-md p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                            <p className="text-sm">The pricing looks good, but can we split the implementation fee into two milestones? That would help with our budget approval this quarter.</p>
                        </div>
                    </div>

                    {/* AI Copilot Suggestions */}
                    <div className="flex flex-col gap-2 items-center pt-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
                            <Bot className="w-3 h-3" /> AI Copilot Suggestions
                        </div>
                        <div className="flex gap-3 flex-wrap justify-center">
                            <button className="px-4 py-2 bg-white border border-purple-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:bg-purple-50 transition-all flex items-center gap-2">
                                <Send className="w-3 h-3 text-purple-500" /> Draft: Accept Milestone Split
                            </button>
                            <button className="px-4 py-2 bg-white border border-purple-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:bg-purple-50 transition-all flex items-center gap-2">
                                <Clock className="w-3 h-3 text-purple-500" /> Draft: propose 50/50 Terms
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type a message or use /ai for draft..."
                            className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        <button className="absolute right-3 top-3 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LabView() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                        <TestTube className="w-5 h-5 text-pink-500" />
                        A/B/Z Testing
                    </h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black">Running</span>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-slate-700">Subject A: "Quick question..."</span>
                            <span className="text-sm font-black text-slate-900">22% Open</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-300 w-[22%] rounded-full"></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-purple-700">Subject B: "Partnership for [Company]?"</span>
                            <span className="text-sm font-black text-purple-700 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> 45% Open
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[45%] rounded-full relative">
                                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-4 mt-6">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Zap className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1">AI Recommendation</h4>
                            <p className="text-xs text-slate-600 mb-3">
                                Variation B is performing <b>2x better</b>. Should I route 100% traffic to B?
                            </p>
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors">
                                Apply Autonomous Optimization
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50"></div>
                <div className="relative z-10">
                    <h3 className="font-black text-xl mb-6">Optimization Insights</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <Globe className="w-6 h-6 text-blue-400" />
                            <div>
                                <div className="font-bold mb-1">Best Region</div>
                                <div className="text-sm text-slate-300">Dubai response rate is <span className="text-green-400 font-bold">+15%</span> higher than Global Avg.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <Clock className="w-6 h-6 text-yellow-400" />
                            <div>
                                <div className="font-bold mb-1">Best Time</div>
                                <div className="text-sm text-slate-300">Sending at <b>10:00 AM Local Time</b> yields highest opens.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
