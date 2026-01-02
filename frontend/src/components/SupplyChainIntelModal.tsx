
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Ship, Factory, Globe, ArrowRight, Sparkles,
    ChevronDown, Zap, Shield, Package, Building2,
    AlertTriangle, Clock, Mail, Copy, Check
} from 'lucide-react';
import { leadsAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

interface SupplyChainIntelModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any;
}

const ADVANTAGES = [
    { id: 'Faster Delivery', label: '🚀 Faster Delivery' },
    { id: 'Higher Quality', label: '🛡️ Higher Quality' },
    { id: 'Flexible MOQ', label: '📦 Flexible MOQ' },
    { id: 'Manufacturer Direct', label: '🏭 Manufacturer Direct' }
];

const PAIN_POINTS = [
    { id: 'Long Lead Times', label: 'Long Lead Times' },
    { id: 'Supply Chain Risk', label: 'Supply Chain Risk' },
    { id: 'Quality Consistency', label: 'Quality Consistency' },
    { id: 'High Inventory Costs', label: 'High Inventory Costs' }
];

export default function SupplyChainIntelModal({ isOpen, onClose, lead }: SupplyChainIntelModalProps) {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [intel, setIntel] = useState<any>(null);
    const [userTransitTime, setUserTransitTime] = useState(12);
    const [selectedAdvantage, setSelectedAdvantage] = useState('Faster Delivery');
    const [selectedPainPoint, setSelectedPainPoint] = useState('High Inventory Costs');
    const [generatedPitch, setGeneratedPitch] = useState<{ subject: string; body: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && lead) {
            fetchIntel();
        }
    }, [isOpen, lead]);

    const fetchIntel = async () => {
        try {
            setLoading(true);
            const response: any = await leadsAPI.getSupplyChainIntel(lead._id);
            if (response.success && response.data?.competitor) {
                setIntel(response.data);
                setUserTransitTime(response.data.user?.transit_time_days || 12);
                setSelectedAdvantage(response.data.user?.suggested_strategy || 'Faster Delivery');
                setSelectedPainPoint(response.data.competitor?.likely_pain_point || 'Supply Chain Risk');
            } else {
                toast.error('AI analysis was incomplete. Please configure manually.');
                setIntel({ competitor: { name: 'Competitor', transit_time_days: 45 }, user: { origin_country: 'Turkey', transit_time_days: 12 } });
            }
        } catch (error) {
            console.error('Failed to fetch intel:', error);
            toast.error('Could not analyze supply chain patterns.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePitch = async () => {
        try {
            setGenerating(true);
            const response: any = await aiAPI.generatePitch({
                lead_name: lead.companyName,
                lead_country: lead.country,
                user_strategy: selectedAdvantage,
                target_pain_point: selectedPainPoint,
                time_difference: `We deliver in ${userTransitTime} days vs Competitor ${intel?.competitor?.transit_time_days || 45} days`,
                product: lead.industry || 'Products',
                lead_reasoning: lead.aiReasoning,
                lead_products: lead.potentialProducts
            });
            if (response.success) {
                setGeneratedPitch(response.data);
            }
        } catch (error) {
            toast.error('Failed to generate AI pitch.');
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedPitch) return;
        const text = `Subject: ${generatedPitch.subject}\n\n${generatedPitch.body}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Pitch copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Globe className="w-5 h-5 text-blue-600" />
                                <h2 className="text-2xl font-black text-slate-900">Supply Chain Intelligence</h2>
                            </div>
                            <p className="text-slate-500 font-bold">Strategy-led market positioning for {lead.companyName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-all shadow-sm border border-slate-200"
                        >
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-slate-500 font-bold">AI Analyst is scanning global routes...</p>
                            </div>
                        ) : (
                            <>
                                {/* BLOK A: Lojistik Görselleştirme */}
                                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Ship className="w-32 h-32" />
                                    </div>

                                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-8">Logistics Visualization</h3>

                                    <div className="relative flex items-center justify-between gap-4">
                                        {/* Competitor Route */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                                                    <Factory className="w-6 h-6 text-red-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Dominant Competitor</p>
                                                    <p className="font-black text-lg">{intel?.competitor?.name || 'Loading...'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1 bg-red-500/30 rounded-full flex-1 relative">
                                                    <div className="absolute inset-0 bg-red-500 w-full rounded-full opacity-50 blur-[1px]" />
                                                </div>
                                                <span className="text-xs font-black text-red-400 uppercase whitespace-nowrap">~{intel?.competitor?.transit_time_days || 45} Days</span>
                                            </div>
                                        </div>

                                        {/* Center Icon */}
                                        <div className="flex flex-col items-center gap-2 px-8">
                                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">To {lead.country}</span>
                                        </div>

                                        {/* Your Route */}
                                        <div className="flex-1 text-right">
                                            <div className="flex items-center gap-3 mb-4 justify-end">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Your Shipment</p>
                                                    <p className="font-black text-lg">{intel?.user?.origin_country || 'Turkey'}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                                                    <Ship className="w-6 h-6 text-emerald-500" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-row-reverse">
                                                <div className="h-1 bg-emerald-500/30 rounded-full flex-1 relative">
                                                    <div className="absolute inset-x-0 bottom-0 bg-emerald-500 w-[70%] ml-auto rounded-full" />
                                                </div>
                                                <span className="text-xs font-black text-emerald-400 uppercase whitespace-nowrap">~{userTransitTime} Days</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Efficiency Message */}
                                    <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        <p className="text-sm font-medium text-slate-300">
                                            Turkey is <span className="text-white font-black">{Math.round((intel?.competitor?.transit_time_days || 45) / userTransitTime)}x faster</span> than {intel?.competitor?.name || 'the competitor'} in reaching {lead.country}. This is your primary leverage.
                                        </p>
                                    </div>
                                </div>

                                {/* BLOK B: Strateji Matrisi */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Strategy Comparison Matrix</h3>

                                    <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Factor</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-red-500 uppercase tracking-widest">{intel?.competitor?.name || 'Competitor'}</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">You (Turkey)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {/* Transit Time */}
                                                <tr className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                            <span className="font-bold text-slate-700">Transit Time</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-slate-500 font-bold">{intel?.competitor?.transit_time_days || 45} Days</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <input
                                                            type="number"
                                                            value={userTransitTime}
                                                            onChange={(e) => setUserTransitTime(Number(e.target.value))}
                                                            className="w-24 px-4 py-2 bg-emerald-50 text-emerald-700 font-black rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-200 outline-none"
                                                        />
                                                    </td>
                                                </tr>

                                                <tr className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="w-4 h-4 text-slate-400" />
                                                            <span className="font-bold text-slate-700">Your Key Advantage</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-slate-300 font-medium">—</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="relative group/select">
                                                            <select
                                                                value={selectedAdvantage}
                                                                onChange={(e) => setSelectedAdvantage(e.target.value)}
                                                                className="w-full appearance-none bg-blue-50 text-blue-800 font-black px-4 py-2.5 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-200 outline-none pr-10 cursor-pointer"
                                                            >
                                                                {ADVANTAGES.map(adv => (
                                                                    <option key={adv.id} value={adv.id}>{adv.label}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Target Pain Point */}
                                                <tr className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className="w-4 h-4 text-slate-400" />
                                                            <span className="font-bold text-slate-700">Target Pain Point</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="relative group/select">
                                                            <select
                                                                value={selectedPainPoint}
                                                                onChange={(e) => setSelectedPainPoint(e.target.value)}
                                                                className="w-full appearance-none bg-red-50 text-red-800 font-black px-4 py-2.5 rounded-xl border border-red-100 focus:ring-2 focus:ring-red-200 outline-none pr-10 cursor-pointer"
                                                            >
                                                                {PAIN_POINTS.map(pp => (
                                                                    <option key={pp.id} value={pp.id}>{pp.label}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 pointer-events-none" />
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-slate-300 font-medium">—</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* BLOK C: Aksiyon */}
                                <div className="pt-4">
                                    {!generatedPitch ? (
                                        <button
                                            onClick={handleGeneratePitch}
                                            disabled={generating}
                                            className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {generating ? (
                                                <>
                                                    <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                                    AI is crafting your strategy...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-6 h-6" />
                                                    Generate Pitch based on "{selectedAdvantage}"
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                                                        <Mail className="w-6 h-6 text-blue-400" />
                                                    </div>
                                                    <h4 className="text-xl font-black">AI Strategic Draft</h4>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={copyToClipboard}
                                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 flex items-center gap-2 font-bold text-sm"
                                                    >
                                                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                                        {copied ? 'Copied' : 'Copy'}
                                                    </button>
                                                    <button
                                                        onClick={() => setGeneratedPitch(null)}
                                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 font-bold text-sm"
                                                    >
                                                        Regenerate
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 font-medium text-slate-300 space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Subject Line</p>
                                                    <p className="text-white font-bold">{generatedPitch.subject}</p>
                                                </div>
                                                <div className="h-px bg-white/10 w-full" />
                                                <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                                                    {generatedPitch.body}
                                                </div>
                                            </div>

                                            <div className="mt-8 flex justify-center">
                                                <button
                                                    onClick={onClose}
                                                    className="px-12 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-blue-50 transition-all"
                                                >
                                                    Save Strategy & Finish
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
