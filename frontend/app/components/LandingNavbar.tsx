"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [open])

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  const NavLink = ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => (
    <a
      href={href}
      className="relative text-sm text-zinc-400 hover:text-white transition-colors group"
    >
      {children}
      <span className="absolute left-0 -bottom-1 h-px w-0 bg-indigo-400 transition-all duration-300 group-hover:w-full" />
    </a>
  )

  return (
    <>
      <nav
        className={`w-full sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <div className="flex flex-col">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight hover:opacity-80 transition"
            >
              AudioAnalyzer
            </Link>
            <span className="text-[11px] text-zinc-500 tracking-wide">
              Structured audio intelligence
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#workflow">How It Works</NavLink>
            <NavLink href="#discover">Discover</NavLink>
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="relative px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 transition shadow-lg shadow-indigo-500/30"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8"
          >
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                open ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                open ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>

        </div>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />

          {/* Slide Panel */}
          <div className="fixed top-0 right-0 w-72 h-full bg-zinc-950 border-l border-zinc-800 z-50 p-8 flex flex-col gap-8 animate-slide-in">
            
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#workflow">How It Works</NavLink>
            <NavLink href="#discover">Discover</NavLink>

            <div className="mt-auto flex flex-col gap-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm text-zinc-400 hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-center"
              >
                Start Free
              </Link>
            </div>

          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0%);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.25s ease-out;
        }
      `}</style>
    </>
  )
}