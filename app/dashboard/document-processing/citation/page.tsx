'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Loader2, Copy, RotateCcw, ChevronLeft, ChevronRight, Layers, Sparkles } from 'lucide-react'
import { generateFlashcardsWithCitation, downloadPdf } from '@/lib/api/endpoints'
import { getUsername } from '@/lib/api/auth'
import HoverLetters from '@/components/HoverLetters'
import MagicCard from '@/components/MagicCard'

interface Flashcard {
  question: string
  answer: string
  citation?: string
  difficulty?: string
}

export default function FlashcardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents } = useDocuments()
  const abortControllerRef = useRef<AbortController | null>(null)

  const doc1Id = searchParams.get('doc1')
  const doc1 = documents.find(d => d.id === doc1Id)

  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Always abort pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    if (!doc1 || flashcards.length > 0 || isGenerating) return
    void handleGenerateFlashcards()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [doc1])

  const handleGenerateFlashcards = async () => {
    if (!doc1) return

    abortControllerRef.current = new AbortController()

    const userId = getUsername()
    if (!userId) {
      setError('You must be logged in to generate flashcards.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const pdfBlob = await downloadPdf(doc1.id)
      const file = new File([pdfBlob], doc1.name || 'document.pdf', { type: 'application/pdf' })

      const result = await generateFlashcardsWithCitation(file, 10, abortControllerRef.current.signal)
      setFlashcards(result.flashcards || result)
      setCurrentCard(0)
      setIsFlipped(false)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (flashcards.length === 0) return
    const card = flashcards[currentCard]
    const text = `Q: ${card.question}\nA: ${card.answer}${card.citation ? `\nCitation: ${card.citation}` : ''}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % flashcards.length)
    setIsFlipped(false)
  }

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    setIsFlipped(false)
  }

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
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
              <HoverLetters text="Flashcards" className="bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent" />
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              AI-generated flashcards with citations from your document
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
              <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                No document selected for flashcard generation.
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
                    className="p-2 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20"
                  >
                    <FileText className="h-5 w-5 text-fuchsia-400" />
                  </motion.div>
                  {doc1.name}
                </CardTitle>
                <CardDescription>
                  Uploaded on {new Date(doc1.uploadDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </MagicCard>

            {/* Flashcards Display */}
            {flashcards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MagicCard className="glass-effect border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20">
                          <Layers className="h-5 w-5 text-fuchsia-400" />
                        </div>
                        <div>
                          <CardTitle>Flashcards</CardTitle>
                          <CardDescription>
                            Card {currentCard + 1} of {flashcards.length}
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
                  <CardContent className="space-y-6">
                    {/* Flashcard */}
                    <motion.div
                      onClick={() => setIsFlipped(!isFlipped)}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
                    className="h-80 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 border-2 border-fuchsia-500/20 rounded-2xl p-8 flex flex-col justify-center items-center cursor-pointer relative shadow-xl hover:shadow-fuchsia-500/20 transition-shadow"
                    >
                      <div className="text-center space-y-4" style={{ transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)' }}>
                        <p className="text-sm font-semibold text-fuchsia-400">
                          {isFlipped ? 'Answer' : 'Question'}
                        </p>
                        <p className="text-2xl font-bold leading-relaxed">
                          {isFlipped ? flashcards[currentCard].answer : flashcards[currentCard].question}
                        </p>
                        {isFlipped && flashcards[currentCard].citation && (
                          <p className="text-xs text-muted-foreground pt-4 border-t border-fuchsia-500/20 mt-4">
                            📌 {flashcards[currentCard].citation}
                          </p>
                        )}
                      </div>
                      <motion.p 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-4 right-4 text-xs text-fuchsia-400/70"
                      >
                        Click to flip
                      </motion.p>
                    </motion.div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                      <Button
                        onClick={prevCard}
                        variant="outline"
                        size="lg"
                        disabled={flashcards.length <= 1}
                        className="flex-1 btn-glow-pulse"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        onClick={nextCard}
                        variant="outline"
                        size="lg"
                        disabled={flashcards.length <= 1}
                        className="flex-1 btn-glow-pulse"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-r from-fuchsia-500 to-pink-500 h-2 rounded-full"
                      />
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
                      onClick={handleGenerateFlashcards}
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
                        className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-fuchsia-500"
                      />
                      <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-fuchsia-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-medium text-lg">Generating flashcards...</p>
                      <p className="text-sm text-muted-foreground">
                        Creating study cards from your document
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full bg-fuchsia-400"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </MagicCard>
            )}

            {/* Generate Button */}
            {flashcards.length === 0 && !isGenerating && !error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  onClick={handleGenerateFlashcards}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full btn-glow-pulse bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Flashcards
                </Button>
              </motion.div>
            )}

            {/* Regenerate Button */}
            {flashcards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  onClick={handleGenerateFlashcards}
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 btn-glow-pulse"
                >
                  <RotateCcw className="h-4 w-4" />
                  Generate New Flashcards
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
