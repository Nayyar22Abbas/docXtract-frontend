'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'

interface Flashcard {
  question: string
  answer: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  source_text?: string
}

interface FlashcardDisplayProps {
  cards: Flashcard[]
  onRate?: (cardIndex: number, rating: 'good' | 'hard') => void
}

export default function FlashcardDisplay({ cards, onRate }: FlashcardDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const currentCard = cards[currentIndex]

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300">
        <p className="text-slate-500 text-center">No flashcards to display</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Card */}
      <div
        className="perspective cursor-pointer h-80"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front - Question */}
          <motion.div
            animate={{ opacity: isFlipped ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-8 flex flex-col justify-between text-white shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              <p className="text-sm font-medium opacity-75 mb-4">Question</p>
              <p className="text-2xl font-bold">{currentCard.question}</p>
            </div>
            <p className="text-sm opacity-75">Click to reveal answer</p>
          </motion.div>

          {/* Back - Answer */}
          <motion.div
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-8 flex flex-col justify-between text-white shadow-lg"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div>
              <p className="text-sm font-medium opacity-75 mb-4">Answer</p>
              <p className="text-2xl font-bold">{currentCard.answer}</p>
            </div>
            <p className="text-sm opacity-75">Click to see question</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Citation */}
      {currentCard.source_text && isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-900 mb-2">Source:</p>
              <p className="text-sm text-amber-800 italic">&quot;{currentCard.source_text}&quot;</p>
            </div>
            <button
              onClick={() => copyToClipboard(currentCard.source_text || '', currentIndex)}
              className="flex-shrink-0 p-2 hover:bg-amber-200 rounded transition-colors"
              title="Copy source"
            >
              {copiedIndex === currentIndex ? (
                <Check className="w-5 h-5 text-amber-700" />
              ) : (
                <Copy className="w-5 h-5 text-amber-700" />
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          {currentCard.difficulty && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyColor(currentCard.difficulty)}`}>
              {currentCard.difficulty}
            </span>
          )}
          <span className="text-sm text-slate-600">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>
        <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 font-medium rounded-lg transition-colors"
        >
          ← Previous
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="px-6 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 font-medium rounded-lg transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Quick stats */}
      {cards.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{cards.length}</p>
            <p className="text-sm text-blue-700">Total Cards</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {cards.filter((c) => c.difficulty === 'Medium').length}
            </p>
            <p className="text-sm text-yellow-700">Medium</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">
              {cards.filter((c) => c.difficulty === 'Hard').length}
            </p>
            <p className="text-sm text-red-700">Hard</p>
          </div>
        </div>
      )}
    </div>
  )
}
