'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react'
import { API_BASE, authHeaders, getUsername } from '@/lib/api/auth'

interface ChapterSummaries {
  [chapterTitle: string]: string
}

export default function ChaptersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents, getFileForDoc } = useDocuments()

  const hasRequestedRef = useRef(false)

  const doc1Id = searchParams.get('doc1')
  const doc1 = documents.find((d) => d.id === doc1Id)

  const [summaries, setSummaries] = useState<ChapterSummaries | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!doc1Id || !doc1) return

      if (hasRequestedRef.current) return
      hasRequestedRef.current = true

      let file = getFileForDoc(doc1Id)

      const userId = getUsername()
      if (!userId) {
        setError('You must be logged in to generate chapter-wise summaries.')
        return
      }

      // If we don't have the file in this session, download it from the backend
      if (!file) {
        try {
          const downloadRes = await fetch(`${API_BASE}/pdfdownload/download-pdf/${encodeURIComponent(doc1Id)}`, {
            method: 'GET',
            headers: {
              ...authHeaders(),
            },
          })

          if (!downloadRes.ok) {
            setError('Failed to download document from server.')
            return
          }

          const blob = await downloadRes.blob()
          file = new File([blob], doc1.name || 'document.pdf', { type: 'application/pdf' })
        } catch (err) {
          setError('Failed to download document from server.')
          return
        }
      }
      if (!userId) {
        setError('You must be logged in to generate chapter-wise summaries.')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('user_id', userId)

        const res = await fetch(`${API_BASE}/chaptersum/summarize-pdf-chapters/`, {
          method: 'POST',
          headers: {
            ...authHeaders(),
          },
          body: formData,
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          setError(data.detail || 'Failed to generate chapter-wise summaries.')
          return
        }

        const chapterSummaries = data.chapter_summaries as ChapterSummaries | undefined
        if (!chapterSummaries) {
          setError('No chapter summaries returned from server.')
          return
        }

        setSummaries(chapterSummaries)
      } catch (err) {
        setError('An error occurred while generating chapter-wise summaries.')
      } finally {
        setIsLoading(false)
      }
    }

    run()
  }, [doc1Id, doc1, getFileForDoc])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Chapter-wise Summary</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Explore how each chapter contributes to the overall story of your document.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {!doc1 && (
          <Card className="glass-effect border-primary/20">
            <CardContent className="py-8 text-center space-y-2">
              <p className="text-sm text-muted-foreground">No document selected for chapter-wise summary.</p>
              <p className="text-xs text-muted-foreground">
                Go back to Document Processing and choose a document with chapters.
              </p>
            </CardContent>
          </Card>
        )}

        {doc1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-effect border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {doc1.name}
                </CardTitle>
                <CardDescription>
                  Uploaded on {new Date(doc1.uploadDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading && (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground text-center">
                      Generating chapter-wise summaries... this can take a little longer for large or multi-chapter PDFs.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-xs text-destructive">
                    {error}
                  </div>
                )}

                {!isLoading && !error && summaries && (
                  <div className="space-y-4 max-h-[480px] overflow-y-auto">
                    {Object.entries(summaries).map(([title, text]) => (
                      <div key={title} className="border rounded-lg p-3 bg-muted/40">
                        <h3 className="text-sm font-semibold mb-1">{title}</h3>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && !error && !summaries && (
                  <p className="text-sm text-muted-foreground">
                    No chapter summaries available yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
