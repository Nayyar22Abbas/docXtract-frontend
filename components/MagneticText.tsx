"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, MouseEvent } from "react"

interface MagneticTextProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export default function MagneticText({ 
  children, 
  className = "",
  strength = 0.3 
}: MagneticTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { damping: 15, stiffness: 150 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)
  
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength
    
    x.set(deltaX)
    y.set(deltaY)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block cursor-default ${className}`}
    >
      {children}
    </motion.div>
  )
}
