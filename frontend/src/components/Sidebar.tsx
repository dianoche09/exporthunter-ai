import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Mail, Settings, LogOut, ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Leads', path: '/leads' },
        { icon: Mail, label: 'Campaigns', path: '/campaigns' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ]

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <motion.div
            animate={{ width: isCollapsed ? 80 : 256 }}
            className="h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 shadow-sm"
        >
            <div className="p-6 flex items-center justify-between">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">E</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900">ExportHunter</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            {!isCollapsed && (
                                <span className="whitespace-nowrap">{item.label}</span>
                            )}
                            {isCollapsed && isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full"
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full ${isCollapsed ? 'justify-center' : ''
                        }`}
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </motion.div>
    )
}
