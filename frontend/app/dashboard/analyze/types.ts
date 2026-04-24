export type AnalysisSegment = {
  start: number
  end: number
  duration: number
  rms: number | null
  pitch_hz: number | null
  syllable_rate: number | null
  confidence: number | null
  balance: string | null
  balance_val: number | null
  direction: string | null
  direction_confidence: number | null
  distance_label: string | null
  distance_estimate_ft: number | null
  distance_confidence: number | null
  spatial_note: string | null
  rhythm_estimate: string | null
  speaker_id: number | null
  clip_base64: string | null
}

export type SpeakerProfile = {
  speaker_id: number
  label: string
  segments: number[]
  total_duration_s: number
  median_pitch_hz: number | null
  pitch_bucket: string | null
  median_syllable_rate: number | null
  tempo_bucket: string | null
  confidence: number | null
}

export type AnalysisMetadata = {
  filename: string
  content_type: string
  file_size_bytes: number
  original_duration_seconds: number
  normalized_sample_rate: number
  normalized_channels: number
  plan_tier: string
  debug: Record<string, unknown> | null
}

export type AnalysisResult = {
  sample_rate: number
  channels: number
  segments: AnalysisSegment[]
  speaker_profiles: SpeakerProfile[]
  metadata: AnalysisMetadata
}