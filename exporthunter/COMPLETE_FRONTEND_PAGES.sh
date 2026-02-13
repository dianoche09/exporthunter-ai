#!/bin/bash

echo "🎨 Frontend Sayfaları oluşturuluyor..."

cd exporthunter-ai/frontend

# Dashboard Page
cat > src/pages/DashboardPage.tsx << 'DASHBOARD'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Users, Mail, TrendingUp } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardPage() {
  // Mock data - gerçekte API'den gelecek
  const stats = {
    totalLeads: 156,
    activeLeads: 89,
    totalCampaigns: 12,
    emailsSent: 1240
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
          value={stats.totalLeads}
          change="+12%"
          changeType="positive"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Leads"
          value={stats.activeLeads}
          change="+8%"
          changeType="positive"
        />
        <StatCard
          icon={Mail}
          label="Campaigns"
          value={stats.totalCampaigns}
          change="+3"
          changeType="positive"
        />
        <StatCard
          icon={BarChart3}
          label="Emails Sent"
          value={stats.emailsSent}
          change="+156"
          changeType="positive"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionCard
          title="Find New Leads"
          description="Use AI to discover potential customers"
          buttonText="Start Discovery"
          href="/leads"
        />
        <QuickActionCard
          title="Create Campaign"
          description="Send personalized emails to your leads"
          buttonText="New Campaign"
          href="/campaigns"
        />
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
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function QuickActionCard({ title, description, buttonText, href }: any) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <a
        href={href}
        className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        {buttonText}
      </a>
    </div>
  )
}
DASHBOARD

# Leads Page
cat > src/pages/LeadsPage.tsx << 'LEADS'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter } from 'lucide-react'
import { leadsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['leads', statusFilter],
    queryFn: () => leadsAPI.getLeads({ status: statusFilter === 'all' ? undefined : statusFilter })
  })

  const createLeadMutation = useMutation({
    mutationFn: leadsAPI.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead created successfully!')
    }
  })

  const leads = data?.data?.leads || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-2">Manage your potential customers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-5 h-5" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="qualified">Qualified</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No leads found. Start by discovering new leads!
                </td>
              </tr>
            ) : (
              leads.map((lead: any) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{lead.companyName}</td>
                  <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                  <td className="px-6 py-4 text-gray-600">{lead.country}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{lead.aiScore}/100</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    interested: 'bg-purple-100 text-purple-800',
    qualified: 'bg-green-100 text-green-800',
    customer: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
LEADS

# Campaigns Page
cat > src/pages/CampaignsPage.tsx << 'CAMPAIGNS'
export default function CampaignsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
        <p className="text-gray-500 mt-2">Create and manage your email campaigns</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first email campaign to reach out to your leads
          </p>
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  )
}
CAMPAIGNS

# Settings Page
cat > src/pages/SettingsPage.tsx << 'SETTINGS'
import { useAuth } from '../contexts/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                defaultValue={user?.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                defaultValue={user?.company}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Current Plan: {user?.subscription}</p>
              <p className="text-sm text-gray-500">Upgrade to unlock more features</p>
            </div>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
SETTINGS

echo ""
echo "✅ Frontend Sayfaları oluşturuldu!"
echo ""
echo "📄 Oluşturulan Sayfalar:"
echo "  - DashboardPage: İstatistikler ve hızlı aksiyonlar"
echo "  - LeadsPage: Müşteri listesi, arama ve filtreleme"
echo "  - CampaignsPage: E-posta kampanyaları"
echo "  - SettingsPage: Profil ve hesap ayarları"
echo ""
