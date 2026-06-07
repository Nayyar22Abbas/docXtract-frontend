'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Loader2, Copy, Download, Sparkles } from 'lucide-react'
import { summarizePdfCombined, downloadPdf } from '@/lib/api/endpoints'
import { getUsername } from '@/lib/api/auth'
import ReactMarkdown from 'react-markdown'
import HoverLetters from '@/components/HoverLetters'
import MagicCard from '@/components/MagicCard'

export default function SummarizePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents } = useDocuments()
  const abortControllerRef = useRef<AbortController | null>(null)

  const doc1Id = searchParams.get('doc1')
  const doc1 = documents.find(d => d.id === doc1Id)

  const [summary, setSummary] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Always abort pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    if (!doc1 || summary || isGenerating) return
    void handleGenerateSummary()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [doc1])

  const handleGenerateSummary = async () => {
    if (!doc1) return

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    const userId = getUsername()
    if (!userId) {
      setError('You must be logged in to generate a summary.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Download PDF blob from backend (never cancel)
      const pdfBlob = await downloadPdf(doc1.id)
      const file = new File([pdfBlob], doc1.name || 'document.pdf', { type: 'application/pdf' })

      // Call combined summary endpoint (can be cancelled)
      const result = await summarizePdfCombined(file, userId, abortControllerRef.current.signal)
      setSummary(result.combined_summary)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Silently ignore abort errors
      }
      setError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold">
              <HoverLetters text="Summarize Document" className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" />
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              AI-generated summary with chapter-wise breakdown
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 btn-glow-pulse"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        {!doc1 && (
          <MagicCard className="glass-effect border-primary/20">
            <CardContent className="py-8 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                No document selected for summarization.
              </p>
              <p className="text-xs text-muted-foreground">
                Go back and select a document first.
              </p>
            </CardContent>
          </MagicCard>
        )}

        {doc1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Document Info Card */}
            <MagicCard className="glass-effect border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                  >
                    <FileText className="h-5 w-5 text-blue-400" />
                  </motion.div>
                  <span>{doc1.name}</span>
                </CardTitle>
                <CardDescription>
                  Uploaded on {new Date(doc1.uploadDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </MagicCard>

            {/* Summary Display Card */}
            {summary && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MagicCard className="glass-effect border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        Summary & Chapter Analysis
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-2 btn-glow-pulse"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none max-h-[600px] overflow-y-auto p-4 bg-muted/50 rounded-lg border border-primary/10">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-2 text-blue-300" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-sm" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                        }}
                      >
                        {summary}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </MagicCard>
              </motion.div>
            )}

            {/* Error Message */}
            {error && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="glass-effect border-destructive/20 bg-destructive/5">
                  <CardContent className="py-4">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button
                      onClick={handleGenerateSummary}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Loading State */}
            {isGenerating && (
              <MagicCard className="glass-effect border-primary/20">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"
                      />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-medium text-lg">Generating summary...</p>
                      <p className="text-sm text-muted-foreground">
                        AI is analyzing your document
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </MagicCard>
            )}

            {/* Generate Button */}
            {!summary && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full btn-glow-pulse bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Summary
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
