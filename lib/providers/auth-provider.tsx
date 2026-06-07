'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { clearAuth, getToken, getDisplayName } from '@/lib/api/auth'

interface AuthContextType {
  isAuthenticated: boolean
  isReady: boolean
  username?: string
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [username, setUsername] = useState<string | undefined>(undefined)

  useEffect(() => {
    const syncAuthState = () => {
      const token = getToken()
      const displayName = getDisplayName()
      setIsAuthenticated(!!token)
      setUsername(displayName || undefined)
      setIsReady(true)
    }

    syncAuthState()

    if (typeof window !== 'undefined') {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === 'dx_access_token' || event.key === 'dx_username') {
          syncAuthState()
        }
      }

      const handleAuthChanged = () => {
        syncAuthState()
      }

      window.addEventListener('storage', handleStorage)
      window.addEventListener('dx-auth-changed', handleAuthChanged as EventListener)

      return () => {
        window.removeEventListener('storage', handleStorage)
        window.removeEventListener('dx-auth-changed', handleAuthChanged as EventListener)
      }
    }
  }, [])

  const logout = () => {
    clearAuth()
    setIsAuthenticated(false)
    setUsername(undefined)
    setIsReady(true)
  }

  const value: AuthContextType = {
    isAuthenticated,
    isReady,
    username,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthContextProvider>{children}</AuthContextProvider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
