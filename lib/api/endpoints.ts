/**
 * API Endpoints and utilities for all document processing features
 */

import { API_BASE, authHeaders, getUsername } from './auth'

// ============================================================================
// 1. SUMMARIZE PDF (Combined - Summary + Chapter-wise)
// ============================================================================
export async function summarizePdfCombined(file: File, userId?: string, signal?: AbortSignal) {
  const formData = new FormData()
  formData.append('file', file)
  if (userId) formData.append('user_id', userId)

  const response = await fetch(`${API_BASE}/summary/summarize-pdf-combined/`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to generate summary')
  }

  return response.json()
}

// Response structure:
// {
//   "file_info": {
//     "filename": string,
//     "saved_path": string
//   },
//   "combined_summary": string, // Full markdown text with # Summary and ## Chapter-wise sections
//   "structured_data": {
//     "general_summary": string,
//     "chapters": {
//       "[chapter_title]": string, // Summary for each chapter
//       ...
//     }
//   }
// }

// ============================================================================
// 2. COMPARE PDFS
// ============================================================================
export async function comparePdfs(file1: File, file2: File, userId?: string, signal?: AbortSignal) {
  const formData = new FormData()
  formData.append('file1', file1)
  formData.append('file2', file2)
  if (userId) formData.append('user_id', userId)

  const response = await fetch(`${API_BASE}/ppdfcomparison/compare-pdfs/`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to compare PDFs')
  }

  return response.json()
}

// Response structure:
// {
//   "files_info": [
//     {
//       "filename": string,
//       "saved_path": string
//     },
//     {
//       "filename": string,
//       "saved_path": string
//     }
//   ],
//   "comparison_summary": string // Markdown formatted comparison
// }

// ============================================================================
// 3. LITERATURE REVIEW (Multiple PDFs)
// ============================================================================
export async function generateLiteratureReview(files: File[], userId?: string, signal?: AbortSignal) {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  if (userId) formData.append('user_id', userId)

  const response = await fetch(`${API_BASE}/lit-review/generate-lit-review/`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to generate literature review')
  }

  return response.json()
}

// Response structure:
// {
//   "files_processed": [
//     {
//       "filename": string,
//       "saved_path": string
//     },
//     ...
//   ],
//   "literature_review": string // Markdown with Thematic Analysis, Synthesis, Research Gaps, Future Work
// }

// ============================================================================
// 4. QUIZ GENERATION (Using Gemini API)
// ============================================================================
export async function generateQuizModel(file: File, documentType?: string, userId?: string, signal?: AbortSignal) {
  const formData = new FormData()
  formData.append('file', file)
  if (documentType) formData.append('document_type', documentType)
  if (userId) formData.append('user_id', userId)

  const response = await fetch(`${API_BASE}/v1/quiz/generate`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to generate quiz')
  }

  return response.json()
}

// Response structure:
// {
//   "quiz_id": string, // MongoDB ObjectId as string
//   "document_type": string,
//   "questions": {
//     "mcqs": [
//       {
//         "question": string,
//         "options": string[],
//         "difficulty": "Easy" | "Medium" | "Hard"
//       },
//       ...
//     ],
//     "short_answer": [
//       {
//         "question": string,
//         "difficulty": "Easy" | "Medium" | "Hard"
//       },
//       ...
//     ],
//     "true_false": [
//       {
//         "statement": string
//       },
//       ...
//     ]
//   }
// }

