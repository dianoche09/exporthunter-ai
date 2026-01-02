
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Plus, Calendar, Mail, Phone, MessageSquare, Clock, Globe } from 'lucide-react';

// Define loose interface to match existing code usage
interface KanbanBoardProps {
    leads: any[];
    onUpdateStatus: (leadId: string, newStatus: string) => void;
    onEditLead: (lead: any) => void;
}

const COLUMNS = [
    { id: 'new', title: 'New Leads', color: 'bg-blue-500', bg: 'bg-blue-50' },
    { id: 'contacted', title: 'Contacted', color: 'bg-yellow-500', bg: 'bg-yellow-50' },
    { id: 'interested', title: 'Interested', color: 'bg-purple-500', bg: 'bg-purple-50' },
    { id: 'qualified', title: 'Qualified', color: 'bg-green-500', bg: 'bg-green-50' },
    { id: 'customer', title: 'Customers', color: 'bg-emerald-600', bg: 'bg-emerald-50' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-500', bg: 'bg-red-50' }
];

export default function KanbanBoard({ leads, onUpdateStatus, onEditLead }: KanbanBoardProps) {

    const getColumnLeads = (status: string) => leads.filter(l => l.status === status);

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        e.dataTransfer.setData('leadId', leadId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        if (leadId) {
            onUpdateStatus(leadId, status);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    return (
        <div className="flex overflow-x-auto gap-4 pb-8 h-[calc(100vh-280px)] items-start pt-2 px-2">
            {COLUMNS.map(col => (
                <div
                    key={col.id}
                    className="min-w-[320px] flex-shrink-0 flex flex-col bg-slate-50/80 rounded-2xl border border-slate-200/60 max-h-full"
                    onDrop={(e) => handleDrop(e, col.id)}
                    onDragOver={handleDragOver}
                >
                    {/* Header */}
                    <div className="p-3 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${col.color} shadow-sm`} />
                            <span className="font-black text-slate-700 text-sm uppercase tracking-wide">{col.title}</span>
                            <span className="bg-white border border-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                                {getColumnLeads(col.id).length}
                            </span>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Cards Container */}
                    <div className="p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                        <AnimatePresence>
                            {getColumnLeads(col.id).map(lead => (
                                <motion.div
                                    key={lead._id}
                                    layoutId={lead._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e as any, lead._id)}
                                    onClick={() => onEditLead(lead)}
                                    className="bg-white p-3 rounded-xl border border-transparent shadow-sm hover:shadow-md hover:border-blue-200 cursor-grab active:cursor-grabbing group relative transition-all"
                                >
                                    {/* Card Top */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm leading-tight mb-0.5">{lead.companyName}</h4>
                                            {/* Status/Time indicator */}
                                            <div className="flex items-center gap-1">
                                                {lead.country && (
                                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                                                        <Globe className="w-2.5 h-2.5" />
                                                        {lead.country}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {lead.aiScore > 0 && (
                                            <div className={`
                             text-[10px] px-1.5 py-0.5 rounded font-black border
                             ${lead.aiScore >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    lead.aiScore >= 50 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-red-50 text-red-600 border-red-100'}
                         `}>
                                                {lead.aiScore}
                                            </div>
                                        )}
                                    </div>

                                    {/* Key Content */}
                                    <div className="space-y-2 mb-3">
                                        {/* Contact */}
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Mail className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{lead.email}</span>
                                        </div>

                                        {/* Next Step - Highlighted */}
                                        {lead.nextStep && (
                                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                    <Calendar className="w-3 h-3 text-blue-500" />
                                                    {lead.nextStep}
                                                </div>
                                                {lead.nextStepDate && (
                                                    <div className="ml-4.5 mt-0.5 text-[10px] text-slate-400 font-medium">
                                                        Due {new Date(lead.nextStepDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            {lead.tags?.slice(0, 2).map((tag: string, i: number) => (
                                                <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-[10px] text-slate-300 font-medium">
                                            {new Date(lead.updatedAt || lead.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Empty State visual */}
                        {getColumnLeads(col.id).length === 0 && (
                            <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                                <span className="text-xs text-slate-400 font-bold opacity-50">Empty</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
