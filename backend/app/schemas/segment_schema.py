from pydantic import BaseModel


class SegmentSchema(BaseModel):
    start: float
    end: float
    duration: float

    rms: float | None = None
    pitch_hz: float | None = None
    syllable_rate: float | None = None
    confidence: float | None = None

    balance: str | None = None
    balance_val: float | None = None

    direction: str | None = None
    direction_confidence: float | None = None

    distance_label: str | None = None
    distance_estimate_ft: list[float] | None = None
    distance_confidence: float | None = None

    spatial_note: str | None = None
    rhythm_estimate: str | None = None
    speaker_id: int | str | None = None
    clip_base64: str | None = None