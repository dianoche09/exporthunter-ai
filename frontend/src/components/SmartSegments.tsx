
import { Sparkles, TrendingUp, Radar, Zap, Target, Crown, Globe, Briefcase, Flame, CheckCircle2, Clock, AlertTriangle, MessageSquare, Ship, DollarSign, Calendar, Info, X, ChevronRight, Rocket, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'

interface SmartSegmentsProps {
    leads: any[]
    onSelectSegment: (segment: any) => void
    onStartCampaign: (leads: any[]) => void
}

export default function SmartSegments({ leads, onSelectSegment, onStartCampaign }: SmartSegmentsProps) {
    const [selectedCluster, setSelectedCluster] = useState<any>(null);

    const segments = useMemo(() => {
        const segs: any[] = [];
        if (!leads || leads.length === 0) return segs;

        // 1. High Potential (Crown)
        const highPotential = leads.filter(l => l.aiScore >= 80);
        if (highPotential.length > 0) {
            segs.push({
                id: 'high-potential',
                title: 'High Potential',
                subtitle: 'Match Score 80+',
                count: highPotential.length,
                icon: Crown,
                colorTheme: 'purple',
                data: highPotential,
                type: 'opportunity',
                insight: "These companies represent your best mathematical matches. Their supply chain needs align over 90% with your current export capacity.",
                volume: "$2.4M",
                score: 88
            });
        }

        // 2. High Intent (Flame) - Mock logic for demo
        const highIntent = leads.slice(0, 5); // Just pick first 5 as high intent for demo
        segs.push({
            id: 'high-intent',
            title: 'High Intent',
            subtitle: 'Buying Signals',
            count: highIntent.length,
            icon: Flame,
            colorTheme: 'orange',
            data: highIntent,
            type: 'opportunity',
            insight: "Detected multiple visits to your 'Pricing' and 'Technical Specs' pages from these companies in the last 24 hours. They are in the final comparison stage.",
            volume: "$850K",
            score: 94
        });

        // 3. Competitor Gap (Alert)
        const competitorGap = leads.slice(5, 8);
        segs.push({
            id: 'competitor-gap',
            title: 'Competitor Gap',
            subtitle: 'Supply Alert',
            count: competitorGap.length,
            icon: AlertTriangle,
            colorTheme: 'red',
            data: competitorGap,
            type: 'alert',
            insight: "Main competitor 'Generic Corp' is facing 4-week shipping delays in Europe. These 8 customers are actively looking for reliable alternatives with faster delivery.",
            volume: "$1.2M",
            score: 91
        });

        // 4. Country Surge (Globe)
        const indiaLeads = leads.filter(l => l.country === 'India');
        if (indiaLeads.length > 0) {
            segs.push({
                id: 'india-surge',
                title: 'India Surge',
                subtitle: 'Market Demand',
                count: indiaLeads.length,
                icon: Globe,
                colorTheme: 'emerald',
                data: indiaLeads,
                type: 'info',
                insight: "RDP demand in India's construction sector grew by 8.4% last month. Local manufacturers are struggling to meet the new sustainability requirements you fulfill.",
                volume: "$3.1M",
                score: 82
            });
        }

        // 5. Event Based (Calendar)
        const dubaiLeads = leads.slice(8, 11);
        segs.push({
            id: 'event-leads',
            title: 'Dubai Big5',
            subtitle: 'Fuar Katılımcıları',
            count: dubaiLeads.length,
            icon: Calendar,
            colorTheme: 'indigo',
            data: dubaiLeads,
            type: 'info',
            insight: "These 12 prospects are confirmed attendees for the upcoming Dubai Big5 Trade Show. Perfect timing for pre-event outreach or meeting requests.",
            volume: "$500K",
            score: 78
        });

        return segs;
    }, [leads]);

    const themes: Record<string, any> = {
        purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-200', accent: 'bg-purple-500' },
        orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-200', accent: 'bg-orange-500' },
        red: { bg: 'bg-red-50', hover: 'hover:bg-red-100', border: 'border-red-200', text: 'text-red-700', iconBg: 'bg-red-200', accent: 'bg-red-500' },
        emerald: { bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-200', accent: 'bg-emerald-500' },
        indigo: { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-700', iconBg: 'bg-indigo-200', accent: 'bg-indigo-500' },
    }

    if (segments.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Smart Clusters</h3>
            </div>

            {/* Horizontal Scroll Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 no-scrollbar">
                {segments.map((segment, index) => {
                    const theme = themes[segment.colorTheme] || themes.purple;
                    const Icon = segment.icon;

                    return (
                        <motion.button
                            key={segment.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedCluster(segment)}
                            className={`flex-shrink-0 flex flex-col gap-3 p-5 rounded-[2rem] border-2 ${theme.bg} ${theme.border} ${theme.hover} transition-all w-[260px] text-left group shadow-sm relative overflow-hidden`}
                        >
                            {/* Accent line */}
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${theme.accent} opacity-60`} />

                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-2xl ${theme.iconBg} group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-5 h-5 ${theme.text}`} />
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-slate-700 border border-white/50">
                                    {segment.count} LEADS
                                </div>
                            </div>

                            <div className="mt-2">
                                <div className={`text-xs font-black ${theme.text} uppercase tracking-wider mb-0.5`}>
                                    {segment.title}
                                </div>
                                <div className="text-sm text-slate-900 font-extrabold leading-tight">
                                    {segment.subtitle}
                                </div>
                                <div className="mt-2 text-[10px] text-slate-500 font-medium line-clamp-2">
                                    {segment.insight}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* AI Insight Modal */}
            <AnimatePresence>
                {selectedCluster && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCluster(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10"
                        >
                            {/* Modal Header */}
                            <div className={`p-8 pb-6 bg-gradient-to-br ${themes[selectedCluster.colorTheme].bg} border-b border-slate-100`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${themes[selectedCluster.colorTheme].iconBg}`}>
                                            <selectedCluster.icon className={`w-8 h-8 ${themes[selectedCluster.colorTheme].text}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${themes[selectedCluster.colorTheme].bg} ${themes[selectedCluster.colorTheme].text} border ${themes[selectedCluster.colorTheme].border}`}>
                                                    AI CLUSTER
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900 mt-1">{selectedCluster.title}</h2>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCluster(null)}
                                        className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Bot className="w-4 h-4 text-blue-600" />
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">The "Why" - AI Analyst View</label>
                                    </div>
                                    <p className="text-lg font-bold text-slate-800 leading-relaxed">
                                        "{selectedCluster.insight}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Potential Volume</div>
                                        <div className="text-2xl font-black text-slate-900">{selectedCluster.volume}</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Match Score</div>
                                        <div className="text-2xl font-black text-emerald-600">{selectedCluster.score}%</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => {
                                            onSelectSegment(selectedCluster);
                                            setSelectedCluster(null);
                                        }}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg"
                                    >
                                        <Filter className="w-5 h-5" />
                                        Filter & View {selectedCluster.count} Leads
                                    </button>
                                    <button
                                        onClick={() => {
                                            onStartCampaign(selectedCluster.data);
                                            setSelectedCluster(null);
                                        }}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg"
                                    >
                                        <Rocket className="w-5 h-5" />
                                        Start Target Campaign
                                    </button>
                                    <button
                                        onClick={() => setSelectedCluster(null)}
                                        className="w-full py-4 bg-white text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all border border-slate-200"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function Bot({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V4M12 4L9 7M12 4L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="5" y="8" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="9" cy="14" r="1.5" fill="currentColor" />
            <circle cx="15" cy="14" r="1.5" fill="currentColor" />
        </svg>
    )
}
