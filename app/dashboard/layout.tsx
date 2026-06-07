'use client'

import type React from "react"
import { useAuth } from '@/lib/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isReady } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isReady) return
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isReady, router])

  if (!isReady) {
    return null // or a loading spinner if desired
  }

  if (!isAuthenticated) {
    return null // Let the redirect happen
  }

  return <div className="min-h-screen">{children}</div>
}
