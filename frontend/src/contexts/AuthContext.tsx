import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  company: string
  subscription: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    name: string
    password: string
    company: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      authAPI
        .getCurrentUser()
        .then((response: any) => {
          setUser(response.data.user)
        })
        .catch(() => {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response: any = await authAPI.login({ email, password })
      
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('refresh_token', response.data.refreshToken)
      setUser(response.data.user)
      
      toast.success('Welcome back!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    email: string
    name: string
    password: string
    company: string
  }) => {
    try {
      setIsLoading(true)
      const response: any = await authAPI.register(data)
      
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('refresh_token', response.data.refreshToken)
      setUser(response.data.user)
      
      toast.success('Account created successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
