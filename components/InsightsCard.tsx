'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Target, Zap, AlertCircle } from 'lucide-react'

interface Insights {
  quizTrendIndicator: 'up' | 'down' | 'stable'
  averageScore: number
  scoreImprovement: number
  studyConsistency: string
  weakAreasCount: number
}

export default function InsightsCard({ data }: { data: Insights }) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50'
      case 'down':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-slate-600 bg-slate-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈'
      case 'down':
        return '📉'
      default:
        return '➡️'
    }
  }

  const getConsistencyBadge = (consistency: string) => {
    switch (consistency.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'average':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-red-100 text-red-800 border-red-300'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid lg:grid-cols-2 gap-6"
    >
      {/* Quiz Trend */}
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Quiz Trend</h3>
          <span className="text-4xl">{getTrendIcon(data.quizTrendIndicator)}</span>
        </div>
        <div className={`rounded-xl p-4 ${getTrendColor(data.quizTrendIndicator)}`}>
          <p className="text-sm font-semibold mb-1">Current Status</p>
          <p className="text-2xl font-bold capitalize">{data.quizTrendIndicator}</p>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          {data.quizTrendIndicator === 'up'
            ? '✨ Your performance is improving steadily'
            : data.quizTrendIndicator === 'down'
            ? '⚠️ Your scores need attention'
            : '→ Your performance is stable'}
        </p>
      </motion.div>

      {/* Average Score */}
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Average Score</h3>
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-6xl font-bold text-blue-600 mb-2"
        >
          {data.averageScore}%
        </motion.div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.averageScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full"
          />
        </div>
        <p className="mt-4 text-sm text-slate-600">
          {data.averageScore >= 80
            ? '🌟 Excellent performance'
            : data.averageScore >= 60
            ? '👍 Good progress'
            : '📚 Room for improvement'}
        </p>
      </motion.div>

      {/* Score Improvement */}
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Improvement</h3>
          <TrendingUp className="w-8 h-8 text-green-600" />
        </div>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`text-5xl font-bold ${data.scoreImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {data.scoreImprovement > 0 ? '+' : ''}{data.scoreImprovement}%
        </motion.div>
        <p className="mt-4 text-sm text-slate-600">
          {data.scoreImprovement > 0
            ? '🚀 Great improvement! Keep it up'
            : data.scoreImprovement < 0
            ? '⏱️ Focus on weak areas'
            : '➡️ Maintain your current level'}
        </p>
      </motion.div>

      {/* Study Consistency */}
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Study Consistency</h3>
          <Zap className="w-8 h-8 text-amber-600" />
        </div>
        <div className={`rounded-xl p-4 border ${getConsistencyBadge(data.studyConsistency)}`}>
          <p className="text-sm font-semibold mb-1">Your Consistency Rating</p>
          <p className="text-2xl font-bold capitalize">{data.studyConsistency}</p>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          {data.studyConsistency?.toLowerCase() === 'excellent'
            ? '💫 You study regularly - fantastic!'
            : data.studyConsistency?.toLowerCase() === 'good'
            ? '👍 Good study habits'
            : data.studyConsistency?.toLowerCase() === 'average'
            ? '📅 Try to study more regularly'
            : '⚠️ Increase your study frequency'}
        </p>
      </motion.div>

      {/* Weak Areas */}
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 lg:col-span-2"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Topics Needing Focus</h3>
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold text-red-600 mb-2"
          >
            {data.weakAreasCount}
          </motion.div>
          <p className="text-slate-700">
            {data.weakAreasCount === 0
              ? '✨ No weak areas detected!'
              : data.weakAreasCount === 1
              ? 'topic needs your attention'
              : 'topics need your attention'}
          </p>
          {data.weakAreasCount > 0 && (
            <p className="text-sm text-slate-600 mt-3">
              📌 Focus on these areas to improve your overall performance
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
