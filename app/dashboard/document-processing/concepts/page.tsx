'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, FileText, Loader2, Network, Sparkles, Search, RotateCcw } from 'lucide-react'
import { generateConceptGraph, downloadPdf, queryConceptGraph } from '@/lib/api/endpoints'
import { getUsername } from '@/lib/api/auth'
import ConceptGraphVisualizer from '@/components/ConceptGraphVisualizer'
import HoverLetters from '@/components/HoverLetters'
import MagicCard from '@/components/MagicCard'

interface Node {
  id: string
  label: string
  type: 'topic' | 'entity'
}

interface Link {
  source: string
  target: string
  relation: string
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

export default function ConceptGraphPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents } = useDocuments()
  const abortControllerRef = useRef<AbortController | null>(null)

  const doc1Id = searchParams.get('doc1')
  const doc1 = documents.find(d => d.id === doc1Id)

  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [originalGraphData, setOriginalGraphData] = useState<GraphData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isQuerying, setIsQuerying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Always abort pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    if (!doc1 || graphData || isGenerating) return
    void handleGenerateGraph()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [doc1])

  const handleGenerateGraph = async () => {
    if (!doc1) return

    abortControllerRef.current = new AbortController()

    const userId = getUsername()
    if (!userId) {
      setError('You must be logged in to generate concept graphs.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const pdfBlob = await downloadPdf(doc1.id)
      const file = new File([pdfBlob], doc1.name || 'document.pdf', { type: 'application/pdf' })

      const result = await generateConceptGraph(file, true, 10, abortControllerRef.current.signal)
      setGraphData(result.graph)
      setOriginalGraphData(result.graph)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to generate concept graph')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleQueryGraph = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doc1 || !searchQuery.trim()) return

    abortControllerRef.current = new AbortController()
    setIsQuerying(true)
    setError(null)

    try {
      // Pass the filename (not the id) because backend uses the filename to look up the triples
      const result = await queryConceptGraph(
        doc1.name || 'document.pdf',
        searchQuery,
        true,
        abortControllerRef.current.signal
      )
      setGraphData(result.graph)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to query concept graph')
    } finally {
      setIsQuerying(false)
    }
  }

  const handleResetGraph = () => {
    if (originalGraphData) {
      setGraphData(originalGraphData)
      setSearchQuery('')
    }
  }

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold">
              <HoverLetters text="Concept Graph" className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent" />
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Visualize key concepts and their relationships
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
              <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                No document selected for concept graph generation.
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
                    className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/20"
                  >
                    <FileText className="h-5 w-5 text-sky-400" />
                  </motion.div>
                  {doc1.name}
                </CardTitle>
                <CardDescription>
                  Uploaded on {new Date(doc1.uploadDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </MagicCard>

            {/* Graph Display */}
            {graphData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MagicCard className="glass-effect border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/20">
                        <Network className="h-5 w-5 text-sky-400" />
                      </div>
                      Concept Network
                    </CardTitle>
                    <CardDescription>
                      <span className="text-sky-400 font-medium">{graphData.nodes.length}</span> concepts, <span className="text-blue-400 font-medium">{graphData.links.length}</span> relationships
                      {searchQuery && !isQuerying && (
                        <span className="ml-2 text-xs italic text-muted-foreground">(Filtered view)</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search / Filter Form */}
                    <form onSubmit={handleQueryGraph} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Ask a question to dynamically update the graph... (e.g., 'How does X relate to Y?')"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                          disabled={isQuerying}
                        />
                      </div>
                      <Button type="submit" disabled={isQuerying || !searchQuery.trim()}>
                        {isQuerying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                      </Button>
                      {(searchQuery || graphData !== originalGraphData) && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleResetGraph}
                          disabled={isQuerying}
                          title="Reset Graph to Original"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </form>

                    {/* The Graph */}
                    <div className="border border-primary/10 rounded-xl overflow-hidden relative">
                      {isQuerying && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                            <span className="text-sm font-medium text-slate-700">Filtering Concept Graph...</span>
                          </div>
                        </div>
                      )}
                      <ConceptGraphVisualizer data={graphData} loading={false} />
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
                      onClick={handleGenerateGraph}
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
                        className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-sky-500"
                      />
                      <Network className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-sky-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-medium text-lg">Analyzing concepts...</p>
                      <p className="text-sm text-muted-foreground">
                        Mapping relationships from your document
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full bg-sky-400"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </MagicCard>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
