"use client"

import Link from "next/link"
import { ChevronLeft, Sparkles } from "lucide-react"

export default function AnalyzeHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_28%)]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
            <Sparkles className="h-3.5 w-3.5" />
            Analysis Workspace
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Submit audio and review the full breakdown in one place
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            This workspace is structured for upload, configuration, processing
            state, and results. The backend wiring can slot into this layout
            without needing to rebuild the interface later.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/8"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}