import Link from "next/link"
import { AudioWaveform, ChevronRight } from "lucide-react"

export default function DashboardEmptyState() {
  return (
    <section className="rounded-3xl border border-dashed border-white/10 bg-white/3 p-8 text-center shadow-xl backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-200">
          <AudioWaveform className="h-6 w-6" />
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          No dashboard data yet
        </h2>

        <p className="mt-3 text-sm leading-7 text-zinc-400 sm:text-base">
          This area is ready for real account metrics, recent sessions, saved
          breakdowns, and progress summaries once the logged-in workflow is
          fully connected.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/analyze"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Start First Analysis
            <ChevronRight className="h-4 w-4" />
          </Link>

          <Link
            href="/past-analysis"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/8"
          >
            Browse Past Analysis
          </Link>
        </div>
      </div>
    </section>
  )
}