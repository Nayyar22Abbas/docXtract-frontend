'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FileText,
  BookOpen,
  MessageSquare,
  GitBranch,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Brain,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MagicCard from '@/components/MagicCard'
import HoverLetters from '@/components/HoverLetters'

export type ProcessType =
  | 'summarize'
  | 'comparison'
  | 'literature-review'
  | 'quiz'
  | 'chat'
  | 'mcq'
  | 'citation'
  | 'concepts'

interface ProcessCardsProps {
  selectedDocIds?: string[]
  onCardClick?: (type: ProcessType) => void
}

interface ProcessCard {
  id: ProcessType
  title: string
  description: string
  icon: React.ReactNode
  color: string
  path: string
  requiresMultipleDocs: boolean
  requiresAnyDocument?: boolean
}

const PROCESS_CARDS: ProcessCard[] = [
  {
    id: 'summarize',
    title: 'Summarize Document',
    description: 'Generate summary + chapter-wise summaries',
    icon: <FileText className="h-8 w-8" />,
    color: 'from-blue-500 to-blue-600',
    path: '/dashboard/document-processing/summarize',
    requiresMultipleDocs: false,
    requiresAnyDocument: true,
  },
  {
    id: 'chat',
    title: 'PDF Chat',
    description: 'Ask questions about your document',
    icon: <MessageSquare className="h-8 w-8" />,
    color: 'from-green-500 to-green-600',
    path: '/dashboard/document-processing/chat',
    requiresMultipleDocs: false,
    requiresAnyDocument: true,
  },
  {
    id: 'quiz',
    title: 'Generate Quiz',
    description: 'Generate and solve quizzes from documents',
    icon: <BookOpen className="h-8 w-8" />,
    color: 'from-teal-500 to-teal-600',
    path: '/dashboard/document-processing/quiz',
    requiresMultipleDocs: false,
    requiresAnyDocument: true,
  },
  {
    id: 'mcq',
    title: 'Generate MCQs',
    description: 'Create multiple choice questions from content',
    icon: <BarChart3 className="h-8 w-8" />,
    color: 'from-purple-500 to-purple-600',
    path: '/dashboard/document-processing/mcq',
    requiresMultipleDocs: false,
    requiresAnyDocument: true,
  },
  {
    id: 'literature-review',
    title: 'Literature Review',
    description: 'Synthesize multiple research papers',
    icon: <GitBranch className="h-8 w-8" />,
    color: 'from-orange-500 to-orange-600',
    path: '/dashboard/document-processing/literature-review',
    requiresMultipleDocs: false,
    requiresAnyDocument: true,
  },
  {
    id: 'comparison',
    title: 'Compare Documents',
    description: 'Compare two documents side by side',
    icon: <Lightbulb className="h-8 w-8" />,
    color: 'from-pink-500 to-pink-600',
    path: '/dashboard/document-processing/comparison',
    requiresMultipleDocs: true,
    requiresAnyDocument: true,
  },
  {
    id: 'citation',
    title: 'Generate Flashcards',
    description: 'Create flashcards with citations from PDFs',
    icon: <BookOpen className="h-8 w-8" />,
    color: 'from-indigo-500 to-indigo-600',
    path: '/dashboard/document-processing/citation',
    requiresMultipleDocs: false,
    requiresAnyDocument: true,
  },
  {
    id: 'concepts',
    title: 'Concept Graph',
    description: 'Visualize concepts and relationships',
    icon: <Brain className="h-8 w-8" />,
    color: 'from-cyan-500 to-cyan-600',
    path: '/dashboard/document-processing/concepts',
    requiresMultipleDocs: false,
    requiresAnyDocument: true,
  },
]

export function ProcessCards({ selectedDocIds = [], onCardClick }: ProcessCardsProps) {
  const router = useRouter()

  const handleCardClick = (card: ProcessCard) => {
    // Check if card requires documents
    if (card.requiresAnyDocument && selectedDocIds.length === 0) {
      alert('Please select a document first')
      return
    }

    // Check if card requires multiple docs
    if (card.requiresMultipleDocs && selectedDocIds.length < 2) {
      alert('Please select 2 documents for comparison')
      return
    }

    onCardClick?.(card.id)

    // Navigate with document IDs as query params
    const params = new URLSearchParams()
    selectedDocIds.forEach((id, index) => {
      params.append(`doc${index + 1}`, id)
    })
    router.push(`${card.path}?${params.toString()}`)
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const exactlyTwoSelected = selectedDocIds.length === 2

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          <HoverLetters text="Available Processes" />
        </h2>
        <p className="text-muted-foreground">
          {exactlyTwoSelected
            ? 'Two documents selected: only comparison is available.'
            : 'Select a process to analyze your document'}
          {selectedDocIds.length > 0 && ` (${selectedDocIds.length} selected)`}
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {PROCESS_CARDS.map((card) => {
          const isDisabled = exactlyTwoSelected
            ? card.id !== 'comparison'
            : (card.requiresMultipleDocs && selectedDocIds.length < 2) ||
              (card.requiresAnyDocument && selectedDocIds.length === 0)

          return (
            <motion.div 
              key={card.id} 
              variants={fadeInUp}
              whileHover={isDisabled ? {} : { y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MagicCard 
                enableBorderGlow={!isDisabled} 
                enableSpotlight={!isDisabled}
                clickEffect={!isDisabled}
              >
                <Card
                  className={`glass-effect border-transparent h-full cursor-pointer transition-all duration-300 ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isDisabled && handleCardClick(card)}
                >
                  <CardHeader>
                    <motion.div 
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${card.color} w-fit shadow-lg`}
                      whileHover={isDisabled ? {} : { rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-white">{card.icon}</div>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <CardTitle className="text-xl">
                        {isDisabled ? card.title : <HoverLetters text={card.title} />}
                      </CardTitle>
                      <CardDescription className="mt-2">{card.description}</CardDescription>
                    </div>

                    {card.requiresMultipleDocs && (
                      <motion.p 
                        className="flex items-center gap-1.5 text-xs font-medium text-yellow-600 dark:text-yellow-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Requires 2 documents
                      </motion.p>
                    )}

                    <div className="flex items-center gap-2 text-primary text-sm font-medium pt-2">
                      {isDisabled
                        ? exactlyTwoSelected && card.id !== 'comparison'
                          ? 'Only comparison is available with 2 documents'
                          : card.requiresAnyDocument
                          ? 'Select document to start'
                          : 'Start process'
                        : 'Start process'}
                      <motion.span
                        animate={isDisabled ? {} : { x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                    </div>
                  </CardContent>
                </Card>
              </MagicCard>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
