'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BarChart3, Loader2, Copy, GitCompare, Sparkles, FileText } from 'lucide-react'
import { comparePdfs, downloadPdf } from '@/lib/api/endpoints'
import { getUsername } from '@/lib/api/auth'
import ReactMarkdown from 'react-markdown'
import HoverLetters from '@/components/HoverLetters'
import MagicCard from '@/components/MagicCard'

export default function ComparisonPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents } = useDocuments()

  const [isComparing, setIsComparing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comparison, setComparison] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const doc1Id = searchParams.get('doc1')
  const doc2Id = searchParams.get('doc2')
  const doc1 = documents.find(d => d.id === doc1Id)
  const doc2 = documents.find(d => d.id === doc2Id)

  const handleCompare = async () => {
    if (!doc1 || !doc2) return

    setError(null)
    setComparison('')
    setIsComparing(true)

    try {
      const userId = getUsername()
      if (!userId) {
        setError('You must be logged in to compare documents.')
        setIsComparing(false)
        return
      }

      // Download both PDFs
      const blob1 = await downloadPdf(doc1.id)
      const blob2 = await downloadPdf(doc2.id)

      const file1 = new File([blob1], doc1.name || 'document1.pdf', { type: 'application/pdf' })
      const file2 = new File([blob2], doc2.name || 'document2.pdf', { type: 'application/pdf' })

      // Compare documents
      const result = await comparePdfs(file1, file2, userId)
      setComparison(result.comparison_summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare documents')
    } finally {
      setIsComparing(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(comparison)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"
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
              <HoverLetters text="Compare Documents" className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent" />
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Analyze differences and similarities between two PDFs
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

        {doc1 && doc2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MagicCard className="glass-effect border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20"
                    >
                      <FileText className="h-5 w-5 text-cyan-400" />
                    </motion.div>
                    Document 1
                  </CardTitle>
                  <CardDescription className="truncate">{doc1.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {new Date(doc1.uploadDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </MagicCard>

              <MagicCard className="glass-effect border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20"
                    >
                      <FileText className="h-5 w-5 text-teal-400" />
                    </motion.div>
                    Document 2
                  </CardTitle>
                  <CardDescription className="truncate">{doc2.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {new Date(doc2.uploadDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </MagicCard>
            </div>

            {/* Comparison Button & Results */}
            <MagicCard className="glass-effect border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-cyan-400" />
                  Comparison Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!comparison && !isComparing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      onClick={handleCompare}
                      disabled={isComparing}
                      size="lg"
                      className="w-full btn-glow-pulse bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Comparison
                    </Button>
                  </motion.div>
                )}

                {isComparing && (
                  <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-cyan-500"
                      />
                      <GitCompare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-medium text-lg">Analyzing documents...</p>
                      <p className="text-sm text-muted-foreground">
                        Comparing content and structure
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full bg-cyan-400"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-lg bg-destructive/10 text-sm text-destructive border border-destructive/20"
                  >
                    {error}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleCompare}
                    >
                      Try Again
                    </Button>
                  </motion.div>
                )}

                {comparison && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-end">
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
                    <div className="prose prose-invert max-w-none max-h-[500px] overflow-y-auto p-4 bg-muted/50 rounded-lg border border-primary/10">
                      <ReactMarkdown
                        components={{
                          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-4 mb-2 text-cyan-300" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-3 mb-2" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-2 leading-relaxed text-sm" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                        }}
                      >
                        {comparison}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </MagicCard>
          </motion.div>
        )}

        {(!doc1 || !doc2) && (
          <MagicCard className="glass-effect border-primary/20">
            <CardContent className="py-8 text-center">
              <GitCompare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Please select 2 documents to compare
              </p>
            </CardContent>
          </MagicCard>
        )}
      </div>
    </div>
  )
}
