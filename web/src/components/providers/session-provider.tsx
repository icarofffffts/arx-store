'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { SessionProvider as NextAuthSessionProvider, useSession, signOut } from 'next-auth/react'

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

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  status: 'loading',
  isAuthenticated: false,
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

async function fetchArxMe(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.user) {
      return {
        id: data.user.id || data.user.discordId,
        name: data.user.name || data.user.email,
        email: data.user.email,
        image: data.user.image || null,
        discordId: data.user.discordId || null,
      }
    }
    return null
  } catch {
    return null
  }
}

function InnerAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession()
  const [arxUser, setArxUser] = useState<User | null>(null)
  const [arxLoading, setArxLoading] = useState(true)

  useEffect(() => {
    if (nextAuthStatus === 'authenticated') {
      setArxLoading(false)
      return
    }
    fetchArxMe().then((u) => {
      setArxUser(u)
      setArxLoading(false)
    })
  }, [nextAuthStatus])

  const user =
    nextAuthStatus === 'authenticated'
      ? {
          id: (nextAuthSession?.user as any)?.discordId,
          name: nextAuthSession?.user?.name,
          email: nextAuthSession?.user?.email,
          image: nextAuthSession?.user?.image,
          discordId: (nextAuthSession?.user as any)?.discordId,
        }
      : arxUser

  const isAuthenticated = nextAuthStatus === 'authenticated' || !!arxUser
  const status =
    nextAuthStatus === 'loading' || arxLoading
      ? 'loading'
      : isAuthenticated
        ? 'authenticated'
        : 'unauthenticated'

  const logout = useCallback(async () => {
    if (nextAuthStatus === 'authenticated') {
      await signOut({ callbackUrl: '/' })
    } else {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      setArxUser(null)
      window.location.href = '/'
    }
  }, [nextAuthStatus])

  return (
    <AuthContext.Provider
      value={{
        user,
        session: nextAuthSession,
        status,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </NextAuthSessionProvider>
  )
}
