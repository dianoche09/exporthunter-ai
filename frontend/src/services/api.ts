import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<any>) => {
    // Token expired - try refresh
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          const newToken = response.data.data.token
          localStorage.setItem('token', newToken)

          // Retry original request
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${newToken}`
            return api(error.config)
          }
        } catch {
          // Refresh failed - logout
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }

    // Show error toast - EXCEPT for 202 Accepted (AI Commands)
    if (error.response?.status !== 202) {
      // const message = error.response?.data?.error || 'An error occurred'
      // toast.error(message) // Optional: silence generic errors
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: { email: string; name: string; password: string; company: string }) =>
    api.post('/auth/register', userData),

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  },

  getCurrentUser: () => api.get('/auth/me'),

  updateProfile: (data: any) => api.put('/auth/me', data),

  analyzeMarkets: (data: any) => api.post('/auth/analyze-markets', data),
}

// Leads API
export const leadsAPI = {
  getLeads: (params?: { page?: number; limit?: number; status?: string; search?: string; min_score?: number; sort?: string }) =>
    api.get('/leads', { params }),

  getLead: (id: string) => api.get(`/leads/${id}`),

  getStats: () => api.get('/leads/stats'),

  createLead: (data: any) => api.post('/leads', data),

  updateLead: (id: string, data: any) => api.put(`/leads/${id}`, data),

  deleteLead: (id: string) => api.delete(`/leads/${id}`),

  discoverLeads: (data: { product: string; targetMarkets: string[]; industry: string; groupName?: string; preview?: boolean }) =>
    api.post('/leads/discover-batch', data),

  hunt: (data: { product: string; targetMarkets: string[]; industry: string }) =>
    api.post('/leads/hunt', data),

  createLeadsBulk: (leads: any[]) => api.post('/leads/batch', { leads }),

  importLeads: (csvContent: string) => api.post('/import/leads', { csvContent }),

  exportLeads: (params?: { status?: string; tags?: string }) =>
    api.get('/import/leads/export', { params, responseType: 'blob' }),

  getSupplyChainIntel: (id: string) => api.get(`/leads/${id}/supply-chain-intel`),
}

// Campaigns API
export const campaignsAPI = {
  getCampaigns: (params?: { page?: number; limit?: number }) =>
    api.get('/campaigns', { params }),

  getCampaign: (id: string) => api.get(`/campaigns/${id}`),

  createCampaign: (data: { name: string; subject: string; body: string; leadIds: string[] }) =>
    api.post('/campaigns', data),

  updateCampaign: (id: string, data: any) => api.put(`/campaigns/${id}`, data),

  deleteCampaign: (id: string) => api.delete(`/campaigns/${id}`),

  sendCampaign: (id: string) => api.post(`/campaigns/${id}/send`),

  pauseCampaign: (id: string) => api.post(`/campaigns/${id}/pause`),

  resumeCampaign: (id: string) => api.post(`/campaigns/${id}/resume`),

  getCampaignStats: (id: string) => api.get(`/campaigns/${id}/stats`),

  generateSequence: (data: { product: string; target: string; count: number }) =>
    api.post('/campaigns/generate-sequence', data),

  optimizeCampaign: (id: string) => api.post(`/campaigns/${id}/optimize`),
}

// AI API
export const aiAPI = {
  generateEmail: (data: { companyName: string; product: string; tone: string; language?: string; isTemplate?: boolean }) =>
    api.post('/ai/generate-email', data),

  analyzeResponse: (data: { emailContent: string }) =>
    api.post('/ai/analyze-response', data),

  getDiscoverySuggestions: (data: { product: string }) =>
    api.post('/ai/discover-suggestions', data),

  getHsCodeSuggestions: (data: { product: string }) =>
    api.post('/ai/hs-code-suggestions', data),

  analyzeSupplyChain: (data: { product: string; origin?: string; target: string }) =>
    api.post('/ai/analyze-supply-chain', data),

  enrichLead: (data: { company: string; website: string; product: string }) =>
    api.post('/ai/enrich-lead', data),

  // New Magic Command
  command: (data: { command: string }) => api.post('/ai/command', data),

  generatePitch: (data: {
    lead_name: string;
    lead_country?: string;
    user_strategy: string;
    competitor_pain_point: string;
    time_difference: string;
    product: string;
  }) => api.post('/ai/generate-pitch', data),
}

// Dashboard API (New)
export const dashboardAPI = {
  getBriefing: () => api.get('/dashboard/briefing'),
  getOpportunities: () => api.get('/dashboard/opportunities'),
  getStats: () => api.get('/dashboard/stats'),
  getAcquisitionChart: (range: string = '7d') => api.get(`/dashboard/chart/acquisition?range=${range}`),
}


// Upload API
export const uploadAPI = {
  uploadLogo: (formData: FormData) => api.post('/upload/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Payment API
export const paymentAPI = {
  createCheckoutSession: (plan: 'pro' | 'enterprise') =>
    api.post('/payment/create-checkout-session', { plan }),

  createPortalSession: () =>
    api.post('/payment/create-portal-session', {}),
}

export { api }
export default api
