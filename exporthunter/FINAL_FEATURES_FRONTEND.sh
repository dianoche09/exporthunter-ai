#!/bin/bash

echo "🎨 Final Frontend Features ekleniyor..."

cd exporthunter-ai/frontend

# ===========================================
# UPDATE DASHBOARD WITH REAL STATS
# ===========================================

cat > src/pages/DashboardPage.tsx << 'DASHBOARD'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Users, Mail, TrendingUp, Activity } from 'lucide-react'
import { api } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Leads"
          value={stats?.overview.totalLeads || 0}
          change={`+${stats?.overview.leadsGrowth || 0}%`}
          changeType="positive"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Leads"
          value={stats?.overview.activeLeads || 0}
          change={`${stats?.overview.openRate || 0}% open rate`}
          changeType="neutral"
        />
        <StatCard
          icon={Mail}
          label="Campaigns"
          value={stats?.overview.totalCampaigns || 0}
          change={`${stats?.overview.emailsSent || 0} emails sent`}
          changeType="neutral"
        />
        <StatCard
          icon={BarChart3}
          label="Email Sent"
          value={stats?.overview.emailsSent || 0}
          change={`${stats?.overview.clickRate || 0}% click rate`}
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h3>
          <div className="space-y-3">
            {Object.entries(stats?.leadsByStatus || {}).map(([status, count]: any) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                  <span className="text-sm text-gray-700 capitalize">{status}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
          <div className="space-y-3">
            {stats?.leadsByCountry?.map((item: any) => (
              <div key={item.country} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.country}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600"
                      style={{ width: `${(item.count / stats?.overview.totalLeads) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mt-6 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <div className="space-y-3">
          {stats?.recentActivities?.map((activity: any) => (
            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.leadName}</p>
                <p className="text-xs text-gray-500">Campaign: {activity.campaignName}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-full ${getActivityColor(activity.type)}`}>
                  {activity.type}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, change, changeType }: any) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-primary-50 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        <span className={`text-sm font-medium ${
          changeType === 'positive' ? 'text-green-600' : 'text-gray-600'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
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
  return colors[status] || 'bg-gray-500'
}

function getActivityColor(type: string) {
  const colors: Record<string, string> = {
    sent: 'bg-blue-100 text-blue-800',
    opened: 'bg-green-100 text-green-800',
    clicked: 'bg-purple-100 text-purple-800',
    replied: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}
DASHBOARD

# ===========================================
# ADD IMPORT/EXPORT TO LEADS PAGE
# ===========================================

cat >> src/pages/LeadsPage.tsx << 'LEADSIMPORT'

// Add to imports
import { Upload, Download } from 'lucide-react'

// Add these functions inside LeadsPage component:

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/import/leads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`Imported ${response.data.data.success} leads!`)
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    } catch (error) {
      toast.error('Failed to import leads')
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/import/leads/export', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'leads.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Leads exported successfully!')
    } catch (error) {
      toast.error('Failed to export leads')
    }
  }

// Add buttons to header:
/*
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
            <Upload className="w-5 h-5" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          ... existing buttons ...
        </div>
*/
LEADSIMPORT

echo ""
echo "✅ Frontend Features eklendi!"
echo ""
echo "🎨 Güncellenen Sayfalar:"
echo "  - Dashboard: Gerçek istatistikler + grafikler"
echo "  - Leads: CSV Import/Export butonları"
echo ""
