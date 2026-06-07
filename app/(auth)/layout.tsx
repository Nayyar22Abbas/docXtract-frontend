import type React from "react"
import type { Metadata } from "next"
import { FuturisticBackground } from "@/components/futuristic-background"

export const metadata: Metadata = {
  title: "Authentication - DocXtract",
  description: "Sign in or create your DocXtract account",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <FuturisticBackground />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
