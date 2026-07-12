'use client'

import { useState, useEffect } from 'react'
import { SessionProvider } from '@/components/providers/session-provider'

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <SessionProvider>{children}</SessionProvider>
}
