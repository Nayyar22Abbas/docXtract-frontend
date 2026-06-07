"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function FuturisticBackground() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: isDark
              ? [
                  "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.35) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.35) 0%, transparent 55%), radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.25) 0%, transparent 55%)",
                  "radial-gradient(circle at 60% 20%, rgba(6, 182, 212, 0.45) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.45) 0%, transparent 55%), radial-gradient(circle at 80% 60%, rgba(139, 92, 246, 0.3) 0%, transparent 55%)",
                  "radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.35) 0%, transparent 55%), radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.35) 0%, transparent 55%), radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 55%)",
                ]
              : [
                  "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.22) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.22) 0%, transparent 55%), radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.18) 0%, transparent 55%)",
                  "radial-gradient(circle at 60% 20%, rgba(6, 182, 212, 0.26) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.26) 0%, transparent 55%), radial-gradient(circle at 80% 60%, rgba(139, 92, 246, 0.2) 0%, transparent 55%)",
                  "radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.22) 0%, transparent 55%), radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.22) 0%, transparent 55%), radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.18) 0%, transparent 55%)",
                ],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => {
          const colors = isDark
            ? ["bg-cyan-400/45", "bg-emerald-400/45", "bg-purple-400/35", "bg-blue-400/35"]
            : ["bg-cyan-500/35", "bg-emerald-500/35", "bg-purple-500/28", "bg-blue-500/30"]

          const sizes = ["w-1 h-1", "w-2 h-2", "w-1.5 h-1.5", "w-0.5 h-0.5"]

          return (
            <motion.div
              key={i}
              className={`absolute rounded-full ${colors[i % colors.length]} ${sizes[i % sizes.length]}`}
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
              }}
              animate={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
              }}
              transition={{
                duration: Math.random() * 15 + 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "linear",
              }}
            />
          )
        })}
      </div>

      <div
        className={`absolute inset-0 ${isDark ? "opacity-[0.08]" : "opacity-[0.06]"}`}
        style={{
          backgroundImage: isDark
            ? `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `
            : `
              linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px)
            `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="absolute inset-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className={`absolute border rounded-full ${isDark ? "border-cyan-400/10" : "border-cyan-500/8"}`}
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 20 + i * 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
              scale: {
                duration: 4 + i,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </div>
    </div>
  )
}
