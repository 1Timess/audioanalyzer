"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AudioLines,
  BarChart3,
  Clock3,
  FileAudio,
  UserRound,
  Waves,
} from "lucide-react"
import type { AnalysisResult } from "../types"

type AnalyzeResultsPanelProps = {
  result: AnalysisResult | null
  isLoading?: boolean
}

function formatNumber(
  value: number | null | undefined,
  digits = 2,
  suffix = ""
) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—"
  }

  return `${value.toFixed(digits)}${suffix}`
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—"
  }

  return `${Math.round(value * 100)}%`
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function getConfidenceTone(confidence: number | null | undefined) {
  if (confidence === null || confidence === undefined) {
    return "border-white/10 bg-white/5 text-zinc-300"
  }

  if (confidence >= 0.8) {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  if (confidence >= 0.6) {
    return "border-amber-400/20 bg-amber-500/10 text-amber-100"
  }

  return "border-red-400/20 bg-red-500/10 text-red-100"
}

function getSpeakerLabel(speakerId: number | null | undefined) {
  if (speakerId === null || speakerId === undefined) {
    return "Unassigned"
  }

  return `Speaker ${speakerId}`
}

function getSelectedSpeakerSummary(
  speakerProfiles: AnalysisResult["speaker_profiles"],
  speakerId: number | null | undefined
) {
  if (speakerId === null || speakerId === undefined) {
    return null
  }

  return speakerProfiles.find((speaker) => speaker.speaker_id === speakerId) ?? null
}

function EmptyState() {
  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/4 p-5 lg:p-6 2xl:p-7 shadow-xl backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Results
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Analysis output
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
            Upload a file to view returned analysis data in a cleaner,
            report-style breakdown.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-200">
          <Waves className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-4">
        {[
          {
            icon: AudioLines,
            title: "Overview",
            description:
              "High-level summary cards for duration, segments, speakers, and confidence.",
          },
          {
            icon: UserRound,
            title: "Speaker Profiles",
            description:
              "Compact grouped speaker summaries with pitch, tempo, and confidence.",
          },
          {
            icon: BarChart3,
            title: "Segment Explorer",
            description:
              "A selectable segment list on the left and detailed metrics on the right.",
          },
        ].map((block) => {
          const Icon = block.icon

          return (
            <div
              key={block.title}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-zinc-200">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">{block.title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {block.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex min-h-72 flex-1 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-linear-to-b from-white/2 to-transparent p-8 text-center">
        <div className="max-w-md">
          <h3 className="text-lg font-medium text-white">
            Awaiting first analysis run
          </h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Once a file is processed, this panel will switch into a more
            structured explorer view.
          </p>
        </div>
      </div>
    </section>
  )
}

function LoadingState() {
  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/4 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Results
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Analysis output
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
            Your file is currently being processed.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-200">
          <Waves className="h-5 w-5 animate-pulse" />
        </div>
      </div>

      <div className="flex min-h-80 flex-1 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-linear-to-b from-white/2 to-transparent p-8 text-center">
        <div className="max-w-md">
          <h3 className="text-lg font-medium text-white">Running analysis</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Segment detection, feature extraction, and speaker grouping are in
            progress.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function AnalyzeResultsPanel({
  result,
  isLoading = false,
}: AnalyzeResultsPanelProps) {
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0)

  useEffect(() => {
    setSelectedSegmentIndex(0)
  }, [result])

  if (isLoading) {
    return <LoadingState />
  }

  if (!result) {
    return <EmptyState />
  }

  const { metadata, segments, speaker_profiles, sample_rate, channels } = result

  const averageConfidence =
    segments.length > 0
      ? segments.reduce((sum, segment) => sum + (segment.confidence ?? 0), 0) /
        segments.length
      : null

  const activeSegment = segments[selectedSegmentIndex] ?? null
  const activeSpeaker = activeSegment
    ? getSelectedSpeakerSummary(speaker_profiles, activeSegment.speaker_id)
    : null

  const overviewCards = [
    {
      label: "Duration",
      value: formatNumber(metadata.original_duration_seconds, 2, "s"),
      meta: metadata.filename,
      icon: Clock3,
    },
    {
      label: "Sample Rate",
      value: `${sample_rate} Hz`,
      meta: `${channels} channel${channels === 1 ? "" : "s"}`,
      icon: Waves,
    },
    {
      label: "Segments",
      value: String(segments.length),
      meta: `${speaker_profiles.length} speaker group${
        speaker_profiles.length === 1 ? "" : "s"
      }`,
      icon: AudioLines,
    },
    {
      label: "File Size",
      value: formatFileSize(metadata.file_size_bytes),
      meta: metadata.plan_tier,
      icon: FileAudio,
    },
  ]

  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/4 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Results
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Analysis output
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            A structured view of returned file metadata, segment detection, and
            speaker grouping.
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-medium ${getConfidenceTone(
            averageConfidence
          )}`}
        >
          <span>Average confidence</span>
          <span>{formatPercent(averageConfidence)}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {card.value}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-400">
                    {card.meta}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-zinc-200">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-zinc-200">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium text-white">Speaker Profiles</p>
              <p className="text-sm text-zinc-400">
                Compact grouped voice summaries from the current analysis run.
              </p>
            </div>
          </div>

          {speaker_profiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-zinc-400">
              No speaker profiles were returned for this file.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {speaker_profiles.map((speaker) => (
                <div
                  key={speaker.speaker_id}
                  className="rounded-2xl border border-white/10 bg-white/3 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {speaker.label}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {speaker.segments.length} segment
                        {speaker.segments.length === 1 ? "" : "s"} ·{" "}
                        {formatNumber(speaker.total_duration_s, 2, "s")}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getConfidenceTone(
                        speaker.confidence
                      )}`}
                    >
                      {formatPercent(speaker.confidence)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Pitch bucket
                      </p>
                      <p className="mt-1 text-sm font-medium capitalize text-white">
                        {speaker.pitch_bucket ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Median pitch
                      </p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {formatNumber(speaker.median_pitch_hz, 1, " Hz")}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Tempo
                      </p>
                      <p className="mt-1 text-sm font-medium capitalize text-white">
                        {speaker.tempo_bucket ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Syllable rate
                      </p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {formatNumber(speaker.median_syllable_rate, 2, "/s")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-zinc-200">
              <BarChart3 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium text-white">Segment Explorer</p>
              <p className="text-sm text-zinc-400">
                Select a segment to inspect its timing, metrics, and linked
                speaker summary.
              </p>
            </div>
          </div>

          {segments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-zinc-400">
              No segments were returned for this file.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-2 xl:max-h-170 xl:overflow-y-auto xl:pr-1">
                {segments.map((segment, index) => {
                  const isActive = index === selectedSegmentIndex

                  return (
                    <button
                      key={`${segment.start}-${segment.end}-${index}`}
                      type="button"
                      onClick={() => setSelectedSegmentIndex(index)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-blue-400/40 bg-blue-500/10 shadow-[0_0_0_1px_rgba(96,165,250,0.18)]"
                          : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">
                            Segment {index + 1}
                          </p>
                          <p className="mt-1 text-xs text-zinc-400">
                            {formatNumber(segment.start, 2, "s")} →{" "}
                            {formatNumber(segment.end, 2, "s")}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getConfidenceTone(
                            segment.confidence
                          )}`}
                        >
                          {formatPercent(segment.confidence)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-zinc-200">
                          {getSpeakerLabel(segment.speaker_id)}
                        </span>

                        {segment.rhythm_estimate && (
                          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] capitalize text-zinc-200">
                            {segment.rhythm_estimate}
                          </span>
                        )}

                        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-zinc-200">
                          {formatNumber(segment.duration, 2, "s")}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {activeSegment && (
                <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                  <div className="flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        Segment {selectedSegmentIndex + 1}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {formatNumber(activeSegment.start, 2, "s")} →{" "}
                        {formatNumber(activeSegment.end, 2, "s")} · duration{" "}
                        {formatNumber(activeSegment.duration, 2, "s")}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-200">
                        {getSpeakerLabel(activeSegment.speaker_id)}
                      </span>

                      {activeSegment.rhythm_estimate && (
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs capitalize text-zinc-200">
                          {activeSegment.rhythm_estimate}
                        </span>
                      )}

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getConfidenceTone(
                          activeSegment.confidence
                        )}`}
                      >
                        {formatPercent(activeSegment.confidence)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        RMS
                      </p>
                      <p className="mt-2 text-base font-semibold text-white">
                        {formatNumber(activeSegment.rms, 4)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Pitch
                      </p>
                      <p className="mt-2 text-base font-semibold text-white">
                        {formatNumber(activeSegment.pitch_hz, 1, " Hz")}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Syllable rate
                      </p>
                      <p className="mt-2 text-base font-semibold text-white">
                        {formatNumber(activeSegment.syllable_rate, 2, "/s")}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Direction
                      </p>
                      <p className="mt-2 text-base font-semibold capitalize text-white">
                        {activeSegment.direction ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Distance
                      </p>
                      <p className="mt-2 text-base font-semibold text-white">
                        {activeSegment.distance_label ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Spatial note
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {activeSegment.spatial_note ?? "No spatial note returned."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                        Playback
                      </p>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {activeSegment.clip_base64
                          ? "Clip preview is attached for this segment."
                          : "No audio clip preview was attached for this segment."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                        Linked speaker
                      </p>

                      {activeSpeaker ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-white">
                            {activeSpeaker.label}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {activeSpeaker.segments.length} segment
                            {activeSpeaker.segments.length === 1 ? "" : "s"} ·{" "}
                            {formatNumber(activeSpeaker.total_duration_s, 2, "s")}
                          </p>
                          <p className="text-xs text-zinc-400">
                            Tempo: {activeSpeaker.tempo_bucket ?? "—"}
                          </p>
                          <p className="text-xs text-zinc-400">
                            Pitch bucket: {activeSpeaker.pitch_bucket ?? "—"}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-zinc-400">
                          No linked speaker profile for this segment.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}