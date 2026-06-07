'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Loader2, Copy, Edit2, CheckCircle2, ListChecks, Sparkles } from 'lucide-react'
import { generateMcqs, downloadPdf } from '@/lib/api/endpoints'
import HoverLetters from '@/components/HoverLetters'
import MagicCard from '@/components/MagicCard'

interface MCQ {
  question: string
  options: string[]
  correct_answer: string | number
}

export default function McqPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents } = useDocuments()
  const abortControllerRef = useRef<AbortController | null>(null)

  const doc1Id = searchParams.get('doc1')
  const doc1 = documents.find(d => d.id === doc1Id)

  const [mcqs, setMcqs] = useState<MCQ[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | number }>({})
  const [showAnswers, setShowAnswers] = useState(false)
  
  // Fixed to 10 MCQs for resource optimization
  const NUM_MCQS = 10

  // Always abort pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Auto-generate MCQs when page loads with a document
  useEffect(() => {
    if (doc1 && !isGenerating && mcqs.length === 0 && !error) {
      handleGenerateMcqs()
    }
  }, [doc1])

  const handleGenerateMcqs = async () => {
    if (!doc1) return

    abortControllerRef.current = new AbortController()

    setIsGenerating(true)
    setError(null)
    setMcqs([])
    setSelectedAnswers({})
    setShowAnswers(false)

    try {
      const pdfBlob = await downloadPdf(doc1.id)
      const file = new File([pdfBlob], doc1.name || 'document.pdf', { type: 'application/pdf' })

      // Create a timeout promise (10 minutes for MCQ generation with local model)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after 10 minutes. The model is taking too long. Try with fewer MCQs (3-5).')), 600000)
      )

      const result = await Promise.race([
        generateMcqs(file, NUM_MCQS, abortControllerRef.current.signal),
        timeoutPromise
      ])
      
      console.log('MCQ Response:', result) // Debug log
      
      // Handle both array and object responses
      let mcqsList = Array.isArray(result) ? result : (result?.mcqs || [])
      
      if (!Array.isArray(mcqsList)) {
        console.error('Invalid MCQ format:', mcqsList)
        setError('Invalid response format from server')
        return
      }
      
      if (mcqsList.length === 0) {
        setError('No MCQs generated. The model may have failed to generate valid questions. Try with fewer MCQs (5-10).')
        return
      }
      
      // Filter valid MCQs
      const validMcqs = mcqsList.filter(
        (mcq: any) =>
          typeof mcq === 'object' &&
          mcq.question &&
          typeof mcq.question === 'string' &&
          mcq.options &&
          Array.isArray(mcq.options) &&
          mcq.options.length >= 2 &&
          (mcq.correct_answer !== undefined && mcq.correct_answer !== null)
      ) as MCQ[]
      
      console.log('Filtered MCQs:', validMcqs) // Debug log
      
      if (validMcqs.length === 0) {
        setError('No valid MCQs found in response. The model may need adjustment. Try with fewer MCQs (5-10).')
        return
      }
      
      setMcqs(validMcqs)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      console.error('MCQ Generation Error:', err) // Debug log
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate MCQs'
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyMcqs = () => {
    const text = mcqs
      .map(
        (mcq, idx) =>
          `${idx + 1}. ${mcq.question}\n${mcq.options.map((opt, i) => `   ${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}`
      )
      .join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSelectAnswer = (questionIdx: number, answerIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIdx]: answerIdx,
    }))
  }

  const calculateScore = () => {
    let correct = 0
    mcqs.forEach((mcq, idx) => {
      if (selectedAnswers[idx] === mcq.correct_answer || selectedAnswers[idx] === mcq.options[mcq.correct_answer as number]) {
        correct++
      }
    })
    return { correct, total: mcqs.length, percentage: Math.round((correct / mcqs.length) * 100) }
  }

  const score = showAnswers ? calculateScore() : null

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl"
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
              <HoverLetters text="MCQ Generator" className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent" />
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Create and practice multiple choice questions
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
            <CardContent className="py-8 text-center">
              <ListChecks className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Please select a document first
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
            {/* Document Info */}
            <MagicCard className="glass-effect border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20"
                  >
                    <FileText className="h-5 w-5 text-pink-400" />
                  </motion.div>
                  {doc1.name}
                </CardTitle>
                <CardDescription>
                  Uploaded: {new Date(doc1.uploadDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </MagicCard>

            {/* MCQ Settings - Removed, now auto-generates 10 MCQs */}

            {/* Loading State */}
            {isGenerating && (
              <MagicCard className="glass-effect border-primary/20">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-pink-500"
                      />
                      <ListChecks className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-pink-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-medium text-lg">Generating {NUM_MCQS} MCQs...</p>
                      <p className="text-sm text-muted-foreground">
                        Please wait, this may take 2-5 minutes
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full bg-pink-400"
                        />
                      ))}
                    </div>
                    <div className="pt-4 space-y-2 max-w-md text-center">
                      <p className="text-xs text-muted-foreground">
                        💡 AI model is analyzing your document...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </MagicCard>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="glass-effect border-destructive/20 bg-destructive/5">
                  <CardContent className="py-4">
                    <p className="text-sm text-destructive mb-3">{error}</p>
                    <Button
                      onClick={handleGenerateMcqs}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* MCQs Display - Only show when mcqs are loaded and no error */}
            {mcqs.length > 0 && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MagicCard className="glass-effect border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20">
                          <ListChecks className="h-5 w-5 text-pink-400" />
                        </div>
                        <div>
                          <CardTitle>Generated MCQs</CardTitle>
                          <CardDescription>
                            Total: {mcqs.length} questions
                            {showAnswers && (
                              <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                                Score: {score?.correct}/{score?.total} ({score?.percentage}%)
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyMcqs}
                          className="gap-2 btn-glow-pulse"
                        >
                          <Copy className="h-4 w-4" />
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMcqs([])
                            setShowAnswers(false)
                            setSelectedAnswers({})
                          }}
                          className="btn-glow-pulse"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {mcqs.map((mcq, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 rounded-lg bg-muted/50 space-y-3 border border-primary/10 hover:border-pink-500/30 transition-colors"
                      >
                        <p className="font-medium">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 text-sm mr-2">{idx + 1}</span>
                          {mcq.question}
                        </p>
                        <div className="space-y-2 pl-8">
                          {mcq.options.map((option, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                selectedAnswers[idx] === optIdx
                                  ? 'bg-pink-500/20 border border-pink-500/50'
                                  : 'hover:bg-muted border border-transparent'
                              } ${
                                showAnswers &&
                                (optIdx === mcq.correct_answer ||
                                  option === mcq.correct_answer)
                                  ? 'bg-green-500/20 border border-green-500/50'
                                  : showAnswers &&
                                      selectedAnswers[idx] === optIdx &&
                                      optIdx !== mcq.correct_answer
                                  ? 'bg-red-500/20 border border-red-500/50'
                                  : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${idx}`}
                                checked={selectedAnswers[idx] === optIdx}
                                onChange={() => handleSelectAnswer(idx, optIdx)}
                                disabled={showAnswers}
                                className="cursor-pointer accent-pink-500"
                              />
                              <span className="text-sm">{option}</span>
                              {showAnswers &&
                                optIdx === mcq.correct_answer && (
                                  <span className="text-xs text-green-600 dark:text-green-400 ml-auto flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Correct
                                  </span>
                                )}
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    ))}

                    {/* Submit Button */}
                    {!showAnswers && Object.keys(selectedAnswers).length === mcqs.length && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Button
                          onClick={() => setShowAnswers(true)}
                          className="w-full btn-glow-pulse bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Submit Answers
                        </Button>
                      </motion.div>
                    )}

                    {showAnswers && (
                      <div className="space-y-3 pt-4 border-t border-primary/10">
                        <Button
                          onClick={() => {
                            setShowAnswers(false)
                            setSelectedAnswers({})
                          }}
                          className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500"
                        >
                          Reset Answers
                        </Button>
                        <Button
                          onClick={() => {
                            setMcqs([])
                            setShowAnswers(false)
                            setSelectedAnswers({})
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Generate New MCQs
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </MagicCard>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
