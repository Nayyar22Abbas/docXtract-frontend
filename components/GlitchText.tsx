"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"

interface GlitchTextProps {
  text: string
  className?: string
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"

export default function GlitchText({ text, className = "" }: GlitchTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [displayText, setDisplayText] = useState(text)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isInView && !isAnimating) {
      setIsAnimating(true)
      let iteration = 0
      const interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, index) => {
              if (char === " ") return " "
              if (index < iteration) {
                return text[index]
              }
              return chars[Math.floor(Math.random() * chars.length)]
            })
            .join("")
        )
        
        if (iteration >= text.length) {
          clearInterval(interval)
        }
        
        iteration += 1 / 3
      }, 30)
      
      return () => clearInterval(interval)
    }
  }, [isInView, text, isAnimating])

  return (
    <motion.span
      ref={ref}
      className={`inline-block font-mono ${className}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      {displayText}
    </motion.span>
  )
}
