"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import Link from "next/link"
import { 
  ArrowRight, 
  FileText, 
  Zap, 
  Shield, 
  Sparkles, 
  CheckCircle2,
  Users,
  Globe,
  TrendingUp,
  ChevronDown,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/providers/auth-provider"
import TextType from "@/components/TextType"
import MagicCard from "@/components/MagicCard"
import AnimatedCounter from "@/components/AnimatedCounter"
import FloatingIcons from "@/components/FloatingIcons"
import ScrollProgress from "@/components/ScrollProgress"
import TextReveal from "@/components/TextReveal"
import GlitchText from "@/components/GlitchText"
import MagneticText from "@/components/MagneticText"
import HoverLetters from "@/components/HoverLetters"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function HomePage() {
  const { isAuthenticated, isReady } = useAuth()
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  
  // Use global scroll instead of ref-based scroll to avoid hydration issues
  const { scrollYProgress } = useScroll()
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 100])

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/guide")
    }
  }, [isReady, isAuthenticated, router])

  if (!isReady || isAuthenticated) {
    return null
  }

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ScrollProgress />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4">
        <FloatingIcons />
        
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="container max-w-6xl mx-auto relative z-10"
        >
          <motion.div 
            variants={staggerContainer} 
            initial="initial" 
            animate="animate" 
            className="text-center space-y-8"
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              {/* Animated Badge */}
              <MagneticText strength={0.5}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium shimmer-badge relative overflow-hidden"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  AI-Powered Document Processing
                </motion.div>
              </MagneticText>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                <TextType
                  text={["Extract Intelligence from Any Document"]}
                  typingSpeed={50}
                  pauseDuration={3000}
                  showCursor
                  cursorCharacter="_"
                  cursorBlinkDuration={0.5}
                  loop={false}
                  className="inline"
                />
              </h1>

              {/* Subtitle */}
              <motion.p 
                variants={fadeInUp}
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance"
              >
                Transform your documents into structured data with cutting-edge AI. Process PDFs, images, and text with
                unprecedented accuracy and speed.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp} 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" className="text-lg px-8 py-6 group btn-glow-pulse" asChild>
                <Link href="/signup">
                  Get Started Free
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent btn-glow-pulse" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center items-center gap-6 pt-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Free tier available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={scrollToFeatures}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </motion.div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-4 relative">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: 10, suffix: "M+", label: "Documents Processed", icon: FileText },
              { value: 99.9, suffix: "%", label: "Accuracy Rate", decimals: 1, icon: TrendingUp },
              { value: 50, suffix: "K+", label: "Happy Users", icon: Users },
              { value: 150, suffix: "+", label: "Countries", icon: Globe },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center stats-card"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary glow-text">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix} 
                    decimals={stat.decimals || 0}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              Features
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <TextReveal text="Why Choose" className="mr-2" />
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                DocXtract
              </span>
              <TextReveal text="?" delay={0.3} />
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <TextReveal text="Experience the future of document processing with our advanced AI technology" delay={0.4} />
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Process thousands of documents in seconds with our optimized AI pipeline",
                gradient: "from-yellow-400 to-orange-500",
              },
              {
                icon: FileText,
                title: "Universal Format",
                description: "Support for PDFs, images, scanned documents, and more with 99.9% accuracy",
                gradient: "from-cyan-400 to-blue-500",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-grade encryption and compliance with GDPR, HIPAA, and SOC 2",
                gradient: "from-emerald-400 to-green-500",
              },
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MagicCard enableBorderGlow enableSpotlight clickEffect>
                  <Card className="h-full glass-effect border-transparent hover:border-transparent transition-colors group">
                    <CardContent className="p-8 text-center space-y-4">
                      <motion.div 
                        className={`w-16 h-16 mx-auto bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-semibold"><HoverLetters text={feature.title} /></h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </MagicCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* How It Works Section */}
      <section className="py-24 px-4">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              How It Works
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <TextReveal text="Three Simple Steps" />
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <TextReveal text="Get started in minutes with our intuitive workflow" delay={0.3} />
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-cyan-500/50 via-emerald-500/50 to-purple-500/50" />
            
            {[
              {
                step: "01",
                title: "Upload Documents",
                description: "Drag and drop your PDFs, images, or scanned documents",
                icon: FileText,
              },
              {
                step: "02",
                title: "AI Processing",
                description: "Our AI analyzes and extracts structured data automatically",
                icon: Zap,
              },
              {
                step: "03",
                title: "Get Results",
                description: "Download, export, or integrate the extracted data anywhere",
                icon: CheckCircle2,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    className="relative mx-auto"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30 relative z-10">
                      <item.icon className="w-8 h-8 text-primary" />
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div className="text-5xl font-bold text-primary/20">{item.step}</div>
                  <h3 className="text-xl font-semibold"><HoverLetters text={item.title} /></h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-purple-500/20" />
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)",
                  "radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10 p-12 md:p-16 text-center space-y-8 border border-primary/20 rounded-3xl backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  <TextReveal text="Ready to Transform Your" />
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">
                    <TextReveal text="Document Workflow?" delay={0.4} />
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  <TextReveal 
                    text="Join thousands of professionals who trust DocXtract for their document processing needs." 
                    delay={0.6} 
                  />
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button size="lg" className="text-lg px-10 py-6 btn-glow-pulse" asChild>
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-4 text-sm text-muted-foreground"
              >
                <Clock className="w-4 h-4" />
                <span>Setup takes less than 2 minutes</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Space */}
      <div className="h-20" />
    </div>
  )
}
