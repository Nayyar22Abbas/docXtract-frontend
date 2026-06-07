'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { API_BASE, authHeaders, getUsername } from '@/lib/api/auth'

export interface StoredDocument {
  id: string // backend Mongo _id
  name: string
  uploadDate: string
  size: number
  type: 'pdf' | 'doc' | 'docx'
  savedPath?: string
}

interface DocumentContextType {
  documents: StoredDocument[]
  addDocument: (file: File) => Promise<boolean>
  deleteDocument: (id: string) => void
  getDocumentCount: () => number
  getSummary: (id: string) => string | undefined
  getFileForDoc: (id: string) => File | undefined
  isLoading: boolean
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<StoredDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [summaryById, setSummaryById] = useState<Record<string, string>>({})
  const [fileById, setFileById] = useState<Record<string, File>>({})

  const fetchDocumentsForUser = async (userId: string | null): Promise<StoredDocument[]> => {
    if (!userId) {
      setDocuments([])
      setIsLoading(false)
      return []
    }

    try {
      console.log(`Fetching documents for user: ${userId} from ${API_BASE}/list/list-pdfs/`)
      const res = await fetch(`${API_BASE}/list/list-pdfs/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          ...authHeaders(),
        },
      })

      if (!res.ok) {
        console.error(`Failed to fetch documents: ${res.status} ${res.statusText}`)
        setDocuments([])
        return []
      }

      const data = await res.json().catch(() => ({}))
      const docs = (data.documents || []).map((doc: any) => {
        const originalName = doc.original_name as string
        const lower = originalName.toLowerCase()
        const type: 'pdf' | 'doc' | 'docx' = lower.endsWith('.pdf')
          ? 'pdf'
          : lower.endsWith('.docx')
            ? 'docx'
            : 'doc'

        return {
          id: doc.id as string,
          name: originalName,
          uploadDate: doc.upload_time as string,
          size: 0,
          type,
          savedPath: doc.saved_path as string,
        } satisfies StoredDocument
      })

      console.log(`Fetched ${docs.length} documents successfully`)
      setDocuments(docs)
      return docs
    } catch (error) {
      console.error('Error fetching documents from backend:', error)
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
      }
      setDocuments([])
      return []
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const userId = getUsername()
    fetchDocumentsForUser(userId)

    if (typeof window !== 'undefined') {
      const handleAuthChanged = () => {
        const nextUserId = getUsername()
        setIsLoading(true)
        fetchDocumentsForUser(nextUserId)
        setSummaryById({})
        setFileById({})
      }

      window.addEventListener('dx-auth-changed', handleAuthChanged as EventListener)

      return () => {
        window.removeEventListener('dx-auth-changed', handleAuthChanged as EventListener)
      }
    }
  }, [])

  const addDocument = async (file: File): Promise<boolean> => {
    const userId = getUsername()
    if (!userId) {
      console.error('Cannot upload document without authenticated user')
      return false
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      // NOTE: Backend defines user_id as a non-form parameter, so we send it in the query string

      const res = await fetch(`${API_BASE}/summary/summarize-pdf-combined/?user_id=${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
        },
        body: formData,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('Failed to summarize and upload PDF:', data)
        return false
      }

      const savedPath = data?.file_info?.saved_path as string | undefined
      const summary = data?.summary as string | undefined

      const docs = await fetchDocumentsForUser(userId)

      if (savedPath && summary) {
        const newDoc = docs.find((d) => d.savedPath === savedPath)
        if (newDoc) {
          setFileById((prev) => ({ ...prev, [newDoc.id]: file }))
          setSummaryById((prev) => ({ ...prev, [newDoc.id]: summary }))
        }
      }

      return true
    } catch (error) {
      console.error('Error uploading document:', error)
      return false
    }
  }

  const deleteDocument = (id: string) => {
    // Call backend delete API; keep function sync for existing callers
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/deletepdf/pdf/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: {
            ...authHeaders(),
          },
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          console.error('Failed to delete PDF on backend:', data)
          return
        }
      } catch (error) {
        console.error('Error deleting PDF on backend:', error)
        return
      }

      // Only update local state if backend deletion succeeded
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
      setSummaryById((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setFileById((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    })()
  }

  const getDocumentCount = () => documents.length

  const getSummary = (id: string) => summaryById[id]

  const getFileForDoc = (id: string) => fileById[id]

  const value: DocumentContextType = {
    documents,
    addDocument,
    deleteDocument,
    getDocumentCount,
    getSummary,
    getFileForDoc,
    isLoading,
  }

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>
}

export function useDocuments(): DocumentContextType {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider')
  }
  return context
}
