"use client"

import { AudioWaveform, Radar, SlidersHorizontal } from "lucide-react"
import LoginForm from "./LoginForm"

const previewRows = [
  {
    icon: AudioWaveform,
    label: "Voice activity",
    value: "Detected",
  },
  {
    icon: Radar,
    label: "Anomaly flags",
    value: "Tracked",
  },
  {
    icon: SlidersHorizontal,
    label: "Signal breakdown",
    value: "Structured",
  },
]

export default function LoginShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_26%),linear-gradient(to_bottom,#050505,#090909,#050505)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/4 shadow-2xl backdrop-blur-xl lg:grid-cols-[1fr_1.05fr]">
          <div className="hidden border-r border-white/10 lg:block">
            <div className="flex h-full flex-col justify-between p-10">
              <div className="space-y-8">
                <div className="inline-flex w-fit rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
                  Audio Analyzer
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-white">
                    Structured Audio Review, Built for Hard-to-Read Recordings.
                  </h1>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                        Product Preview
                      </p>
                      <p className="mt-2 text-lg font-medium text-white">
                        Analysis Interface Snapshot
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                      Live workflow
                    </div>
                  </div>

                  <div className="space-y-3">
                    {previewRows.map((item) => {
                      const Icon = item.icon

                      return (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-zinc-200">
                              <Icon className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-white">
                                {item.label}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Core analysis layer
                              </p>
                            </div>
                          </div>

                          <p className="text-sm font-semibold text-blue-200">
                            {item.value}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-linear-to-r from-blue-500/10 via-transparent to-purple-500/10 p-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                          Signal View
                        </p>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">
                          Designed to surface timing, activity shifts, and
                          notable moments in a format that is easier to review.
                        </p>
                      </div>

                      <div className="flex items-end gap-1">
                        <span className="h-5 w-2 rounded-full bg-white/10" />
                        <span className="h-9 w-2 rounded-full bg-blue-400/35" />
                        <span className="h-14 w-2 rounded-full bg-blue-300/75" />
                        <span className="h-8 w-2 rounded-full bg-purple-400/45" />
                        <span className="h-11 w-2 rounded-full bg-blue-400/55" />
                        <span className="h-6 w-2 rounded-full bg-white/10" />
                        <span className="h-13 w-2 rounded-full bg-blue-300/65" />
                        <span className="h-7 w-2 rounded-full bg-purple-400/35" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto flex min-h-full w-full max-w-md items-center">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}