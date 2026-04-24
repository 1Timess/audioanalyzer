"use client"

import { useMemo, useState } from "react"
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import { RegisterFormData } from "./RegisterWizard"

type AccountStepProps = {
  formData: RegisterFormData
  updateField: <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => void
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function getPasswordStrength(password: string) {
  let score = 0

  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 2) {
    return {
      label: "Weak",
      width: "33%",
      barClass: "bg-red-500",
      textClass: "text-red-300",
    }
  }

  if (score === 3 || score === 4) {
    return {
      label: "Good",
      width: "66%",
      barClass: "bg-yellow-400",
      textClass: "text-yellow-300",
    }
  }

  return {
    label: "Strong",
    width: "100%",
    barClass: "bg-emerald-500",
    textClass: "text-emerald-300",
  }
}

function inputBaseClass(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 ${
    hasError
      ? "border-red-400/40 bg-red-500/5 focus:border-red-400/60"
      : "border-white/10 bg-white/[0.04] focus:border-blue-400/50 focus:bg-white/[0.06]"
  }`
}

function StatusRow({
  valid,
  text,
}: {
  valid: boolean
  text: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      {valid ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      ) : (
        <AlertCircle className="h-4 w-4 text-zinc-500" />
      )}
      <span className={valid ? "text-emerald-300" : "text-zinc-400"}>{text}</span>
    </div>
  )
}

export default function AccountStep({
  formData,
  updateField,
}: AccountStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const email = formData.email.trim()
  const username = formData.username.trim()
  const password = formData.password
  const confirmPassword = formData.confirmPassword

  const emailHasValue = email.length > 0
  const emailValid = isValidEmail(email)

  const usernameHasValue = username.length > 0
  const usernameValid = username.length >= 3

  const passwordHasValue = password.length > 0
  const confirmHasValue = confirmPassword.length > 0

  const passwordStrength = useMemo(() => {
    return getPasswordStrength(password)
  }, [password])

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/3 p-5 sm:p-6">
        <div className="grid gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="johndoe@example.com"
              autoComplete="email"
              className={inputBaseClass(emailHasValue && !emailValid)}
            />

            {emailHasValue && (
              <p
                className={`text-xs ${
                  emailValid ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {emailValid ? "Valid email address." : "Enter a valid email address."}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => updateField("username", e.target.value)}
              placeholder="johndoe"
              autoComplete="username"
              className={inputBaseClass(usernameHasValue && !usernameValid)}
            />

            {usernameHasValue && (
              <p
                className={`text-xs ${
                  usernameValid ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {usernameValid
                  ? "Username looks good."
                  : "Username must be at least 3 characters."}
              </p>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className={`${inputBaseClass(false)} pr-12`}
                />

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
              </div>

              <div className="mt-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-2 transition-all duration-300 ${passwordHasValue ? passwordStrength.barClass : "bg-white/10"}`}
                  style={{ width: passwordHasValue ? passwordStrength.width : "0%" }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">Password strength</p>
                <p className={`text-xs font-medium ${passwordStrength.textClass}`}>
                  {passwordHasValue ? passwordStrength.label : "Enter a password"}
                </p>
              </div>

              <div className="mt-3 grid gap-2">
                <StatusRow valid={passwordChecks.length} text="At least 8 characters" />
                <StatusRow valid={passwordChecks.uppercase} text="One uppercase letter" />
                <StatusRow valid={passwordChecks.lowercase} text="One lowercase letter" />
                <StatusRow valid={passwordChecks.number} text="One number" />
                <StatusRow valid={passwordChecks.special} text="One special character" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={`${inputBaseClass(confirmHasValue && !passwordsMatch)} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                  aria-label={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {confirmHasValue && (
                <p
                  className={`text-xs ${
                    passwordsMatch ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {passwordsMatch ? "Passwords match." : "Passwords do not match."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}