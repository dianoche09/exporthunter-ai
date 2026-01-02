import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Eye, Clock, BarChart3, UploadCloud, MoreVertical, Flame,
    ArrowUpRight, Share2, Search, Filter, PieChart, Download, Trash2,
    MousePointer2, File, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SmartAssetsPage() {
    const [activeTab, setActiveTab] = useState<'library' | 'analytics'>('library');
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    // Mock Assets Data
    const assets = [
        {
            id: 1,
            name: "2025 Summer Collection Catalog.pdf",
            type: "Catalog",
            views: 1240,
            avgTime: "4m 12s",
            hotPage: 14,
            thumbnail: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&q=80",
            status: "Active",
            lastViewed: "2 mins ago by Siemens"
        },
        {
            id: 2,
            name: "Global Price List - Q1.pdf",
            type: "Pricing",
            views: 856,
            avgTime: "1m 45s",
            hotPage: 3,
            thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80",
            status: "Active",
            lastViewed: "1 hour ago by Walmart"
        },
        {
            id: 3,
            name: "Corporate Sustainability Report.pdf",
            type: "Report",
            views: 320,
            avgTime: "6m 30s",
            hotPage: 8,
            thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&q=80",
            status: "Archived",
            lastViewed: "2 days ago"
        },
        {
            id: 4,
            name: "Technical Specs - Series X.pdf",
            type: "Technical",
            views: 2100,
            avgTime: "8m 15s",
            hotPage: 22,
            thumbnail: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=500&q=80",
            status: "Active",
            lastViewed: "Just now"
        }
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto bg-slate-50 min-h-screen font-outfit">

            {/* 1. Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl mb-8"
            >
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 flex items-center gap-2">
                                <Eye className="w-3 h-3 text-cyan-300" /> Document Intelligence
                            </span>
                        </div>
                        <h1 className="text-4xl font-black mb-2">Smart Asset Library</h1>
                        <p className="text-indigo-100 font-medium max-w-2xl">
                            Upload your catalogs and price lists. We track who reads them, which pages they focus on, and when they are ready to buy.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="text-3xl font-black">4,516</div>
                            <div className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Total Views</div>
                        </div>
                        <button className="px-6 py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                            <UploadCloud className="w-5 h-5" /> Upload New Asset
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* 2. Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    icon={Eye} color="text-blue-500" bg="bg-blue-50"
                    label="Total Views" value="4,516" trend="+12%"
                />
                <StatsCard
                    icon={Clock} color="text-purple-500" bg="bg-purple-50"
                    label="Avg. Read Time" value="4m 12s" trend="+8%"
                />
                <StatsCard
                    icon={Flame} color="text-orange-500" bg="bg-orange-50"
                    label="Hot Leads" value="128" trend="+24%"
                    subtext="Viewing > 3 mins"
                />
                <StatsCard
                    icon={Share2} color="text-green-500" bg="bg-green-50"
                    label="Viral Factor" value="1.4x" trend="+2%"
                    subtext="Avg. shares per link"
                />
            </div>

            {/* 3. Assets Grid (Netflix Style) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* Asset Cards */}
                {assets.map((asset) => (
                    <motion.div
                        key={asset.id}
                        layoutId={`asset-${asset.id}`}
                        onClick={() => setSelectedAsset(asset)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="group bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                    >
                        {/* Thumbnail Image */}
                        <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                            <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                            {/* Status Badge */}
                            <div className="absolute top-4 left-4">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${asset.status === 'Active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                    }`}>
                                    {asset.status}
                                </span>
                            </div>

                            {/* Type Badge */}
                            <div className="absolute top-4 right-4">
                                <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[10px] font-bold border border-white/20">
                                    {asset.type}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-violet-600 transition-colors">
                                    {asset.name}
                                </h3>
                                <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl">
                                <div className="flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5 text-blue-500" /> {asset.views}
                                </div>
                                <div className="h-3 w-[1px] bg-slate-300"></div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-purple-500" /> {asset.avgTime}
                                </div>
                            </div>

                            {/* Hot Page Concept */}
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <Flame className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-slate-600">
                                    Hottest Page: <span className="font-bold text-slate-900">Pg {asset.hotPage}</span>
                                </span>
                            </div>

                            {/* Last Viewed Alert */}
                            {asset.lastViewed.includes("Just now") && (
                                <div className="mt-4 px-3 py-2 bg-green-50 border border-green-100 rounded-xl text-[10px] font-bold text-green-700 flex items-center gap-2 animate-pulse">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Someone is viewing right now
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Add New Placeholder */}
                <button className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50/50 transition-all group min-h-[340px]">
                    <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-white group-hover:shadow-lg flex items-center justify-center mb-4 transition-all">
                        <UploadCloud className="w-8 h-8 opacity-50 group-hover:opacity-100" />
                    </div>
                    <span className="font-bold">Upload New Asset</span>
                    <span className="text-xs mt-1 opacity-70">PDF, PPTX, DOCX</span>
                </button>
            </div>

            {/* Asset Detail Modal (Overlay) */}
            <AnimatePresence>
                {selectedAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAsset(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-5xl h-[80vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row"
                        >
                            {/* Left: Preview & Heatmap */}
                            <div className="flex-1 bg-slate-100 p-8 flex flex-col items-center justify-center relative">
                                <div className="bg-white shadow-2xl rounded-lg w-[400px] h-[560px] relative overflow-hidden group">
                                    {/* Fake Document Page */}
                                    <div className="p-8 space-y-6 opacity-50 group-hover:opacity-20 transition-opacity">
                                        <div className="h-8 w-3/4 bg-slate-200 rounded"></div>
                                        <div className="space-y-3">
                                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                                            <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
                                        </div>
                                        <div className="h-48 w-full bg-slate-200 rounded"></div>
                                    </div>

                                    {/* Heatmap Overlay */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="absolute top-[20%] left-[10%] w-[80%] h-[100px] bg-red-500/30 blur-xl"></div>
                                        <div className="absolute bottom-[30%] right-[10%] w-[40%] h-[80px] bg-blue-500/20 blur-xl"></div>

                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 text-white px-4 py-2 rounded-full text-xs font-bold pointer-events-none backdrop-blur-md border border-white/20">
                                            🔥 Hotspot: Pricing Table
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <p className="text-slate-500 font-bold bg-white/80 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm group-hover:opacity-0 transition-opacity">
                                            Hover to see Heatmap
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Analytics Panel */}
                            <div className="w-full md:w-96 bg-white border-l border-slate-100 p-8 overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-slate-900">Asset Analytics</h2>
                                    <button onClick={() => setSelectedAsset(null)} className="p-2 hover:bg-slate-100 rounded-full">
                                        <XIcon className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Asset</div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="font-bold text-slate-800 leading-tight">{selectedAsset.name}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100">
                                        <div className="text-violet-800 font-bold text-lg mb-1 flex items-center gap-2">
                                            <Flame className="w-5 h-5" /> High Intent Signal
                                        </div>
                                        <p className="text-xs text-violet-600 leading-relaxed">
                                            Clients who view <b>Page {selectedAsset.hotPage}</b> are <b>3x more likely</b> to purchase.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-4">Recent Viewers</h4>
                                        <div className="space-y-3">
                                            {[
                                                { copy: "Siemens AG", time: "2 mins ago", country: "DE" },
                                                { copy: "Walmart Inc", time: "1 hour ago", country: "US" },
                                                { copy: "Carrefour", time: "5 hours ago", country: "FR" },
                                            ].map((viewer, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                                                            {viewer.copy.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-sm">{viewer.copy}</div>
                                                            <div className="text-xs text-slate-400">{viewer.time}</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">{viewer.country}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2">
                                            <Share2 className="w-5 h-5" /> Generate Tracking Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}

function StatsCard({ icon: Icon, color, bg, label, value, trend, subtext }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600`}>
                    {trend}
                </span>
            </div>
            <div>
                <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
                <div className="text-sm font-bold text-slate-500">{label}</div>
                {subtext && <div className="text-xs text-slate-400 mt-2 font-medium">{subtext}</div>}
            </div>
        </div>
    )
}

function XIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
    )
}
