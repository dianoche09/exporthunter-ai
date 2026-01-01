import { useQuery } from '@tanstack/react-query'
import { BarChart3, Users, Mail, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, MousePointer2 } from 'lucide-react'
import { api } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.get('/stats/dashboard')
  })

  const stats = data?.data?.data

  // Mock data for charts if API returns empty
  const chartData = [
    { name: 'Mon', leads: 4, emails: 2 },
    { name: 'Tue', leads: 7, emails: 5 },
    { name: 'Wed', leads: 5, emails: 8 },
    { name: 'Thu', leads: 12, emails: 15 },
    { name: 'Fri', leads: 18, emails: 25 },
    { name: 'Sat', leads: 15, emails: 20 },
    { name: 'Sun', leads: 22, emails: 30 },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hunter</span>
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Here's what's happening with your campaigns today.</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Leads"
            value={stats?.overview.totalLeads || 0}
            change={`+${stats?.overview.leadsGrowth || 12}%`}
            changeType="positive"
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Active Leads"
            value={stats?.overview.activeLeads || 0}
            change={`${stats?.overview.openRate || 45}% open rate`}
            changeType="neutral"
            color="indigo"
          />
          <StatCard
            icon={Mail}
            label="Campaigns"
            value={stats?.overview.totalCampaigns || 0}
            change={`${stats?.overview.emailsSent || 0} sent`}
            changeType="neutral"
            color="purple"
          />
          <StatCard
            icon={MousePointer2}
            label="Click Rate"
            value={`${stats?.overview.clickRate || 0}%`}
            change="+2.4% vs last week"
            changeType="positive"
            color="emerald"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <motion.div
            variants={item}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Lead Acquisition</h3>
                <p className="text-sm text-gray-500">New leads over the last 7 days</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">Leads</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">Emails</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                  />
                  <Area
                    type="monotone"
                    dataKey="emails"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEmails)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            variants={item}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {stats?.recentActivities?.map((activity: any, i: number) => (
                <div key={activity.id || i} className="flex gap-3 items-start pb-4 border-b border-gray-50 last:border-0">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${getActivityColor(activity.type).dot}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.leadName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activity.type === 'opened' ? 'Opened email in' :
                        activity.type === 'clicked' ? 'Clicked link in' : 'Status update:'}
                      <span className="font-semibold text-gray-700 ml-1">{activity.campaignName || 'General'}</span>
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )) || (
                  <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
                )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Leads by Status</h3>
            <div className="space-y-4">
              {Object.entries(stats?.leadsByStatus || {}).map(([status, count]: any) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700 capitalize">{status}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / (stats?.overview.totalLeads || 1)) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${getStatusColor(status)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-10 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none"></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Upgrade to Pro</h3>
              <p className="text-indigo-100 mb-6 max-w-sm">
                Unlock advanced AI features, unlimited export credits, and priority support.
              </p>
              <button className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
                View Plans
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, change, changeType, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${changeType === 'positive' ? 'bg-green-50 text-green-700' :
              changeType === 'negative' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
            }`}>
            {changeType === 'positive' ? <ArrowUpRight className="w-3 h-3" /> :
              changeType === 'negative' ? <ArrowDownRight className="w-3 h-3" /> : null}
            {change}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
      </div>
    </motion.div>
  )
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    interested: 'bg-purple-500',
    qualified: 'bg-green-500',
    customer: 'bg-emerald-500',
    rejected: 'bg-red-500'
  }
  return colors[status] || 'bg-gray-400'
}

function getActivityColor(type: string) {
  const colors: Record<string, any> = {
    sent: { dot: 'bg-blue-500', text: 'text-blue-700' },
    opened: { dot: 'bg-green-500', text: 'text-green-700' },
    clicked: { dot: 'bg-purple-500', text: 'text-purple-700' },
    replied: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
    failed: { dot: 'bg-red-500', text: 'text-red-700' }
  }
  return colors[type] || { dot: 'bg-gray-400', text: 'text-gray-700' }
}
