'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { DocumentList } from '@/components/document-list'
import { ProcessCards } from '@/components/process-cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, ArrowLeft, FileText, Sparkles, Zap, CheckCircle2 } from 'lucide-react'
import ScrollProgress from '@/components/ScrollProgress'
import MagicCard from '@/components/MagicCard'
import TextReveal from '@/components/TextReveal'
import HoverLetters from '@/components/HoverLetters'
import MagneticText from '@/components/MagneticText'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
}

export default function DocumentProcessingPage() {
  const router = useRouter()
  const { documents, deleteDocument, isLoading } = useDocuments()
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSelectDocument = (id: string) => {
    setSelectedDocIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((docId) => docId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleDeleteDocument = (id: string) => {
    deleteDocument(id)
    setSelectedDocIds((prev) => prev.filter((docId) => docId !== id))
  }

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full mb-4"
          />
          <p className="text-lg">Loading documents...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 relative">
      <ScrollProgress />
      
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-3">
            <MagneticText strength={0.3}>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium shimmer-badge relative overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                AI Processing
              </motion.div>
            </MagneticText>
            
            <h1 className="text-3xl md:text-4xl font-bold">
              <TextReveal text="Document Processing" />
            </h1>
            <p className="text-muted-foreground text-lg">
              <TextReveal text="Select documents and choose a process to analyze" delay={0.2} />
            </p>
            
            {/* Quick Info */}
            <motion.div 
              className="flex flex-wrap gap-4 pt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { icon: FileText, text: `${documents.length} Documents`, color: "text-cyan-500" },
                { icon: CheckCircle2, text: `${selectedDocIds.length} Selected`, color: "text-emerald-500" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  whileHover={{ scale: 1.05, x: 3 }}
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              className="gap-2 btn-glow-pulse"
              onClick={() => router.push('/dashboard')}
            >
              <motion.span
                animate={{ x: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowLeft className="h-4 w-4" />
              </motion.span>
              Back to Dashboard
            </Button>
          </motion.div>
        </motion.div>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Documents Section - Sticky */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            <MagicCard enableBorderGlow enableSpotlight>
              <Card className="glass-effect border-transparent h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      className="p-2 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <FileText className="h-4 w-4 text-white" />
                    </motion.div>
                    <HoverLetters text="Select Documents" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.length > 0 ? (
                      <DocumentList
                        documents={documents}
                        selectedDocIds={selectedDocIds}
                        onSelectDocument={handleSelectDocument}
                        onDeleteDocument={handleDeleteDocument}
                        maxSelections={2}
                      />
                    ) : (
                      <motion.div 
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        </motion.div>
                        <p className="text-sm text-muted-foreground mb-4">
                          No documents uploaded yet
                        </p>
                        <Button
                          onClick={() => router.push('/dashboard')}
                          variant="outline"
                          className="w-full btn-glow-pulse"
                        >
                          Upload Document
                        </Button>
                      </motion.div>
                    )}

                    {documents.length > 0 && (
                      <Button
                        onClick={() => router.push('/dashboard')}
                        variant="outline"
                        className="w-full btn-glow-pulse"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload More
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </MagicCard>
          </motion.div>

          {/* Process Cards Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <MagicCard enableBorderGlow enableSpotlight>
              <Card className="glass-effect border-transparent h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Zap className="h-4 w-4 text-white" />
                    </motion.div>
                    <HoverLetters text="Available Processes" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedDocIds.length > 0 ? (
                    <ProcessCards selectedDocIds={selectedDocIds} />
                  ) : (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <motion.div
                        className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 border border-primary/20"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FileText className="h-8 w-8 text-primary/50" />
                      </motion.div>
                      <p className="text-muted-foreground text-lg">
                        Select a document to see available processes
                      </p>
                      <p className="text-muted-foreground text-sm mt-2">
                        You can select up to 2 documents at a time
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </MagicCard>
          </motion.div>
        </div>
        
        {/* Footer Space */}
        <div className="h-10" />
      </div>
    </div>
  )
}
