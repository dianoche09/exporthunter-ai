import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bot, Mail, LogOut, ChevronLeft, ChevronRight, FileText, Radar, Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'
import { useSidebar } from '../contexts/SidebarContext'

export default function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { isCollapsed, toggleCollapsed } = useSidebar()

    const menuItems = [
        { icon: Bot, label: 'Daily Brief', path: '/dashboard' },
        { icon: Radar, label: 'Lead Radar', path: '/leads' },
        { icon: Mail, label: 'Outreach Ops', path: '/campaigns' },
        { icon: FileText, label: 'Smart Assets', path: '/assets' },
        { icon: Brain, label: 'System Brain', path: '/settings' },
    ]

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <motion.div
            initial={false}
            animate={{
                width: isCollapsed ? 88 : 280,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-screen bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col fixed left-0 top-0 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]"
        >
            <div className="p-6 flex items-center justify-between mb-2">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
                        >
                            <div className="w-10 h-10 flex items-center justify-center">
                                <Logo size={40} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-outfit font-bold text-xl text-gray-900">ExportHunter</span>
                                <span className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">AI Powered</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {isCollapsed && (
                    <div className="w-10 h-10 flex items-center justify-center">
                        <Logo size={40} />
                    </div>
                )}
                <button
                    onClick={toggleCollapsed}
                    className="p-2 hover:bg-gray-100/80 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative group overflow-hidden ${isActive
                                ? 'text-blue-600 font-medium'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-bg"
                                    className="absolute inset-0 bg-blue-50/80 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />

                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="whitespace-nowrap font-medium relative z-10"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {isActive && !isCollapsed && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute right-3 w-1.5 h-1.5 bg-blue-600 rounded-full"
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-100/50 space-y-4">
                {/* Credit Usage Widget */}
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usage Limits</span>
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                    PRO PLAN
                                </span>
                            </div>

                            {/* Lead Credits */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                    <span className="text-slate-600">Lead Credits</span>
                                    <span className="text-slate-900 font-bold">850 / 1000</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full w-[85%]" />
                                </div>
                            </div>

                            {/* AI Tokens */}
                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                    <span className="text-slate-600">AI Tokens</span>
                                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                                        <Bot className="w-3 h-3" /> Unlimited
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full group ${isCollapsed ? 'justify-center' : ''
                        }`}
                >
                    <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </motion.div>
    )
}
