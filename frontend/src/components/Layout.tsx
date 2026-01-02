import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { authAPI } from '../services/api'
import Sidebar from './Sidebar'
import LoadingSpinner from './LoadingSpinner'
import { useSidebar } from '../contexts/SidebarContext'
import { motion } from 'framer-motion'

export default function Layout() {
    const location = useLocation();
    const { isCollapsed } = useSidebar();

    const { data: userRes, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authAPI.getCurrentUser,
        staleTime: 300000 // 5 minutes
    });

    const user = (userRes as any)?.data?.user;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Force onboarding if not completed and not already on onboarding page
    if (user && !user.onboardingCompleted && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" />;
    }

    return (
        <div className="flex bg-slate-50 min-h-screen font-outfit text-slate-900">
            <Sidebar />
            <motion.div
                initial={false}
                animate={{
                    marginLeft: isCollapsed ? 88 : 280,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1"
            >
                <Outlet />
            </motion.div>
        </div>
    )
}
