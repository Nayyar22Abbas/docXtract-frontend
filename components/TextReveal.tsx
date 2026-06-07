"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface TextRevealProps {
  text: string
  className?: string
  delay?: number
}

export default function TextReveal({ text, className = "", delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const words = text.split(" ")
  
  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em] overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{
              duration: 0.5,
              delay: delay + wordIndex * 0.08,
              ease: [0.33, 1, 0.68, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
