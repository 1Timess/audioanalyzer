from pydantic import BaseModel


class SpeakerProfileSchema(BaseModel):
    speaker_id: int

    label: str | None = None
    segments: list[int] | None = None

    total_duration_s: float | None = None

    median_pitch_hz: float | None = None
    pitch_bucket: str | None = None

    median_syllable_rate: float | None = None
    tempo_bucket: str | None = None

    confidence: float | None = None