// ============================================================================
// 5. GET QUIZ SOLUTION
// ============================================================================
export async function getQuizSolution(quizId: string, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE}/v1/quiz/solution/${quizId}`, {
    method: 'GET',
    headers: authHeaders(),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to fetch quiz solution')
  }

  return response.json()
}

// Response structure:
// {
//   "quiz_id": string,
//   "solutions": {
//     "mcqs": [
//       {
//         "question": string,
//         "options": string[],
//         "correct_answer": string,
//         "difficulty": string,
//         "explanation": string
//       },
//       ...
//     ],
//     "short_answer": [
//       {
//         "question": string,
//         "expected_answer": string,
//         "difficulty": string
//       },
//       ...
//     ],
//     "true_false": [
//       {
//         "statement": string,
//         "answer": boolean,
//         "explanation": string
//       },
//       ...
//     ]
//   }
// }

// ============================================================================
// 6. PDF CHAT
// ============================================================================
export async function chatWithPdf(pdfId: string, question: string, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE}/pdfchat/chat-pdf/${pdfId}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to get answer')
  }

  return response.json()
}

// Response structure:
// {
//   "answer": string // AI-generated answer based on PDF content
// }

// ============================================================================
// 7. MCQ GENERATION
// ============================================================================
export async function generateMcqs(file: File, totalMcqs: number, signal?: AbortSignal) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('total_mcqs', totalMcqs.toString())

  const response = await fetch(`${API_BASE}/mcqgeneration/generate-mcqs/`, {
    method: 'POST',
    headers: {
      // Only include Authorization, let FormData handle Content-Type
      ...authHeaders(),
    },
    body: formData,
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to generate MCQs')
  }

  return response.json()
}

// Response structure:
// {
//   "filename": string,
//   "requested_mcqs_per_chunk": number,
//   "total_chunks": number,
//   "mcqs": [
//     {
//       "question": string,
//       "options": string[],
//       "correct_answer": string | number
//     } | string, // Could be raw text if JSON parsing fails
//     ...
//   ]
// }

// ============================================================================
// 8. PDF MANAGEMENT
// ============================================================================

export async function downloadPdf(pdfId: string, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE}/pdfdownload/download-pdf/${pdfId}`, {
    method: 'GET',
    headers: authHeaders(),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to download PDF')
  }

  return response.blob()
}

export async function listPdfs(userId: string) {
  const response = await fetch(`${API_BASE}/list/list-pdfs/${userId}`, {
    method: 'GET',
    headers: authHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to fetch PDFs')
  }

  return response.json()
}

// Response structure:
// {
//   "documents": [
//     {
//       "id": string,
//       "original_name": string,
//       "saved_path": string,
//       "upload_time": string (ISO datetime)
//     },
//     ...
//   ]
// }

export async function deletePdf(pdfId: string) {
  const response = await fetch(`${API_BASE}/deletepdf/pdf/${pdfId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to delete PDF')
  }

  return response.json()
}

// Response structure:
// {
//   "message": "PDF deleted successfully",
//   "pdf_id": string
// }

// ============================================================================
// 9. FLASHCARDS GENERATION
// ============================================================================
export async function generateFlashcards(file: File, maxCards?: number, signal?: AbortSignal) {
  const formData = new FormData()
  formData.append('file', file)
  if (maxCards) formData.append('max_cards', maxCards.toString())

  const response = await fetch(`${API_BASE}/flashcard/generate-flashcards/`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to generate flashcards')
  }

  return response.json()
}

// Response structure:
// {
//   "flashcards": [
//     {
//       "question": string,
//       "answer": string,
//       "difficulty": "Easy" | "Medium" | "Hard"
//     },
//     ...
//   ]
// }

// ============================================================================
// 10. FLASHCARDS WITH CITATION (Gemini-provided source text)
// ============================================================================
export async function generateFlashcardsWithCitation(file: File, maxCards?: number, signal?: AbortSignal) {
  const formData = new FormData()
  formData.append('file', file)
  if (maxCards) formData.append('max_cards', maxCards.toString())

  const response = await fetch(`${API_BASE}/flashcardwithcitation/generate-flashcards/`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to generate flashcards with citation')
  }

  return response.json()
}

// Response structure:
// {
//   "model": "Gemini-2.5-Flash",
//   "total_flashcards": number,
//   "flashcards": [
//     {
//       "question": string,
//       "answer": string,
//       "difficulty": "Easy" | "Medium" | "Hard",
//       "source_text": string // Direct quote from PDF
//     },
//     ...
//   ]
// }

// ============================================================================
// 11. CONCEPT GRAPH / INSIGHT GENERATION
// ============================================================================
export async function generateConceptGraph(
  file: File,
  useApi?: boolean,
  maxConcepts?: number,
  signal?: AbortSignal
) {
  const formData = new FormData()
  formData.append('file', file)
  if (useApi !== undefined) formData.append('use_api', useApi.toString())
  if (maxConcepts) formData.append('max_concepts', maxConcepts.toString())

  const response = await fetch(`${API_BASE}/insight/v2/concept-graph/`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to generate concept graph')
  }

  return response.json()
}

// Response structure:
// {
//   "pdf_name": string,
//   "engine": "Gemini API" | "Local Mistral",
//   "graph": {
//     "nodes": [
//       {
//         "id": string,
//         "label": string,
//         "type": "topic" | "entity"
//       },
//       ...
//     ],
//     "links": [
//       {
//         "source": string,
//         "target": string,
//         "relation": string
//       },
//       ...
//     ]
//   }
// }

export async function queryConceptGraph(
  pdfName: string,
  query: string,
  useApi: boolean = false,
  signal?: AbortSignal
) {
  const response = await fetch(`${API_BASE}/insight/v2/concept-graph/query/`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdf_name: pdfName,
      query: query,
      use_api: useApi,
    }),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to query concept graph')
  }

  return response.json()
}

// ============================================================================
// 12. STUDY RECOMMENDATIONS - AUTO (Uses historical data)
// ============================================================================
export async function getAutoRecommendation(userId: string, includeAnalysis?: boolean, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE}/api/auto-recommendation`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      include_analysis: includeAnalysis !== false,
    }),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to generate recommendation')
  }

  return response.json()
}

