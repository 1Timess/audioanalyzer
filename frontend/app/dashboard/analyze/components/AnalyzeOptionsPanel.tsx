"use client"

const options = [
  {
    label: "Language / speech assumptions",
    helper: "Placeholder area for analysis configuration.",
  },
  {
    label: "Sensitivity and detection tuning",
    helper: "Use this block later for threshold and processing controls.",
  },
  {
    label: "Output preferences",
    helper: "Reserve space for clip previews, summaries, and result formatting.",
  },
]

export default function AnalyzeOptionsPanel() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/4 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Analysis Options
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Processing controls
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Keep the structure ready for future analysis settings without locking
          the UI into backend decisions too early.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.label}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <p className="text-sm font-medium text-white">{option.label}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {option.helper}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}