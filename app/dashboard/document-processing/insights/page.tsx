'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useDocuments } from '@/lib/providers/document-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Lightbulb } from 'lucide-react'

export default function InsightsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents } = useDocuments()
  
  const doc1Id = searchParams.get('doc1')
  const doc1 = documents.find(d => d.id === doc1Id)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Predictive Insights</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Get AI-powered insights and predictions
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

        {doc1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-effect border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  {doc1.name}
                </CardTitle>
                <CardDescription>
                  Uploaded on {new Date(doc1.uploadDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 This is a frontend-only demo. Predictive insights are not available without backend integration.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  In a full implementation, this page would display AI-generated insights, patterns, and predictions based on your document content.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
