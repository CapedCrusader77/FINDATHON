import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: string
  workspace: string
  avatarInitials: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'dedupeiq_auth_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        // New visitors should see the landing page and choose how they enter.
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string, rememberMe = true) => {
    // Client-side authentication validation
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' }
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' }
    }

    const nameFromEmail = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const initials = nameFromEmail.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US'

    const authenticatedUser: User = {
      id: `usr_${Date.now()}`,
      name: nameFromEmail || 'Workspace User',
      email,
      role: 'Storage Analyst',
      workspace: 'Local Workstation / E:',
      avatarInitials: initials
    }

    setUser(authenticatedUser)
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser))
    }
    return { success: true }
  }

  const signup = async (name: string, email: string, password: string) => {
    if (!name.trim()) return { success: false, error: 'Full name is required.' }
    if (!email.trim() || !email.includes('@')) return { success: false, error: 'Valid email address is required.' }
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' }

    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US'
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: 'Workspace Owner',
      workspace: 'Local Workstation / E:',
      avatarInitials: initials
    }

    setUser(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    return { success: true }
  }

  const forgotPassword = async (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' }
    }
    return { success: true, message: `Password reset instructions sent to ${email}` }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        forgotPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
