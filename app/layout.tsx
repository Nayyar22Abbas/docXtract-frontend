import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { FuturisticBackground } from "@/components/futuristic-background"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "DocXtract - AI Document Processing",
  description: "Extract and process documents with cutting-edge AI technology",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <FuturisticBackground />
        <Providers>
          <Navbar />
          <main className="relative min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