// Response structure:
// {
//   "success": boolean,
//   "data_source": "MongoDB (Auto-Aggregated from User History)",
//   "recommendation": {
//     "priority_subject": string,
//     "recommended_topic": string,
//     "recommended_daily_study_minutes": string,
//     "reasoning": string,
//     "motivation_message": string,
//     "generated_at": string
//   },
//   "predictive_insights": {
//     "quiz_trend": string,
//     "average_quiz_score": number,
//     "score_improvement": number,
//     "study_consistency": string,
//     "quizzes_analyzed": number,
//     "previous_recommendations_analyzed": number,
//     "subjects_enrolled": number,
//     "weak_areas_identified": number
//   },
//   "status": string
// }

// ============================================================================
// 13. STUDENT PROFILE / ANALYSIS
// ============================================================================
export async function getStudentProfile(userId: string, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE}/api/student-profile/${userId}`, {
    method: 'GET',
    headers: authHeaders(),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to fetch student profile')
  }

  return response.json()
}

// Response structure:
// {
//   "success": boolean,
//   "student_profile": {
//     "user_id": string,
//     "enrolled_subjects": string[],
//     "quiz_trends": {
//       "trend": string,
//       "average_score": number,
//       "improvement": number,
//       "consistency": string,
//       "recent_scores": number[]
//     },
//     "weak_topics": [string, number][],
//     "study_time_pattern": {
//       "average_daily_study_minutes": number,
//       "pattern": string,
//       "max_observed": number,
//       "min_observed": number
//     },
//     "upcoming_exams": string[]
//   },
//   "insights": {
//     "data_points_analyzed": number,
//     "prediction_confidence": string,
//     "trend_analysis": string,
//     "weak_areas_identified": number,
//     "upcoming_assessments": number
//   }
// }

// ============================================================================
// 14. STUDY RECOMMENDATIONS - MANUAL (User provides all data)
// ============================================================================
export interface RecommendationRequest {
  subjects: string[]
  quiz_scores: Record<string, number>
  weak_topics: string[]
  study_time: number
  upcoming_exams: string[]
  user_id?: string
}

export async function getManualRecommendation(data: RecommendationRequest, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE}/api/study-recommendation`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to generate recommendation')
  }

  return response.json()
}

// Response structure:
// {
//   "success": boolean,
//   "recommendation": {
//     "priority_subject": string,
//     "recommended_topic": string,
//     "recommended_daily_study_minutes": string,
//     "reasoning": string,
//     "motivation_message": string,
//     "generated_at": string,
//     "user_id": string
//   },
//   "status": string
// }

// ============================================================================
// 15. TOPIC GUIDANCE (Advanced recommendation)
// ============================================================================
export interface TopicGuidanceRequest {
  subject: string
  topic: string
  weak_areas: string[]
  study_time_available: number
  user_id?: string
}

export async function getTopicGuidance(data: TopicGuidanceRequest, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE}/api/topic-guidance`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Failed to get topic guidance')
  }

  return response.json()
}

// Response structure:
// {
//   "success": boolean,
//   "topic": string,
//   "guidance": {
//     "core_concepts": string[],
//     "learning_path": string,
//     "key_resources": string[],
//     "practice_suggestions": string[],
//     "estimated_study_time": string
//   },
//   "generated_at": string
// }
