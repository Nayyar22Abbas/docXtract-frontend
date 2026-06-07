'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react'
import { API_BASE, authHeaders } from '@/lib/api/auth'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export default function QAPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents } = useDocuments()
  
  const doc1Id = searchParams.get('doc1')
  const doc1 = documents.find(d => d.id === doc1Id)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAsk = async () => {
    if (!doc1 || !input.trim() || isLoading) return

    const question = input.trim()
    setInput('')
    setError(null)
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setIsLoading(true)

    try {
      // NOTE: Backend defines `question: str = Body(...)`, so it expects a raw JSON string,
      // not an object like { "question": "..." }. We send the plain JSON string here.
      const res = await fetch(`${API_BASE}/pdfchat/chat-pdf/${doc1.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(question),
      })

      const data = await res.json().catch(() => ({})) as any

      const extractErrorMessage = (d: any): string => {
        const detail = d?.detail
        if (typeof detail === 'string') return detail
        if (Array.isArray(detail)) {
          const msgs = detail
            .map((item) => (typeof item?.msg === 'string' ? item.msg : JSON.stringify(item)))
            .join('; ')
          return msgs || 'Failed to get answer from server'
        }
        if (detail && typeof detail === 'object') {
          if (typeof detail.msg === 'string') return detail.msg
          return JSON.stringify(detail)
        }
        return 'Failed to get answer from server'
      }

      if (!res.ok) {
        setError(extractErrorMessage(data))
        return
      }

      const answerRaw = (data as any).answer
      if (answerRaw == null) {
        setError('Server did not return an answer')
        return
      }

      const answer = typeof answerRaw === 'string' ? answerRaw : JSON.stringify(answerRaw)

      setMessages((prev) => [...prev, { role: 'assistant', text: answer }])
    } catch (err) {
      setError('An error occurred while asking the question')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Q&A Chatbot</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Ask conversational questions about your document and get AI-powered answers.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {!doc1 && (
          <Card className="glass-effect border-primary/20">
            <CardContent className="py-8 text-center space-y-2">
              <p className="text-sm text-muted-foreground">No document selected for Q&amp;A.</p>
              <p className="text-xs text-muted-foreground">
                Go back to Document Processing and choose a document to chat with.
              </p>
            </CardContent>
          </Card>
        )}

        {doc1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-effect border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {doc1.name}
                </CardTitle>
                <CardDescription>
                  Uploaded on {new Date(doc1.uploadDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 h-[360px] overflow-y-auto bg-muted/40">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Ask a question about this document to get started. For example: &quot;What are the main findings?&quot;
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
                              m.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-xs text-destructive">
                    {error}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <input
                    className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="Ask a question about this document..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAsk()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAsk} disabled={isLoading || !input.trim()}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Asking...
                      </>
                    ) : (
                      'Ask'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
