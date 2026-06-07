import { useState } from 'react'
import { generateFlashcards, generateFlashcardsWithCitation } from '@/lib/api/endpoints'

export interface Flashcard {
  question: string
  answer: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  source_text?: string
}

interface UseFlashcardsReturn {
  flashcards: Flashcard[]
  loading: boolean
  error: string | null
  generateCards: (file: File, maxCards?: number, withCitation?: boolean) => Promise<void>
}

export function useFlashcards(): UseFlashcardsReturn {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCards = async (file: File, maxCards = 10, withCitation = true) => {
    setLoading(true)
    setError(null)

    try {
      let response

      if (withCitation) {
        response = await generateFlashcardsWithCitation(file, maxCards)
      } else {
        response = await generateFlashcards(file, maxCards)
      }

      // Parse the response
      if (response.flashcards && Array.isArray(response.flashcards)) {
        setFlashcards(response.flashcards)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate flashcards'
      setError(errorMessage)
      setFlashcards([])
    } finally {
      setLoading(false)
    }
  }

  return {
    flashcards,
    loading,
    error,
    generateCards,
  }
}
