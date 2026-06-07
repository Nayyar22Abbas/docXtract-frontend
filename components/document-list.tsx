'use client'

import { motion } from 'framer-motion'
import { FileText, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { StoredDocument } from '@/lib/providers/document-provider'
import { useState } from 'react'
import HoverLetters from '@/components/HoverLetters'

interface DocumentListProps {
  documents: StoredDocument[]
  selectedDocIds: string[]
  onSelectDocument: (id: string) => void
  onDeleteDocument: (id: string) => void
  maxSelections?: number
}

export function DocumentList({
  documents,
  selectedDocIds,
  onSelectDocument,
  onDeleteDocument,
  maxSelections = 2,
}: DocumentListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    return <FileText className="h-8 w-8" />
  }

  const isSelected = (id: string) => selectedDocIds.includes(id)
  const canSelect = (id: string) =>
    isSelected(id) || selectedDocIds.length < maxSelections

  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  }

  if (documents.length === 0) {
    return (
      <Card className="glass-effect border-primary/20 border-dashed">
        <CardContent className="p-12 text-center">
          <motion.div 
            className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-4 border border-primary/20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FileText className="h-8 w-8 text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
          <p className="text-muted-foreground">Upload your first document to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-bold mb-1">
          <HoverLetters text="Your Documents" />
        </h2>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span>{documents.length} document{documents.length === 1 ? '' : 's'}</span>
          <span className="text-primary">•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {selectedDocIds.length} selected
          </span>
        </p>
      </div>

      <div className="space-y-2">
        {documents.map((doc, index) => (
          <motion.div 
            key={doc.id} 
            variants={fadeInUp} 
            initial="initial" 
            animate="animate"
            whileHover={canSelect(doc.id) ? { x: 4 } : {}}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`glass-effect transition-all duration-300 cursor-pointer ${
                isSelected(doc.id)
                  ? 'border-primary/60 bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-transparent hover:border-primary/30'
              } ${!canSelect(doc.id) && !isSelected(doc.id) ? 'opacity-50' : ''}`}
              onClick={() => canSelect(doc.id) && onSelectDocument(doc.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Checkbox/Selection indicator */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (canSelect(doc.id)) onSelectDocument(doc.id)
                    }}
                  >
                    <Checkbox
                      checked={isSelected(doc.id)}
                      className="size-5 border-primary/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />
                  </motion.div>

                  {/* File icon */}
                  <motion.div 
                    className={`flex-shrink-0 p-2 rounded-lg ${isSelected(doc.id) ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-primary/10'}`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <FileText className={`h-5 w-5 ${isSelected(doc.id) ? 'text-white' : 'text-primary'}`} />
                  </motion.div>

                  {/* Document info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isSelected(doc.id) ? 'text-primary' : ''}`}>{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(doc.size)} • {formatDate(doc.uploadDate)}
                    </p>
                  </div>

                  {/* Delete button */}
                  <div className="flex-shrink-0">
                    {deleteConfirm === doc.id ? (
                      <motion.div 
                        className="flex gap-1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm(null)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteDocument(doc.id)
                            setDeleteConfirm(null)
                          }}
                        >
                          Delete
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm(doc.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
