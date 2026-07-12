'use client'

import { createContext, useContext } from 'react'

interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  discordId?: string | null
}

interface AuthContextType {
  user: User | null
  session: any
  status: 'loading' | 'authenticated' | 'unauthenticated'
  isAuthenticated: boolean
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  status: 'unauthenticated',
  isAuthenticated: false,
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}
