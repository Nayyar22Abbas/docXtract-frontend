'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Loader2, Copy, CheckCircle2, XCircle, Brain, Sparkles } from 'lucide-react'
import { generateQuizModel, getQuizSolution, downloadPdf } from '@/lib/api/endpoints'
import { getUsername } from '@/lib/api/auth'
import HoverLetters from '@/components/HoverLetters'
import MagicCard from '@/components/MagicCard'

interface MCQ {
  question: string
  options: string[]
  difficulty: string
}

interface ShortAnswer {
  question: string
  difficulty: string
}

interface TrueFalse {
  statement: string
}

interface QuizData {
  quiz_id: string
  document_type: string
  questions: {
    mcqs: MCQ[]
    short_answer: ShortAnswer[]
    true_false: TrueFalse[]
  }
}

interface Solution {
  quiz_id: string
  solutions: {
    mcqs: any[]
    short_answer: any[]
    true_false: any[]
  }
}

export default function QuizPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents } = useDocuments()
  const abortControllerRef = useRef<AbortController | null>(null)

  const doc1Id = searchParams.get('doc1')
  const doc1 = documents.find(d => d.id === doc1Id)

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [solution, setSolution] = useState<Solution | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingSolution, setIsLoadingSolution] = useState(false)
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
    if (!doc1 || quiz || isGenerating) return
    void handleGenerateQuiz()
  }, [doc1])

  const handleGenerateQuiz = async () => {
    if (!doc1) return

    abortControllerRef.current = new AbortController()

    const userId = getUsername()
    if (!userId) {
      setError('You must be logged in')
      return
    }

    setIsGenerating(true)
    setError(null)
    setQuiz(null)
    setSolution(null)
    setShowSolution(false)

    try {
      const pdfBlob = await downloadPdf(doc1.id)
      const file = new File([pdfBlob], doc1.name || 'document.pdf', { type: 'application/pdf' })

      const result = await generateQuizModel(file, 'Research Paper', userId, abortControllerRef.current.signal)
      setQuiz(result)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to generate quiz')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShowSolution = async () => {
    if (!quiz) return

    setIsLoadingSolution(true)
    setError(null)

    try {
      const result = await getQuizSolution(quiz.quiz_id, abortControllerRef.current?.signal)
      setSolution(result)
      setShowSolution(true)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch solution')
    } finally {
      setIsLoadingSolution(false)
    }
  }

  const handleCopyQuiz = () => {
    if (!quiz) return
    const text = formatQuizAsText(quiz)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatQuizAsText = (quizData: QuizData): string => {
    let text = `Quiz: ${quizData.document_type}\n\n`

    if (quizData.questions.mcqs.length > 0) {
      text += `MCQs:\n`
      quizData.questions.mcqs.forEach((q, i) => {
        text += `\n${i + 1}. ${q.question} (${q.difficulty})\n`
        q.options.forEach((opt, j) => {
          text += `   ${String.fromCharCode(65 + j)}) ${opt}\n`
        })
      })
    }

    if (quizData.questions.short_answer.length > 0) {
      text += `\n\nShort Answer Questions:\n`
      quizData.questions.short_answer.forEach((q, i) => {
        text += `\n${i + 1}. ${q.question} (${q.difficulty})\n`
      })
    }

    if (quizData.questions.true_false.length > 0) {
      text += `\n\nTrue/False Questions:\n`
      quizData.questions.true_false.forEach((q, i) => {
        text += `\n${i + 1}. ${q.statement}\n`
      })
    }

    return text
  }

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"
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
              <HoverLetters text="Quiz Generator" className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent" />
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Generate and solve quizzes from your documents
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
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
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
                    className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20"
                  >
                    <FileText className="h-5 w-5 text-orange-400" />
                  </motion.div>
                  {doc1.name}
                </CardTitle>
                <CardDescription>
                  Uploaded: {new Date(doc1.uploadDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </MagicCard>

            {/* Loading State */}
            {isGenerating && (
              <MagicCard className="glass-effect border-primary/20">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-orange-500"
                      />
                      <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-orange-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-medium text-lg">Generating quiz...</p>
                      <p className="text-sm text-muted-foreground">
                        AI is creating questions from your document
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full bg-orange-400"
                        />
                      ))}
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
                    onClick={handleGenerateQuiz}
                    variant="outline"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
              </motion.div>
            )}

            {/* Quiz Display */}
            {quiz && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MagicCard className="glass-effect border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                          <Brain className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                          <CardTitle>Generated Quiz</CardTitle>
                          <CardDescription>
                            Total Questions: {quiz.questions.mcqs.length + quiz.questions.short_answer.length + quiz.questions.true_false.length}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyQuiz}
                        className="gap-2 btn-glow-pulse"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* MCQs */}
                    {quiz.questions.mcqs.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                          Multiple Choice Questions
                        </h3>
                        {quiz.questions.mcqs.map((mcq, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-lg bg-muted/50 space-y-2 border border-primary/10 hover:border-orange-500/30 transition-colors"
                          >
                            <p className="font-medium text-sm">
                              {idx + 1}. {mcq.question}
                              <span className="ml-2 text-xs text-orange-400/80 px-2 py-0.5 rounded-full bg-orange-500/10">({mcq.difficulty})</span>
                            </p>
                            {mcq.options.map((option, optIdx) => (
                              <p key={optIdx} className="text-sm text-muted-foreground ml-4 py-1">
                                {String.fromCharCode(65 + optIdx)}) {option}
                              </p>
                            ))}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Short Answer */}
                    {quiz.questions.short_answer.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          Short Answer Questions
                        </h3>
                        {quiz.questions.short_answer.map((sa, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-lg bg-muted/50 space-y-2 border border-primary/10 hover:border-amber-500/30 transition-colors"
                          >
                            <p className="font-medium text-sm">
                              {idx + 1}. {sa.question}
                              <span className="ml-2 text-xs text-amber-400/80 px-2 py-0.5 rounded-full bg-amber-500/10">({sa.difficulty})</span>
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* True/False */}
                    {quiz.questions.true_false.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                          True/False Questions
                        </h3>
                        {quiz.questions.true_false.map((tf, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-lg bg-muted/50 space-y-2 border border-primary/10 hover:border-yellow-500/30 transition-colors"
                          >
                            <p className="font-medium text-sm">
                              {idx + 1}. {tf.statement}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Solution Button */}
                    <div className="pt-4 border-t border-primary/10">
                      <Button
                        onClick={handleShowSolution}
                        disabled={isLoadingSolution}
                        className="w-full btn-glow-pulse bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500"
                      >
                        {isLoadingSolution ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading Solution...
                        </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            View Solution
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </MagicCard>
              </motion.div>
            )}

            {/* Solution Display */}
            {showSolution && solution && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <MagicCard className="glass-effect border-green-500/30 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                        className="p-2 rounded-lg bg-green-500/20"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </motion.div>
                      Quiz Solution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* MCQ Solutions */}
                    {solution.solutions.mcqs.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          MCQ Answers
                        </h3>
                        {solution.solutions.mcqs.map((mcq, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-lg bg-muted/30 space-y-2 border border-green-500/20 hover:border-green-500/40 transition-colors"
                          >
                            <p className="font-medium text-sm">{idx + 1}. {mcq.question}</p>
                            <p className="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" /> Correct Answer: {mcq.correct_answer}
                            </p>
                            {mcq.explanation && (
                              <p className="text-xs text-muted-foreground mt-2 pl-6">
                                <strong>Explanation:</strong> {mcq.explanation}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Short Answer Solutions */}
                    {solution.solutions.short_answer.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          Short Answer Solutions
                        </h3>
                        {solution.solutions.short_answer.map((sa, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-lg bg-muted/30 space-y-2 border border-green-500/20 hover:border-green-500/40 transition-colors"
                          >
                            <p className="font-medium text-sm">{idx + 1}. {sa.question}</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {sa.expected_answer}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* True/False Solutions */}
                    {solution.solutions.true_false.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          True/False Answers
                        </h3>
                        {solution.solutions.true_false.map((tf, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-lg bg-muted/30 space-y-2 border border-green-500/20 hover:border-green-500/40 transition-colors"
                          >
                            <p className="font-medium text-sm">{idx + 1}. {tf.statement}</p>
                            <p className="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                              {tf.answer ? <><CheckCircle2 className="h-4 w-4" /> True</> : <><XCircle className="h-4 w-4 text-red-400" /> False</>}
                            </p>
                            {tf.explanation && (
                              <p className="text-xs text-muted-foreground mt-2 pl-6">
                                <strong>Explanation:</strong> {tf.explanation}
                              </p>
                            )}
                          </motion.div>
                        ))}
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
