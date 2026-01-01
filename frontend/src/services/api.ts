import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
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
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          const newToken = response.data.data.token
          localStorage.setItem('auth_token', newToken)

          // Retry original request
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${newToken}`
            return api(error.config)
          }
        } catch {
          // Refresh failed - logout
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }

    // Show error toast
    const message = error.response?.data?.error || 'An error occurred'
    toast.error(message)

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
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
  },

  getCurrentUser: () => api.get('/auth/me'),
}

// Leads API
export const leadsAPI = {
  getLeads: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/leads', { params }),

  getLead: (id: string) => api.get(`/leads/${id}`),

  createLead: (data: any) => api.post('/leads', data),

  updateLead: (id: string, data: any) => api.put(`/leads/${id}`, data),

  deleteLead: (id: string) => api.delete(`/leads/${id}`),

  discoverLeads: (data: { product: string; targetMarkets: string[]; industry: string }) =>
    api.post('/leads/discover', data),

  importLeads: (csvContent: string) => api.post('/import/leads', { csvContent }),

  exportLeads: (params?: { status?: string; tags?: string }) =>
    api.get('/import/leads/export', { params, responseType: 'blob' }),
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

  getCampaignStats: (id: string) => api.get(`/campaigns/${id}/stats`),
}

// AI API
export const aiAPI = {
  generateEmail: (data: { companyName: string; product: string; tone: string }) =>
    api.post('/ai/generate-email', data),

  analyzeResponse: (data: { emailContent: string }) =>
    api.post('/ai/analyze-response', data),
}

// Stats API
export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
}

export { api }
export default api
