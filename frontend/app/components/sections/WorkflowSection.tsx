"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

const steps = [
  {
    title: "Upload",
    description:
      "Securely upload raw recordings in supported formats for structured analysis.",
  },
  {
    title: "Analyze",
    description:
      "Signal processing detects speech segments, anomalies, and measurable irregularities.",
  },
  {
    title: "Review",
    description:
      "Interact with structured results, inspect segments, and export findings.",
  },
]

export default function WorkflowSection() {
  const [active, setActive] = useState(0)

  return (
    <section className="px-6 pt-20 pb-24 relative">

      {/* Flow Bridge */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center">

        <h2 className="text-4xl font-semibold mb-4 tracking-tight">
          How It Works
        </h2>

        <p className="text-zinc-500 text-sm mb-16">
          From raw recording to structured insight.
        </p>

        {/* Progress Line */}
        <div className="relative mb-16 hidden md:block">
          <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800" />

          <motion.div
            layout
            className="absolute top-1/2 left-0 h-px bg-gradient-to-r from-indigo-500 to-blue-500"
            style={{
              width: `${(active / (steps.length - 1)) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 120 }}
          />
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-10 relative">
          {steps.map((step, i) => {
            const isActive = active === i

            return (
              <div
                key={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className="relative cursor-pointer"
              >
                {/* Step Number */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    layout
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold border transition-all ${
                      isActive
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30"
                        : "bg-zinc-900 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {i + 1}
                  </motion.div>
                </div>

                {/* Title */}
                <h3
                  className={`text-xl font-semibold mb-4 transition ${
                    isActive ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <motion.p
                  animate={{ opacity: isActive ? 1 : 0.5 }}
                  className="text-sm text-zinc-400 max-w-xs mx-auto"
                >
                  {step.description}
                </motion.p>

                {/* Glow Accent */}
                {isActive && (
                  <motion.div
                    layoutId="workflow-glow"
                    className="absolute inset-0 -z-10 rounded-2xl bg-indigo-500/10 blur-2xl"
                    transition={{ type: "spring", stiffness: 120 }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Final CTA */}
        <div className="mt-24">

          <div className="relative max-w-3xl mx-auto rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-10 text-center shadow-xl shadow-indigo-500/10">

            <h3 className="text-2xl font-semibold mb-4">
              Start Analyzing Today
            </h3>

            <p className="text-zinc-400 mb-8">
              Upload your first recording and explore structured signal analysis in seconds.
            </p>

            <div className="flex justify-center gap-4">
              <Link
                href="/register"
                className="px-6 py-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
              >
                Create Account
              </Link>

              <Link
                href="/login"
                className="px-6 py-3 border border-zinc-700 rounded-xl hover:border-zinc-500 transition"
              >
                Sign In
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}