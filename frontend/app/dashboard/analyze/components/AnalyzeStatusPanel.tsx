"use client"

import { Clock3, LoaderCircle, ShieldCheck } from "lucide-react"

const states = [
  {
    icon: Clock3,
    title: "Waiting for upload",
    description: "No file has been submitted yet.",
  },
  {
    icon: LoaderCircle,
    title: "Processing placeholder",
    description: "Progress and pipeline stages can be surfaced here later.",
  },
  {
    icon: ShieldCheck,
    title: "Results handoff",
    description: "Use this area for completion state, errors, and next actions.",
  },
]

export default function AnalyzeStatusPanel() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/4 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Pipeline Status
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Analysis state tracking
        </h2>
      </div>

      <div className="space-y-3">
        {states.map((state) => {
          const Icon = state.icon

          return (
            <div
              key={state.title}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-zinc-300">
                <Icon className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium text-white">{state.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {state.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}