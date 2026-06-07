"use client"

import { motion } from "framer-motion"

interface HoverLettersProps {
  text: string
  className?: string
}

export default function HoverLetters({ text, className = "" }: HoverLettersProps) {
  return (
    <span className={className}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          whileHover={{ 
            y: -5, 
            scale: 1.2,
            color: "hsl(var(--primary))",
            transition: { type: "spring", stiffness: 500, damping: 10 }
          }}
          style={{ 
            display: char === " " ? "inline" : "inline-block",
            minWidth: char === " " ? "0.25em" : "auto"
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}
