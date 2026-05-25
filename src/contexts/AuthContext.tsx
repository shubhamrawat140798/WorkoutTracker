import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError, type User } from '@/lib/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const { user } = await api.auth.me()
      setUser(user)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setUser(null)
      }
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { user } = await api.auth.login({ email, password })
    setUser(user)
  }

  const register = async (email: string, name: string, password: string) => {
    const { user } = await api.auth.register({ email, name, password })
    setUser(user)
  }

  const logout = async () => {
    await api.auth.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
