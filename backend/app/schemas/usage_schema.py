from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class UsageSnapshot(BaseModel):
    """
    Current usage state for a user's active billing / quota period.
    """

    user_id: str
    period_start: datetime
    period_end: datetime

    uploads_used: int = 0
    uploads_limit: int | None = None

    bytes_processed: int = 0
    bytes_limit: int | None = None

    analysis_minutes_used: float = 0.0
    analysis_minutes_limit: float | None = None


class UsageCheckResult(BaseModel):
    """
    Result of checking whether a user can perform a new analysis request.
    """

    allowed: bool
    reason: str
    snapshot: UsageSnapshot


class UsageIncrement(BaseModel):
    """
    Data to persist after a successful analysis.
    """

    upload_count_delta: int = 1
    bytes_processed_delta: int = Field(default=0, ge=0)
    analysis_minutes_delta: float = Field(default=0.0, ge=0.0)