import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
    return (
        <div className="flex bg-gray-50 min-h-screen font-sans text-gray-900">
            <Sidebar />
            <div className="flex-1 ml-[80px] lg:ml-[256px] transition-all duration-300">
                <Outlet />
            </div>
        </div>
    )
}
