"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function HeroSection() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section className="relative px-6 pt-32 pb-24 overflow-hidden">

      {/* Ambient Gradient Blend */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-950/40 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

        {/* RIGHT SIDE FIRST ON MOBILE */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="order-1 lg:order-2 relative"
        >

          {/* Completed Analysis Report Card */}
          <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-8 shadow-2xl shadow-indigo-500/10 transition hover:shadow-indigo-500/20">

            <div className="mb-6 flex justify-between text-sm text-zinc-400">
              <span>Analysis Report</span>
              <span className="text-emerald-400 font-medium">Completed</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard
                index={0}
                hovered={hovered}
                setHovered={setHovered}
                label="Segments Detected"
                value="3"
                detail="Structured speech events isolated"
              />
              <StatCard
                index={1}
                hovered={hovered}
                setHovered={setHovered}
                label="Speaker Profiles"
                value="2"
                detail="Heuristic voice grouping applied"
              />
              <StatCard
                index={2}
                hovered={hovered}
                setHovered={setHovered}
                label="Anomaly Flags"
                value="1"
                detail="Signal deviation detected"
              />
              <StatCard
                index={3}
                hovered={hovered}
                setHovered={setHovered}
                label="Confidence"
                value="87%"
                detail="Statistical signal certainty"
              />
            </div>

            {/* Confidence Visualization */}
            <div className="mt-6">
              <p className="text-xs text-zinc-500 mb-2">
                Signal Confidence Distribution
              </p>

              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "87%" }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-gradient-to-r from-indigo-400 to-blue-400"
                />
              </div>
            </div>

          </div>

        </motion.div>

        {/* LEFT SIDE */}
        <div className="order-2 lg:order-1">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            From Raw Audio
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">
              To Structured Insight
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-8 text-lg text-zinc-400 max-w-xl leading-relaxed"
          >
            Detect speech segmentation, frequency anomalies,
            spatial inference, and measurable signal deviations —
            presented in a clean, structured report.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="mt-12 flex flex-wrap gap-5"
          >
            <Link
              href="/register"
              className="px-8 py-4 text-lg font-semibold text-white rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 shadow-xl shadow-indigo-500/30 hover:scale-[1.04] transition-all"
            >
              Start Free
            </Link>

            <Link
              href="#discover"
              className="px-8 py-4 text-lg border border-zinc-700 rounded-2xl hover:border-zinc-500 transition"
            >
              View Live Demo
            </Link>
          </motion.div>

          <p className="mt-6 text-sm text-zinc-500">
            No credit card required • Instant access • Private & secure
          </p>

        </div>

      </div>

      {/* Bottom Fade For Seamless Blend */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-transparent to-zinc-950 pointer-events-none" />

    </section>
  )
}

function StatCard({
  index,
  hovered,
  setHovered,
  label,
  value,
  detail,
}: {
  index: number
  hovered: number | null
  setHovered: (v: number | null) => void
  label: string
  value: string
  detail: string
}) {
  const active = hovered === index

  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className="relative rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 cursor-pointer transition hover:border-indigo-500/40"
    >
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>

      {active && (
        <div className="absolute inset-0 rounded-xl bg-indigo-500/10 blur-xl -z-10 transition" />
      )}

      {active && (
        <p className="mt-2 text-xs text-zinc-400">
          {detail}
        </p>
      )}
    </div>
  )
}