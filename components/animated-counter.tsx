"use client"

import { useInView, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useRef } from "react"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 2, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: duration * 1000 })
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [motionValue, isInView, value])

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(Math.floor(latest))
      }
    })
  }, [springValue])

  return <span ref={ref} className={className} />
}
