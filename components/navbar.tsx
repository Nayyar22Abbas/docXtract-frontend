"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"
import clsx from "clsx"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/providers/auth-provider"

export function Navbar() {
  const { isAuthenticated, username, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const displayName = username?.includes("@") ? username.split("@")[0] : username

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const isDashboardRoute =
    pathname === "/dashboard" || (pathname.startsWith("/dashboard") && !pathname.includes("document-processing"))

  const isHomeRoute = pathname === "/guide"

  const navLinkClass = (active: boolean) =>
    clsx(
      "relative rounded-full px-3 py-1 text-sm font-semibold transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      active
        ? "bg-primary/10 text-primary"
        : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
    )

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      aria-label="Main navigation"
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 gap-6">
        {/* Logo - keep as is on the left */}
        <Link href="/" className="flex items-center -my-8" aria-label="Go to homepage">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div className="relative mt-10 h-28 w-28 overflow-visible rounded-lg">
              <Image src="/logo2.png" alt="DocXtract logo" width={96} height={96} className="object-contain" />
            </div>
          </motion.div>
        </Link>

        {/* Centered navigation links (only visible when authenticated) */}
        {isAuthenticated && (
          <div className="hidden flex-1 items-center justify-center space-x-4 md:flex md:ml-20">
            <Link
              href="/guide"
              className={navLinkClass(isHomeRoute)}
              aria-current={isHomeRoute ? "page" : undefined}
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className={navLinkClass(isDashboardRoute)}
              aria-current={isDashboardRoute ? "page" : undefined}
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/document-processing"
              className={navLinkClass(pathname.includes("/dashboard/document-processing"))}
              aria-current={
                pathname.includes("/dashboard/document-processing") ? "page" : undefined
              }
            >
              Document Processing
            </Link>
          </div>
        )}

        {/* Right-side actions */}
        <div className="flex items-center space-x-2">
          <div className="hidden items-center space-x-2 sm:flex">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-semibold text-foreground" aria-live="polite">
                  {displayName}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-destructive text-destructive-foreground bg-destructive/90 hover:bg-destructive"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="btn-glow-pulse" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" className="btn-glow-pulse" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
