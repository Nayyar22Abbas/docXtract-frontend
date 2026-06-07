"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, BookOpen, FileText, Shield, Sparkles, Workflow, Zap, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import TextType from "@/components/TextType"
import MagicCard from "@/components/MagicCard"
import ScrollProgress from "@/components/ScrollProgress"
import TextReveal from "@/components/TextReveal"
import HoverLetters from "@/components/HoverLetters"
import MagneticText from "@/components/MagneticText"

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

export default function GuidePage() {
  return (
    <div className="relative min-h-screen">
      <ScrollProgress />
      
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <section className="relative pt-16 pb-20 px-4">
        <div className="container max-w-5xl mx-auto space-y-16">
          {/* Hero / Intro */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8 text-center"
          >
            <MagneticText strength={0.5}>
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary shimmer-badge relative overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Welcome to DocXtract
              </motion.div>
            </MagneticText>

            <motion.div variants={fadeInUp} className="space-y-4">
              <h1 className="text-balance text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                <TextType
                  text={["Your command center for intelligent document workflows"]}
                  typingSpeed={50}
                  pauseDuration={3000}
                  showCursor
                  cursorCharacter="_"
                  cursorBlinkDuration={0.5}
                  loop={false}
                  className="inline"
                />
              </h1>
              <p className="mx-auto max-w-3xl text-balance text-base md:text-lg text-muted-foreground">
                This guide walks you through how DocXtract thinks about documents, how to get the most accurate
                results, and where everything lives in your workspace.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="px-8 text-base btn-glow-pulse group">
                <Link href="/dashboard">
                  Go to dashboard
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                You can always come back to this guide from the Home tab in the navbar.
              </p>
            </motion.div>
            
            {/* Quick Stats */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-6 pt-4"
            >
              {[
                { icon: Zap, text: "AI-Powered" },
                { icon: Shield, text: "Secure" },
                { icon: Check, text: "99.9% Accuracy" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  whileHover={{ scale: 1.05, color: "hsl(var(--primary))" }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Section Divider */}
          <div className="section-divider" />

          {/* How it works steps */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold">
              <TextReveal text="How DocXtract Works" />
            </h2>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 md:grid-cols-3"
          >
            {[
              {
                icon: FileText,
                step: "1",
                title: "Bring your documents",
                description: "Upload PDFs, scanned images, or text files from your device or existing systems. We handle real-world documents: multi-page reports, forms, invoices and more.",
                gradient: "from-cyan-400 to-blue-500",
              },
              {
                icon: Workflow,
                step: "2",
                title: "Extract what matters",
                description: "Our AI pipeline reads your documents, understands their structure, and extracts clean, structured data that's ready for analysis, search, or downstream systems.",
                gradient: "from-emerald-400 to-teal-500",
              },
              {
                icon: Shield,
                step: "3",
                title: "Review and act",
                description: "Explore processed results in your dashboard, export them to your tools, or plug them into your workflows with confidence-grade explanations and full traceability.",
                gradient: "from-purple-400 to-pink-500",
              },
            ].map((item, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MagicCard enableBorderGlow enableSpotlight clickEffect>
                  <Card className="h-full border-transparent bg-background/60">
                    <CardContent className="space-y-4 p-6">
                      <motion.div 
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <item.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-primary/20">{item.step}</span>
                        <h2 className="text-lg font-semibold">
                          <HoverLetters text={item.title} />
                        </h2>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </MagicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Section Divider */}
          <div className="section-divider" />

          {/* Layout explanation */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-start"
          >
            <div className="space-y-6">
              <motion.h2 
                className="text-2xl font-semibold flex items-center gap-2"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="p-2 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <BookOpen className="h-5 w-5 text-white" />
                </motion.div>
                <HoverLetters text="How your workspace is organised" />
              </motion.h2>
              <p className="text-sm md:text-base text-muted-foreground">
                <TextReveal text="Think of DocXtract as a focused workspace for all of your documents. Each area in the app is designed to answer a specific question:" />
              </p>

              <div className="space-y-4">
                {[
                  { 
                    title: "Home (this page)", 
                    description: "your starting point after sign-in. Use it to understand capabilities, best practices, and quick links into the rest of the app.",
                    icon: "🏠"
                  },
                  { 
                    title: "Dashboard", 
                    description: "a high-level view of your recent activity: processed documents, success and error rates, and shortcuts into what needs your attention.",
                    icon: "📊"
                  },
                  { 
                    title: "Document Processing", 
                    description: "the hands-on workspace where you upload new files, track processing status, inspect extracted fields, and re-run jobs.",
                    icon: "📄"
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10, backgroundColor: "hsl(var(--primary) / 0.05)" }}
                    className="p-3 rounded-lg transition-colors cursor-default"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <span className="font-semibold text-foreground">{item.title}</span>
                        <span className="text-sm text-muted-foreground"> – {item.description}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <MagicCard enableBorderGlow enableSpotlight>
              <Card className="border-transparent bg-background/60">
                <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🚀
                    </motion.span>
                    Getting from zero to first result
                  </h3>
                  <ol className="space-y-3">
                    {[
                      { step: "Go to Document Processing." },
                      { step: "Upload a document you already know well (e.g. an invoice or report)." },
                      { step: "Review the extracted fields and tweak any options you have configured." },
                      { step: "Save the run, and you'll see it appear in your Dashboard overview." },
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <span>{item.step}</span>
                      </motion.li>
                    ))}
                  </ol>
                  <motion.p 
                    className="pt-2 text-xs italic border-t border-primary/10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    Once you&apos;re comfortable with a single document, scale out by uploading batches and wiring DocXtract
                    into your existing tools.
                  </motion.p>
                </CardContent>
              </Card>
            </MagicCard>
          </motion.div>
          
          {/* Footer Space */}
          <div className="h-10" />
        </div>
      </section>
    </div>
  )
}
