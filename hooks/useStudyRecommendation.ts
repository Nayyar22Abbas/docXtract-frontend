'use client'

import { useState } from 'react'
import {
  getAutoRecommendation,
  getStudentProfile,
  getManualRecommendation,
} from '@/lib/api/endpoints'

interface StudentProfile {
  enrolledSubjects: string[]
  quizTrends: {
    average: number
    improvement: number
    consistency: number
  }
  weakTopics: Array<{
    name: string
    score: number
  }>
  studyTimePatterns?: {
    weeklyHours: number
    consistency: string
  }
  upcomingExams?: Array<{
    subject: string
    date: string
  }>
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  subject: string
  recommendedTopic: string
  dailyMinutes: number
  reasoning: string
  motivationMessage: string
}

interface Insights {
  quizTrendIndicator: 'up' | 'down' | 'stable'
  averageScore: number
  scoreImprovement: number
  studyConsistency: string
  weakAreasCount: number
}

export function useStudyRecommendation() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [autoRecommendation, setAutoRecommendation] = useState<Recommendation | null>(null)
  const [manualRecommendation, setManualRecommendation] = useState<Recommendation | null>(null)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getStudentProfile(userId)
      setProfile(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch profile'
      setError(message)
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAutoRecommendation = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAutoRecommendation(userId)

      // Parse response
      setAutoRecommendation({
        priority: data.priority || 'high',
        subject: data.subject || 'Unknown',
        recommendedTopic: data.recommendedTopic || data.topic || 'General Study',
        dailyMinutes: data.dailyMinutes || data.minutes || 30,
        reasoning: data.reasoning || 'Based on your academic profile',
        motivationMessage: data.motivationMessage || data.message || 'Keep up the great work!',
      })

      // Extract insights
      if (data.insights) {
        setInsights({
          quizTrendIndicator: data.insights.trend || 'stable',
          averageScore: data.insights.average || 0,
          scoreImprovement: data.insights.improvement || 0,
          studyConsistency: data.insights.consistency || 'average',
          weakAreasCount: data.insights.weakAreas || 0,
        })
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch auto recommendation'
      setError(message)
      console.error('Auto recommendation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchManualRecommendation = async (formData: {
    subjects: string[]
    quizScores: Record<string, number>
    weakTopics: string[]
    studyTimeHours: number
    examDates: Array<{ subject: string; date: string }>
  }) => {
    setLoading(true)
    setError(null)
    try {
      // Transform camelCase to snake_case for API
      const apiData = {
        subjects: formData.subjects,
        quiz_scores: formData.quizScores,
        weak_topics: formData.weakTopics,
        study_time: formData.studyTimeHours,
        upcoming_exams: formData.examDates,
      }
      const data = await getManualRecommendation(apiData as any)

      // Parse response
      setManualRecommendation({
        priority: data.priority || 'high',
        subject: data.subject || 'Unknown',
        recommendedTopic: data.recommendedTopic || data.topic || 'General Study',
        dailyMinutes: data.dailyMinutes || data.minutes || 30,
        reasoning: data.reasoning || 'Based on your input',
        motivationMessage: data.motivationMessage || data.message || 'You can do this!',
      })

      // Extract insights
      if (data.insights) {
        setInsights({
          quizTrendIndicator: data.insights.trend || 'stable',
          averageScore: data.insights.average || 0,
          scoreImprovement: data.insights.improvement || 0,
          studyConsistency: data.insights.consistency || 'average',
          weakAreasCount: data.insights.weakAreas || 0,
        })
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch manual recommendation'
      setError(message)
      console.error('Manual recommendation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setProfile(null)
    setAutoRecommendation(null)
    setManualRecommendation(null)
    setInsights(null)
    setError(null)
  }

  return {
    profile,
    autoRecommendation,
    manualRecommendation,
    insights,
    loading,
    error,
    fetchProfile,
    fetchAutoRecommendation,
    fetchManualRecommendation,
    reset,
  }
}
