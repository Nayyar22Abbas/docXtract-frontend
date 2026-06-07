"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Upload, BarChart3, Activity, ArrowRight, Sparkles, Zap, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentUpload } from "@/components/document-upload"
import { useDocuments } from "@/lib/providers/document-provider"
import ScrollProgress from "@/components/ScrollProgress"
import MagicCard from "@/components/MagicCard"
import TextReveal from "@/components/TextReveal"
import HoverLetters from "@/components/HoverLetters"
import MagneticText from "@/components/MagneticText"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const { documents, addDocument, getDocumentCount } = useDocuments()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file)
    setIsProcessing(true)
    try {
      const success = await addDocument(file)
      if (success) {
        console.log("Document added:", file.name)
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push("/dashboard/document-processing")
      } else {
        // If upload failed, reset selection
        setSelectedFile(null)
      }
    } catch (error) {
      console.error("Error processing document:", error)
      setSelectedFile(null)
    } finally {
      setIsProcessing(false)
    }
  }
  return (
    <div className="relative min-h-screen">
      <ScrollProgress />
      
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-40 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="container max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
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
              Dashboard
            </motion.div>
          </MagneticText>
          
          <h1 className="text-3xl md:text-4xl font-bold">
            <TextReveal text="Welcome to DocXtract Dashboard" />
          </h1>
          <p className="text-muted-foreground text-lg">
            <TextReveal text="Start processing your documents with AI-powered intelligence" delay={0.3} />
          </p>
          
          {/* Quick Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-6 pt-2"
          >
            {[
              { icon: Zap, text: "AI-Powered", color: "text-yellow-500" },
              { icon: Clock, text: "Real-time Processing", color: "text-cyan-500" },
              { icon: CheckCircle2, text: "99.9% Accuracy", color: "text-emerald-500" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 text-sm text-muted-foreground"
                whileHover={{ scale: 1.05, x: 5 }}
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
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
                      <Upload className="h-5 w-5 text-white" />
                    </motion.div>
                    <HoverLetters text="Upload Documents" />
                  </CardTitle>
                  <CardDescription>Drag and drop your documents or click to browse</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DocumentUpload 
                    onFileSelected={handleFileSelected}
                    isLoading={isProcessing}
                  />
                  {getDocumentCount() > 0 && (
                    <Button 
                      onClick={() => router.push("/dashboard/document-processing")} 
                      className="w-full gap-2 btn-glow-pulse"
                      variant="outline"
                    >
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                      Go to Document Processing
                    </Button>
                  )}
                </CardContent>
              </Card>
            </MagicCard>
          </motion.div>

          {/* Getting Started */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <MagicCard enableBorderGlow enableSpotlight>
              <Card className="glass-effect border-transparent h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🚀
                    </motion.span>
                    <HoverLetters text="Getting Started" />
                  </CardTitle>
                  <CardDescription>Quick steps to process your documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { step: 1, title: "Upload your document", desc: "Choose files from your device", gradient: "from-cyan-400 to-blue-500" },
                    { step: 2, title: "AI Processing", desc: "Let our AI extract the data", gradient: "from-emerald-400 to-teal-500" },
                    { step: 3, title: "Download Results", desc: "Get structured data output", gradient: "from-purple-400 to-pink-500" },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      className="flex items-start gap-3 p-2 rounded-lg transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      whileHover={{ x: 5, backgroundColor: "hsl(var(--primary) / 0.05)" }}
                    >
                      <motion.div 
                        className={`w-7 h-7 bg-gradient-to-br ${item.gradient} rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 shadow-lg`}
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.step}
                      </motion.div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}

                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent" 
                      disabled={getDocumentCount() === 0}
                      onClick={() => router.push("/dashboard/document-processing")}
                    >
                      {getDocumentCount() === 0 ? "No documents yet" : "View Documents"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </MagicCard>
          </motion.div>
        </div>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-4"
        >
          <h2 className="text-xl font-semibold">
            <TextReveal text="Your Activity Overview" />
          </h2>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: FileText,
              title: "Documents",
              value: getDocumentCount(),
              description: getDocumentCount() === 0 ? 'No documents uploaded yet' : 'Documents stored in your account',
              gradient: "from-cyan-400 to-blue-500",
              pulseColor: "bg-cyan-400",
            },
            {
              icon: Activity,
              title: "Processing",
              value: 0,
              description: "No active processing",
              gradient: "from-emerald-400 to-teal-500",
              pulseColor: "bg-emerald-400",
            },
            {
              icon: BarChart3,
              title: "Analytics",
              value: "-",
              description: "Start uploading to see stats",
              gradient: "from-purple-400 to-pink-500",
              pulseColor: "bg-purple-400",
            },
          ].map((stat, index) => (
            <motion.div 
              key={index} 
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MagicCard enableBorderGlow enableSpotlight clickEffect>
                <Card className="glass-effect border-transparent text-center">
                  <CardContent className="p-8">
                    <motion.div 
                      className={`mx-auto w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg relative`}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <stat.icon className="h-7 w-7 text-white" />
                      <motion.div
                        className={`absolute inset-0 rounded-2xl ${stat.pulseColor} opacity-30`}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    <h3 className="font-semibold mb-2">
                      <HoverLetters text={stat.title} />
                    </h3>
                    <motion.p 
                      className="text-3xl font-bold text-primary glow-text mb-1"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </MagicCard>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Footer Space */}
        <div className="h-10" />
      </div>
    </div>
  )
}
