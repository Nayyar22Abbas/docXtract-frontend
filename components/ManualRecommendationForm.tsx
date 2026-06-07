'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, X, Plus } from 'lucide-react'

interface FormData {
  subjects: string[]
  quizScores: Record<string, number>
  weakTopics: string[]
  studyTimeHours: number
  examDates: Array<{ subject: string; date: string }>
}

export default function ManualRecommendationForm({
  onSubmit,
  loading = false,
}: {
  onSubmit: (data: FormData) => Promise<void>
  loading?: boolean
}) {
  const [formData, setFormData] = useState<FormData>({
    subjects: [],
    quizScores: {},
    weakTopics: [],
    studyTimeHours: 5,
    examDates: [],
  })

  const [newSubject, setNewSubject] = useState('')
  const [newTopic, setNewTopic] = useState('')
  const [newExamSubject, setNewExamSubject] = useState('')
  const [newExamDate, setNewExamDate] = useState('')

  const handleAddSubject = () => {
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, newSubject],
        quizScores: { ...prev.quizScores, [newSubject]: 0 },
      }))
      setNewSubject('')
    }
  }

  const handleRemoveSubject = (subject: string) => {
    setFormData((prev) => {
      const { [subject]: _, ...rest } = prev.quizScores
      return {
        ...prev,
        subjects: prev.subjects.filter((s) => s !== subject),
        quizScores: rest,
      }
    })
  }

  const handleScoreChange = (subject: string, score: number) => {
    setFormData((prev) => ({
      ...prev,
      quizScores: { ...prev.quizScores, [subject]: score },
    }))
  }

  const handleAddTopic = () => {
    if (newTopic && !formData.weakTopics.includes(newTopic)) {
      setFormData((prev) => ({
        ...prev,
        weakTopics: [...prev.weakTopics, newTopic],
      }))
      setNewTopic('')
    }
  }

  const handleRemoveTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      weakTopics: prev.weakTopics.filter((t) => t !== topic),
    }))
  }

  const handleAddExam = () => {
    if (newExamSubject && newExamDate) {
      setFormData((prev) => ({
        ...prev,
        examDates: [...prev.examDates, { subject: newExamSubject, date: newExamDate }],
      }))
      setNewExamSubject('')
      setNewExamDate('')
    }
  }

  const handleRemoveExam = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      examDates: prev.examDates.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.subjects.length === 0) {
      alert('Please add at least one subject')
      return
    }
    await onSubmit(formData)
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">📝 Manual Recommendation</h2>
        <p className="text-slate-600">Tell us about your courses and goals for personalized recommendations</p>
      </div>

      {/* Subjects Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <label className="block text-lg font-bold text-slate-900">
          <span className="text-purple-600">01</span> Your Subjects
        </label>
        <p className="text-sm text-slate-600 mb-3">Select or enter your enrolled subjects</p>

        {/* Add Subject Input */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter subject name (e.g., Mathematics)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddSubject}
            type="button"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add
          </motion.button>
        </div>

        {/* Selected Subjects */}
        <div className="flex flex-wrap gap-3">
          {formData.subjects.map((subject) => (
            <motion.div
              key={subject}
              whileHover={{ scale: 1.05 }}
              className="bg-purple-100 border border-purple-300 rounded-full px-4 py-2 flex items-center gap-2 group"
            >
              <span className="font-semibold text-purple-900">{subject}</span>
              <button
                onClick={() => handleRemoveSubject(subject)}
                type="button"
                className="text-purple-600 hover:text-purple-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Quiz Scores */}
        {formData.subjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-4"
          >
            <p className="font-semibold text-slate-900 mb-4">Quiz Scores (0-100%)</p>
            <div className="space-y-3">
              {formData.subjects.map((subject) => (
                <div key={subject} className="flex items-center gap-4">
                  <label className="w-32 font-semibold text-slate-700">{subject}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.quizScores[subject] || 0}
                    onChange={(e) => handleScoreChange(subject, Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-12 text-right font-bold text-purple-600">{formData.quizScores[subject]}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="border-t border-slate-200" />

      {/* Weak Topics Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <label className="block text-lg font-bold text-slate-900">
          <span className="text-blue-600">02</span> Topics Needing Focus
        </label>
        <p className="text-sm text-slate-600 mb-3">List topics where you struggle</p>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter topic (e.g., Calculus, Statistics)"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTopic}
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-3">
          {formData.weakTopics.map((topic) => (
            <motion.div
              key={topic}
              whileHover={{ scale: 1.05 }}
              className="bg-blue-100 border border-blue-300 rounded-full px-4 py-2 flex items-center gap-2 group"
            >
              <span className="font-semibold text-blue-900">{topic}</span>
              <button
                onClick={() => handleRemoveTopic(topic)}
                type="button"
                className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="border-t border-slate-200" />

      {/* Study Time Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <label className="block text-lg font-bold text-slate-900">
          <span className="text-green-600">03</span> Weekly Study Time
        </label>
        <p className="text-sm text-slate-600 mb-3">How many hours per week can you dedicate?</p>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="50"
            value={formData.studyTimeHours}
            onChange={(e) => setFormData((prev) => ({ ...prev, studyTimeHours: Number(e.target.value) }))}
            className="flex-1 h-3 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-3xl font-bold text-green-600 w-20 text-right">{formData.studyTimeHours}h</span>
        </div>
        <p className="text-xs text-slate-600">Range: 1-50 hours per week</p>
      </motion.div>

      <div className="border-t border-slate-200" />

      {/* Exam Dates Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <label className="block text-lg font-bold text-slate-900">
          <span className="text-amber-600">04</span> Upcoming Exams
        </label>
        <p className="text-sm text-slate-600 mb-3">Plan your study schedule around exams</p>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Subject"
            value={newExamSubject}
            onChange={(e) => setNewExamSubject(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <input
            type="date"
            value={newExamDate}
            onChange={(e) => setNewExamDate(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddExam}
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="space-y-2">
          {formData.examDates.map((exam, idx) => (
            <motion.div
              key={idx}
              whileHover={{ x: 5 }}
              className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3"
            >
              <div>
                <p className="font-semibold text-slate-900">{exam.subject}</p>
                <p className="text-sm text-slate-600">{new Date(exam.date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleRemoveExam(idx)}
                type="button"
                className="text-amber-600 hover:text-amber-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading || formData.subjects.length === 0}
        type="submit"
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
          loading || formData.subjects.length === 0
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Getting Recommendations...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Get Personalized Recommendations
          </>
        )}
      </motion.button>
    </motion.form>
  )
}
