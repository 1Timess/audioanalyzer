"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function DashboardHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_28%)]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
            Dashboard
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your Workspace
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
            This is where you can start a new analysis, review past analysis, or view 
            other info about your usage!
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/past-analysis"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/8"
          >
            View Past Analysis
          </Link>

          <Link
            href="/dashboard/analyze"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Start New Analysis
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}