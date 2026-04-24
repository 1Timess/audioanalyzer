"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function inputBaseClass(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 ${
    hasError
      ? "border-red-400/40 bg-red-500/5 focus:border-red-400/60"
      : "border-white/10 bg-white/[0.04] focus:border-blue-400/50 focus:bg-white/[0.06]"
  }`
}

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailTrimmed = email.trim()
  const emailTouched = email.length > 0
  const emailValid = isValidEmail(emailTrimmed)

  const canSubmit = useMemo(() => {
    return emailValid && password.length > 0 && !isSubmitting
  }, [emailValid, password, isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setIsError(false)

    if (!emailTrimmed || !password) {
      setMessage("Please enter your email and password.")
      setIsError(true)
      return
    }

    if (!emailValid) {
      setMessage("Please enter a valid email address.")
      setIsError(true)
      return
    }

    setIsSubmitting(true)

    try {
      localStorage.removeItem("access_token")
      localStorage.removeItem("auth_user")
      sessionStorage.removeItem("access_token")
      sessionStorage.removeItem("auth_user")

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailTrimmed,
          password,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setMessage(
          typeof data?.detail === "string"
            ? data.detail
            : "Unable to sign in."
        )
        setIsError(true)
        return
      }

      if (!data?.access_token || typeof data.access_token !== "string") {
        setMessage("Login succeeded, but no valid access token was returned.")
        setIsError(true)
        return
      }

      sessionStorage.setItem("access_token", data.access_token)

      if (data.user) {
        sessionStorage.setItem("auth_user", JSON.stringify(data.user))
      }

      window.dispatchEvent(new Event("auth-changed"))
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Login failed:", error)
      setMessage("Something went wrong while signing in.")
      setIsError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 space-y-3">
        <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200 lg:hidden">
          Audio Analyzer
        </div>

        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Sign in
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Enter your account details to continue.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputBaseClass(emailTouched && !emailValid)}
          />

          {emailTouched && !emailValid && (
            <div className="flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span>Enter a valid email address.</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-300"
            >
              Password
            </label>

            <button
              type="button"
              className="text-xs text-zinc-400 transition hover:text-white"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={`${inputBaseClass(false)} pr-12`}
            />

            {password.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              isError
                ? "border-red-400/20 bg-red-500/10 text-red-100"
                : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-white transition hover:text-blue-300"
        >
          Create one
        </Link>
      </div>
    </div>
  )
}