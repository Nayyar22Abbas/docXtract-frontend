'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Copy, BookOpen, Sparkles } from 'lucide-react'
import { generateLiteratureReview, downloadPdf } from '@/lib/api/endpoints'
import { getUsername } from '@/lib/api/auth'
import ReactMarkdown from 'react-markdown'
import HoverLetters from '@/components/HoverLetters'
import MagicCard from '@/components/MagicCard'

export default function LiteratureReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents } = useDocuments()
  const abortControllerRef = useRef<AbortController | null>(null)

  const doc1Id = searchParams.get('doc1')
  const doc1 = documents.find(d => d.id === doc1Id)

  const [literatureReview, setLiteratureReview] = useState<string>('')
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

  // Auto-generate literature review when page loads with a document
  useEffect(() => {
    if (doc1 && !isGenerating && !literatureReview && !error) {
      handleGenerateReview()
    }
  }, [doc1])

  const handleGenerateReview = async () => {
    // Use only the selected document
    const allFiles: File[] = []
    
    // Add the selected document from document-processing
    if (doc1) {
      try {
        const pdfBlob = await downloadPdf(doc1.id)
        const file = new File([pdfBlob], doc1.name || 'document.pdf', { type: 'application/pdf' })
        allFiles.push(file)
      } catch (err) {
        setError('Failed to load selected document. Please try again.')
        return
      }
    }

    if (allFiles.length === 0) {
      setError('No document selected. Please go back and select a document.')
      return
    }

    const userId = getUsername()
    if (!userId) {
      setError('You must be logged in')
      return
    }

    abortControllerRef.current = new AbortController()
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateLiteratureReview(allFiles, userId, abortControllerRef.current.signal)
      
      // Check if the result contains an error message from the backend
      if (result.literature_review && result.literature_review.includes('⚠️')) {
        // It's a warning/error message from the backend
        setLiteratureReview(result.literature_review)
        setError(null)
      } else if (result.literature_review) {
        setLiteratureReview(result.literature_review)
        setError(null)
      } else {
        setError('No literature review was generated. Please try again.')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate literature review'
      setError(errorMsg)
      console.error('Literature review error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(literatureReview)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"
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
              <HoverLetters text="Literature Review" className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent" />
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Synthesize multiple research papers into a comprehensive review
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Selected Base Document */}
          {doc1 && (
            <MagicCard className="glass-effect border-primary/20 bg-indigo-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20"
                  >
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                  </motion.div>
                  Selected Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-indigo-500/20">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    {doc1.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This document will be included in the literature review analysis
                </p>
              </CardContent>
            </MagicCard>
          )}

          {/* Auto-generating review */}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="glass-effect border-destructive/20 bg-destructive/5">
                <CardContent className="py-4">
                  <p className="text-sm text-destructive mb-3">{error}</p>
                  <Button
                    onClick={handleGenerateReview}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
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
                      className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-indigo-500"
                    />
                    <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-medium text-lg">Generating literature review...</p>
                    <p className="text-sm text-muted-foreground">
                      Analyzing and synthesizing research papers
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-indigo-400"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </MagicCard>
          )}

          {/* Literature Review Display */}
          {literatureReview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <MagicCard className="glass-effect border-primary/20">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
                        <Sparkles className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle>Literature Review Synthesis</CardTitle>
                        <CardDescription>
                          Based on the selected document
                        </CardDescription>
                      </div>
                    </div>
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
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-2 text-indigo-300" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-sm" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                      }}
                    >
                      {literatureReview}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </MagicCard>
            </motion.div>
          )}

          {/* New Review Button */}
          {literatureReview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={() => {
                  setLiteratureReview('')
                  setError(null)
                }}
                variant="outline"
                className="w-full btn-glow-pulse"
              >
                Generate Another Review
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
