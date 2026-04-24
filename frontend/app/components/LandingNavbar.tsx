"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type AuthUser = {
  email: string
  username: string
  plan_tier?: string
  plan_status?: string
  total_uploads?: number
  total_analyses?: number
  total_bytes_processed?: number
  is_verified?: boolean
  last_login_at?: string | null
}

type NavLinkItem = {
  href: string
  label: string
}

function formatPlanLabel(plan?: string) {
  if (!plan) return "Free"

  return plan
    .split(/[\s-_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export default function LandingNavbar() {
  const pathname = usePathname()

  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  const syncAuthState = useCallback(async () => {
    const token = sessionStorage.getItem("access_token")
    const cachedUser = sessionStorage.getItem("auth_user")

    if (!token) {
      setIsAuthenticated(false)
      setUser(null)
      setAuthChecked(true)
      return
    }

    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser) as AuthUser
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch {
        sessionStorage.removeItem("auth_user")
      }
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        sessionStorage.removeItem("access_token")
        sessionStorage.removeItem("auth_user")
        setIsAuthenticated(false)
        setUser(null)
        setAuthChecked(true)
        return
      }

      const data = await res.json()

      if (data.user) {
        sessionStorage.setItem("auth_user", JSON.stringify(data.user))
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        sessionStorage.removeItem("auth_user")
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Navbar auth check failed:", error)
    } finally {
      setAuthChecked(true)
    }
  }, [])

  useEffect(() => {
    syncAuthState()
  }, [syncAuthState])

  useEffect(() => {
    const handleAuthChanged = () => {
      syncAuthState()
    }

    window.addEventListener("auth-changed", handleAuthChanged)

    return () => {
      window.removeEventListener("auth-changed", handleAuthChanged)
    }
  }, [syncAuthState])

  const guestLinks = useMemo<NavLinkItem[]>(
    () => [
      { href: "#features", label: "Features" },
      { href: "#workflow", label: "How It Works" },
      { href: "#discover", label: "Discover" },
    ],
    []
  )

  const authLinks = useMemo<NavLinkItem[]>(
    () => [
      { href: "/past-analysis", label: "Past Analysis" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/community", label: "Community" },
    ],
    []
  )

  const links = isAuthenticated ? authLinks : guestLinks

  const handleLogout = () => {
    sessionStorage.removeItem("access_token")
    sessionStorage.removeItem("auth_user")
    setUser(null)
    setIsAuthenticated(false)
    setOpen(false)
    window.dispatchEvent(new Event("auth-changed"))
    window.location.href = "/"
  }

  const isLinkActive = (href: string) => {
    if (href.startsWith("#")) return false
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const NavItem = ({
    href,
    children,
    closeOnClick = false,
  }: {
    href: string
    children: React.ReactNode
    closeOnClick?: boolean
  }) => {
    const isAnchor = href.startsWith("#")
    const active = isAuthenticated && !isAnchor && isLinkActive(href)

    const baseClasses =
      "group relative text-sm transition-colors duration-200"
    const toneClasses = active
      ? "text-white"
      : "text-zinc-400 hover:text-white"

    const underlineClasses = active
      ? "w-full bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.75)]"
      : "w-0 bg-indigo-400 group-hover:w-full"

    if (isAnchor) {
      return (
        <a
          href={href}
          onClick={() => closeOnClick && setOpen(false)}
          className={`${baseClasses} ${toneClasses}`}
        >
          {children}
          <span
            className={`absolute left-0 -bottom-1 h-px transition-all duration-300 ${underlineClasses}`}
          />
        </a>
      )
    }

    return (
      <Link
        href={href}
        onClick={() => closeOnClick && setOpen(false)}
        className={`${baseClasses} ${toneClasses}`}
      >
        {children}
        <span
          className={`absolute left-0 -bottom-1 h-px transition-all duration-300 ${underlineClasses}`}
        />
      </Link>
    )
  }

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex flex-col">
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="text-xl font-semibold tracking-tight transition hover:opacity-80"
            >
              WaveTrace
            </Link>
            <span className="text-[11px] tracking-wide text-zinc-500">
              Structured audio intelligence
            </span>
          </div>

          <div className="hidden items-center gap-10 md:flex">
            {links.map((link) => (
              <NavItem key={link.label} href={link.href}>
                {link.label}
              </NavItem>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {!authChecked ? null : isAuthenticated ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">
                    {user?.username || "Account"}
                  </span>

                  <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                    {formatPlanLabel(user?.plan_tier)}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-linear-to-r from-indigo-500 to-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-90"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>

          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="animate-slide-in fixed right-0 top-0 z-50 flex h-full w-72 flex-col gap-8 border-l border-zinc-800 bg-zinc-950 p-8">
            {links.map((link) => (
              <NavItem key={link.label} href={link.href} closeOnClick>
                {link.label}
              </NavItem>
            ))}

            <div className="mt-auto flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">
                        {user?.username || "Account"}
                      </p>

                      <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                        {formatPlanLabel(user?.plan_tier)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-zinc-500">
                      {user?.email || ""}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="text-left text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
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
                    className="rounded-xl bg-linear-to-r from-indigo-500 to-blue-500 px-5 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Start Free
                  </Link>
                </>
              )}
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