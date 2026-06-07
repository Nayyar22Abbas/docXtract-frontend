'use client'

import { motion } from 'framer-motion'
import { TrendingUp, BookOpen, Clock, AlertCircle } from 'lucide-react'

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

export default function StudentProfileCard({ data }: { data: StudentProfile }) {
  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-slate-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 space-y-6"
    >
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <span className="text-3xl">📊</span> Your Profile
      </h2>

      {/* Quiz Trends */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200"
        >
          <p className="text-sm text-blue-700 font-semibold mb-2">Average Score</p>
          <p className="text-4xl font-bold text-blue-900 mb-1">{data.quizTrends.average}%</p>
          <p className="text-xs text-blue-600">Last 10 quizzes</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200"
        >
          <p className="text-sm text-green-700 font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Improvement
          </p>
          <p className={`text-4xl font-bold mb-1 ${getTrendColor(data.quizTrends.improvement)}`}>
            {data.quizTrends.improvement > 0 ? '+' : ''}
            {data.quizTrends.improvement}%
          </p>
          <p className="text-xs text-slate-600">Last month</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200"
        >
          <p className="text-sm text-purple-700 font-semibold mb-2">Consistency</p>
          <p className="text-3xl font-bold text-purple-900 mb-1">{data.quizTrends.consistency}%</p>
          <p className="text-xs text-purple-600">Quiz completion rate</p>
        </motion.div>
      </div>

      {/* Enrolled Subjects */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Enrolled Subjects
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {data.enrolledSubjects.map((subject, idx) => (
            <motion.div
              key={idx}
              whileHover={{ x: 4, scale: 1.02 }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <p className="text-sm font-semibold text-slate-900">{subject}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weak Topics */}
      {data.weakTopics.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Topics Needing Focus
          </h3>
          <div className="space-y-3">
            {data.weakTopics.slice(0, 5).map((topic, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3"
              >
                <p className="font-semibold text-slate-800">{topic.name}</p>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${getScoreBadgeColor(topic.score)}`}>
                  {topic.score}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Study Time */}
      {data.studyTimePatterns && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm font-semibold text-amber-900 flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" /> Weekly Study Time
          </p>
          <p className="text-2xl font-bold text-amber-900">
            {data.studyTimePatterns.weeklyHours} hours
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Status: {data.studyTimePatterns.consistency}
          </p>
        </div>
      )}

      {/* Upcoming Exams */}
      {data.upcomingExams && data.upcomingExams.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-3">📅 Upcoming Exams</h3>
          <div className="space-y-2">
            {data.upcomingExams.map((exam, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
                <p className="font-semibold text-slate-800">{exam.subject}</p>
                <p className="text-sm text-slate-600">{new Date(exam.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
