'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/providers/auth-provider'
import { DocumentProvider } from '@/lib/providers/document-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DocumentProvider>
        {children}
      </DocumentProvider>
    </AuthProvider>
  )
}
