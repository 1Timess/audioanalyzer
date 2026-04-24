from typing import Any

from pydantic import BaseModel, Field

from app.schemas.segment_schema import SegmentSchema
from app.schemas.speaker_schema import SpeakerProfileSchema


class AnalysisMetadataSchema(BaseModel):
    filename: str | None = None
    content_type: str | None = None
    file_size_bytes: int | None = None

    original_duration_seconds: float | None = None
    normalized_sample_rate: int | None = None
    normalized_channels: int | None = None

    plan_tier: str | None = None
    debug: dict[str, Any] | None = None


class AnalysisResponseSchema(BaseModel):
    sample_rate: int
    channels: int

    segments: list[SegmentSchema] = Field(default_factory=list)
    speaker_profiles: list[SpeakerProfileSchema] = Field(default_factory=list)

    metadata: AnalysisMetadataSchema | None = None