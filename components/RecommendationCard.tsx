'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  subject: string
  recommendedTopic: string
  dailyMinutes: number
  reasoning: string
  motivationMessage: string
}

export default function RecommendationCard({ data }: { data: Recommendation }) {
  const [expanded, setExpanded] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟡'
      default:
        return '🟢'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
    >
      {/* Main Content */}
      <div className="p-8 space-y-4">
        {/* Header with Priority */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full border font-semibold text-sm ${getPriorityColor(data.priority)}`}>
                {getPriorityBadge(data.priority)} {data.priority.toUpperCase()} PRIORITY
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{data.subject}</h3>
          </div>
        </div>

        {/* Recommended Topic Highlight */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-5 border border-purple-300"
        >
          <p className="text-sm font-semibold text-purple-700 mb-1">📚 Recommended Topic</p>
          <p className="text-xl font-bold text-purple-900">{data.recommendedTopic}</p>
        </motion.div>

        {/* Daily Study Time */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-5 border border-blue-300"
        >
          <p className="text-sm font-semibold text-blue-700 mb-1">⏱️ Daily Study Time</p>
          <p className="text-3xl font-bold text-blue-900">{data.dailyMinutes}</p>
          <p className="text-xs text-blue-700 mt-1">minutes per day</p>
        </motion.div>

        {/* Motivation Message */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-5 border border-green-300"
        >
          <p className="text-sm font-semibold text-green-700 mb-2">💪 Motivation</p>
          <p className="text-lg font-semibold text-green-900">{data.motivationMessage}</p>
        </motion.div>

        {/* Expandable Reasoning */}
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-center justify-between transition-colors"
        >
          <span className="font-semibold text-slate-900">Why This Recommendation?</span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-slate-600" />
          </motion.div>
        </motion.button>

        {/* Expanded Reasoning */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-4">
            <p className="text-slate-700 leading-relaxed">{data.reasoning}</p>
          </div>
        </motion.div>
      </div>

      {/* Footer Action */}
      <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Start studying today to improve your scores
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Start Study Session
        </motion.button>
      </div>
    </motion.div>
  )
}
