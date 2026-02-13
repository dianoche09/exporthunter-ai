#!/bin/bash

echo "🎨 Visual Makeover Part 1 - Dashboard & Charts..."

cd exporthunter-ai/frontend

# ===========================================
# 1. INSTALL ADDITIONAL PACKAGES
# ===========================================

cat >> package.json << 'PACKAGEUPDATE'
,
    "recharts": "^2.10.3",
    "framer-motion": "^10.16.16",
    "react-countup": "^6.5.0",
    "canvas-confetti": "^1.9.2"
PACKAGEUPDATE

# ===========================================
# 2. ENHANCED DASHBOARD WITH CHARTS
# ===========================================

cat > src/pages/DashboardPage.tsx << 'DASHBOARD'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { 
  BarChart3, Users, Mail, TrendingUp, Activity, 
  ArrowUp, ArrowDown, Sparkles, Target 
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { api } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.get('/stats/dashboard')
  })

  const stats = data?.data?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Prepare chart data
  const statusChartData = Object.entries(stats?.leadsByStatus || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))

  const countryChartData = stats?.leadsByCountry?.map((item: any) => ({
    name: item.country,
    leads: item.count
  })) || []

  // Mock time series data for line chart
  const timeSeriesData = [
    { date: 'Week 1', leads: 12, emails: 45 },
    { date: 'Week 2', leads: 19, emails: 78 },
    { date: 'Week 3', leads: 25, emails: 112 },
    { date: 'Week 4', leads: 32, emails: 156 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <p className="text-gray-600 ml-14">Welcome back! Here's your performance overview</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnimatedStatCard
          icon={Users}
          label="Total Leads"
          value={stats?.overview.totalLeads || 0}
          change={stats?.overview.leadsGrowth || 0}
          changeType="positive"
          gradient="from-blue-500 to-cyan-500"
          delay={0}
        />
        <AnimatedStatCard
          icon={Target}
          label="Active Leads"
          value={stats?.overview.activeLeads || 0}
          change={stats?.overview.openRate || 0}
          suffix="% open"
          changeType="neutral"
          gradient="from-purple-500 to-pink-500"
          delay={0.1}
        />
        <AnimatedStatCard
          icon={Mail}
          label="Campaigns"
          value={stats?.overview.totalCampaigns || 0}
          change={stats?.overview.emailsSent || 0}
          suffix=" sent"
          changeType="neutral"
          gradient="from-orange-500 to-red-500"
          delay={0.2}
        />
        <AnimatedStatCard
          icon={BarChart3}
          label="Emails Sent"
          value={stats?.overview.emailsSent || 0}
          change={stats?.overview.clickRate || 0}
          suffix="% CTR"
          changeType="positive"
          gradient="from-green-500 to-emerald-500"
          delay={0.3}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line Chart - Performance Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Performance Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="emails" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart - Leads by Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Leads by Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Top Countries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Top Markets
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={countryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="leads" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {stats?.recentActivities?.slice(0, 5).map((activity: any, index: number) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.leadName}</p>
                  <p className="text-xs text-gray-500">{activity.campaignName}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getActivityColor(activity.type)}`}>
                    {activity.type}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function AnimatedStatCard({ icon: Icon, label, value, change, suffix = '', changeType, gradient, delay }: any) {
  const isPositive = changeType === 'positive'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden group"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            {isPositive ? (
              <ArrowUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-blue-600" />
            )}
            <span className={isPositive ? 'text-green-600' : 'text-blue-600'}>
              {change}{suffix}
            </span>
          </div>
        </div>
        
        <div className="text-3xl font-bold text-gray-900 mb-1">
          <CountUp end={value} duration={2} />
        </div>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  )
}

function getActivityColor(type: string) {
  const colors: Record<string, string> = {
    sent: 'bg-blue-100 text-blue-700',
    opened: 'bg-green-100 text-green-700',
    clicked: 'bg-purple-100 text-purple-700',
    replied: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}
DASHBOARD

echo ""
echo "✅ Part 1/3 - Dashboard with charts completed!"
echo ""
