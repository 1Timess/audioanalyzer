from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class PlanTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    EXPERT = "expert"
    ENTERPRISE = "enterprise"


class PlanStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    TRIALING = "trialing"


class AnalysisProfile(BaseModel):
    """
    Resolved analysis configuration for a user at request time.

    This should be the single source of truth that downstream pipeline
    services read from instead of branching on raw plan names everywhere.
    """

    plan_tier: PlanTier
    plan_status: PlanStatus

    max_upload_bytes: int = Field(..., description="Maximum allowed upload size in bytes.")
    max_audio_duration_seconds: int | None = Field(
        default=None,
        description="Optional duration cap after media probe."
    )

    enable_speaker_profiles: bool = True
    enable_spatial_analysis: bool = False
    enable_clip_previews: bool = False

    max_clip_previews: int = 0
    max_clip_seconds: float = 0.0

    max_pitch_window_seconds: float = 2.0
    max_cluster_segments: int = 1000

    preserve_stereo_for_spatial: bool = False
    normalized_sample_rate: int = 16000
    normalized_channels: int = 1
    normalized_sample_width: int = 2

    max_processing_minutes: int = 20

    include_debug_metadata: bool = False
    include_extended_segment_metrics: bool = True


class PlanResolutionResult(BaseModel):
    """
    Full plan resolution payload returned by the plan service.
    """

    profile: AnalysisProfile
    reason: str = "resolved"