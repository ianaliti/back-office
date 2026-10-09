'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getUser } from '@/lib/auth'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
