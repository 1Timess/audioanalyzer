"use client"

import { useMemo, useState } from "react"
import UsageStep from "./UsageStep"
import AccountStep from "./AccountStep"
import PlanStep from "./PlanStep"

type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "professional" | ""
type UsageType = "personal" | "professional" | "research" | "creative" | "other" | ""

export type RegisterFormData = {
  usage: UsageType
  experience: ExperienceLevel
  email: string
  username: string
  password: string
  confirmPassword: string
  selectedPlan: "free" | "pro" | "expert" | "enterprise" | ""
}

const TOTAL_STEPS = 3

const STEP_META = [
  {
    number: 1,
    eyebrow: "Step 1",
    title: "Usage & experience",
    subtitle: "A quick setup so we can tailor the platform later.",
  },
  {
    number: 2,
    eyebrow: "Step 2",
    title: "Account creation",
    subtitle: "Set up your login details and secure your account.",
  },
  {
    number: 3,
    eyebrow: "Step 3",
    title: "Choose a plan",
    subtitle: "Pick the plan you want to start with.",
  },
] as const

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function RegisterWizard() {
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<RegisterFormData>({
    usage: "",
    experience: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    selectedPlan: "free",
  })

  const activeStep = STEP_META[step - 1]

  const progressPercent = useMemo(() => {
    return (step / TOTAL_STEPS) * 100
  }, [step])

  const updateField = <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const nextStep = () => {
    setMessage("")
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }

  const prevStep = () => {
    setMessage("")
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const validateStepOne = () => {
    if (!formData.usage || !formData.experience) {
      setMessage("Please choose your usage and experience level.")
      return false
    }

    return true
  }

  const validateStepTwo = () => {
    const email = formData.email.trim()
    const username = formData.username.trim()

    if (!email || !username || !formData.password || !formData.confirmPassword) {
      setMessage("Please fill out all account fields.")
      return false
    }

    if (!isValidEmail(email)) {
      setMessage("Please enter a valid email address.")
      return false
    }

    if (username.length < 3) {
      setMessage("Username must be at least 3 characters.")
      return false
    }

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters.")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.")
      return false
    }

    return true
  }

  const handleContinue = () => {
    if (step === 1 && !validateStepOne()) return
    if (step === 2 && !validateStepTwo()) return

    nextStep()
  }

  const handleSubmit = async () => {
    setMessage("")

    if (!validateStepOne()) {
      setStep(1)
      return
    }

    if (!validateStepTwo()) {
      setStep(2)
      return
    }

    if (!formData.selectedPlan) {
      setMessage("Please choose a plan.")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          username: formData.username.trim(),
          password: formData.password,
          usage: formData.usage,
          experience: formData.experience,
          selected_plan: formData.selectedPlan,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.detail || "Registration failed.")
        return
      }

      setMessage(data.message || "Registration complete.")
    } catch (error) {
      console.error("Registration failed:", error)
      setMessage("Something went wrong while creating your account.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_28%),linear-gradient(to_bottom,#050505,#090909,#050505)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full rounded-3xl border border-white/10 bg-white/4 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
                    Audio Analyzer
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                      {activeStep.eyebrow}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {activeStep.title}
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                      {activeStep.subtitle}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:w-70">
                  {STEP_META.map((item) => {
                    const isActive = item.number === step
                    const isComplete = item.number < step

                    return (
                      <div
                        key={item.number}
                        className={`rounded-2xl border px-3 py-3 text-center transition ${
                          isActive
                            ? "border-blue-400/40 bg-blue-500/10"
                            : isComplete
                            ? "border-emerald-400/30 bg-emerald-500/10"
                            : "border-white/10 bg-white/3"
                        }`}
                      >
                        <div
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            isComplete
                              ? "bg-emerald-400/20 text-emerald-200"
                              : isActive
                              ? "bg-blue-400/20 text-blue-100"
                              : "bg-white/10 text-zinc-300"
                          }`}
                        >
                          {isComplete ? "✓" : item.number}
                        </div>
                        <p className="mt-2 text-xs font-medium text-zinc-300">
                          {item.title}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-blue-500 via-cyan-400 to-violet-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto w-full max-w-3xl">
              {step === 1 && (
                <UsageStep formData={formData} updateField={updateField} />
              )}

              {step === 2 && (
                <AccountStep formData={formData} updateField={updateField} />
              )}

              {step === 3 && (
                <PlanStep formData={formData} updateField={updateField} />
              )}

              {message && (
                <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {message}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 1 || isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>

                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}