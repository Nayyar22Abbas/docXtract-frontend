import { useState } from 'react'
import { generateConceptGraph } from '@/lib/api/endpoints'

export interface Node {
  id: string
  label: string
  type: 'topic' | 'entity'
}

export interface Link {
  source: string
  target: string
  relation: string
}

export interface ConceptGraphData {
  pdf_name: string
  engine: 'Gemini API' | 'Local Mistral'
  graph: {
    nodes: Node[]
    links: Link[]
  }
}

interface UseConceptGraphReturn {
  graphData: ConceptGraphData | null
  loading: boolean
  error: string | null
  generateGraph: (file: File, useApi?: boolean, maxConcepts?: number) => Promise<void>
}

export function useConceptGraph(): UseConceptGraphReturn {
  const [graphData, setGraphData] = useState<ConceptGraphData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateGraph = async (file: File, useApi = true, maxConcepts = 10) => {
    setLoading(true)
    setError(null)

    try {
      const response = await generateConceptGraph(file, useApi, maxConcepts)

      if (response && response.graph) {
        setGraphData(response)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate concept graph'
      setError(errorMessage)
      setGraphData(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    graphData,
    loading,
    error,
    generateGraph,
  }
}
