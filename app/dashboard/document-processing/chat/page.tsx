'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Send, FileText, Loader2, MessageSquare, Sparkles } from 'lucide-react'
import { chatWithPdf } from '@/lib/api/endpoints'
import HoverLetters from '@/components/HoverLetters'
import MagicCard from '@/components/MagicCard'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents } = useDocuments()

  const doc1Id = searchParams.get('doc1')
  const doc1 = documents.find(d => d.id === doc1Id)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can answer questions about the document you selected. What would you like to know?',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !doc1 || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      const result = await chatWithPdf(doc1.id, inputValue)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get answer'
      setError(errorMsg)
      setMessages(prev =>
        prev.slice(0, -1).concat({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I encountered an error: ${errorMsg}. Please try again.`,
        })
      )
    } finally {
      setIsLoading(false)
    }
  }

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <div className="min-h-screen p-8 flex flex-col relative overflow-hidden">
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-3xl mx-auto w-full space-y-6 flex flex-col h-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold">
              <HoverLetters text="Chat with PDF" className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent" />
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Ask questions about your document
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 btn-glow-pulse"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        {!doc1 && (
          <MagicCard className="glass-effect border-primary/20">
            <CardContent className="py-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Please select a document first
              </p>
            </CardContent>
          </MagicCard>
        )}

        {doc1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-4 flex-1"
          >
            {/* Document Info */}
            <MagicCard className="glass-effect border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                  >
                    <FileText className="h-4 w-4 text-green-400" />
                  </motion.div>
                  {doc1.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  Uploaded: {new Date(doc1.uploadDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </MagicCard>

            {/* Chat Area */}
            <MagicCard className="glass-effect border-primary/20 flex-1 flex flex-col">
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[400px] max-h-[500px]">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'bg-muted/80 text-foreground border border-primary/10'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-muted-foreground">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted/80 text-foreground px-4 py-3 rounded-2xl flex items-center gap-3 border border-primary/10">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                            className="w-2 h-2 rounded-full bg-green-400"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t border-primary/10 p-4 space-y-2 bg-muted/30 rounded-b-xl">
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-destructive bg-destructive/10 p-2 rounded"
                  >
                    {error}
                  </motion.p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question about the document..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 rounded-xl bg-background text-foreground placeholder-muted-foreground border border-primary/20 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 text-sm transition-all"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    size="lg"
                    className="gap-2 btn-glow-pulse bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </MagicCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
