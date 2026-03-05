"use client"

import { useState } from "react"
import { motion } from "framer-motion"

type Segment = {
  id: number
  time: string
  type: string
  detail: string
  confidence: number
}

const segments: Segment[] = [
  {
    id: 1,
    time: "00:42",
    type: "Frequency Spike",
    detail: "High amplitude irregularity detected above baseline waveform.",
    confidence: 0.87,
  },
  {
    id: 2,
    time: "01:08",
    type: "Speaker Shift",
    detail: "Vocal profile characteristics changed from previous segment.",
    confidence: 0.72,
  },
  {
    id: 3,
    time: "01:37",
    type: "Signal Deviation",
    detail: "Pattern inconsistent with surrounding spectral behavior.",
    confidence: 0.64,
  },
]

export default function DiscoveryDemoSection() {
  const [active, setActive] = useState<number>(1)

  return (
    <section className="px-6 py-32 relative relative">
      <div className="max-w-6xl mx-auto text-center">

        <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight">
          What You Might Discover
        </h2>

        <p className="text-zinc-400 max-w-2xl mx-auto mb-16 text-lg">
          Interactive signal analysis reveals measurable irregularities,
          speaker variation, and unexpected waveform behavior.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8 text-left shadow-2xl shadow-indigo-600/10"
        >

          {/* Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <DemoStat label="Duration" value="02:14" tooltip="Total analyzed audio length." />
            <DemoStat label="Segments" value="3" tooltip="Detected structured speech or anomaly events." />
            <DemoStat label="Speakers" value="2" tooltip="Grouped voice characteristics, not biometric ID." />
            <DemoStat label="Sample Rate" value="44.1kHz" tooltip="Audio resolution used during analysis." />
          </div>

          <p className="text-xs text-zinc-500 mb-6">
            Click a segment below to inspect how analysis highlights irregularities.
          </p>

          {/* Timeline */}
          <div className="space-y-3">
            {segments.map((seg) => {
              const pct = Math.round(seg.confidence * 100)
              const selected = active === seg.id

              return (
                <button
                  key={seg.id}
                  onClick={() => setActive(seg.id)}
                  className={`w-full text-left rounded-2xl border px-5 py-4 transition ${
                    selected
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                      : "border-zinc-700 bg-zinc-950/40 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex justify-between items-center">

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {seg.time} — {seg.type}
                      </p>
                    </div>

                    <Tooltip content="Confidence reflects statistical certainty of detection.">
                      <ConfidenceBar value={seg.confidence} />
                    </Tooltip>
                  </div>

                  {selected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 space-y-2"
                    >
                      <p className="text-sm text-zinc-400">
                        {seg.detail}
                      </p>

                      <p className="text-xs text-zinc-500">
                        Detection confidence: {pct}% — higher values indicate stronger signal consistency.
                      </p>
                    </motion.div>
                  )}
                </button>
              )
            })}
          </div>

        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- Components ---------------- */

type DemoStatProps = {
  label: string
  value: string | number
  tooltip: string
}

function DemoStat({ label, value, tooltip }: DemoStatProps) {
  return (
    <Tooltip content={tooltip}>
      <div className="rounded-2xl border border-zinc-700 bg-zinc-950/40 p-4 cursor-default hover:border-zinc-600 transition">
        <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
        <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      </div>
    </Tooltip>
  )
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-24 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-blue-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400">{pct}%</span>
    </div>
  )
}

/* ---------------- Tooltip ---------------- */

function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: string
}) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition shadow-lg shadow-black/30">
        {content}
      </div>
    </div>
  )
}