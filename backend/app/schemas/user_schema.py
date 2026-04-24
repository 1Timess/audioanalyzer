from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.schemas.plan_schema import PlanStatus, PlanTier


# ============================================================
# Enums
# ============================================================

class UsageIntent(str, Enum):
    PERSONAL = "personal"
    PROFESSIONAL = "professional"
    RESEARCH = "research"
    CREATIVE = "creative"
    OTHER = "other"


class ExperienceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    PROFESSIONAL = "professional"


# ============================================================
# Shared Nested Models
# ============================================================

class LoginIpRecord(BaseModel):
    """
    Tracks successful login activity.

    Keep this bounded in practice in DB logic
    (for example, only preserve the most recent 10-25 entries).
    """

    ip_address: str
    user_agent: str | None = None
    logged_in_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SecurityMetadata(BaseModel):
    """
    Security/account lifecycle metadata.
    """

    last_login_at: datetime | None = None
    last_login_ip: str | None = None
    last_login_user_agent: str | None = None

    failed_login_attempts: int = 0
    locked_until: datetime | None = None

    password_changed_at: datetime | None = None
    password_rehash_required: bool = False

    login_history: list[LoginIpRecord] = Field(default_factory=list)


class AnalysisSettings(BaseModel):
    """
    User-level analysis preferences or account capabilities.

    These are not final plan entitlements — those should still be
    resolved through plan_service.py — but this gives a clean place
    to store toggles/preferences/state tied to the account.
    """

    preferred_sample_rate: int = 16000
    enable_clip_previews: bool = False
    enable_speaker_profiles: bool = True
    enable_spatial_analysis: bool = False

    default_max_clip_seconds: float = 2.0
    preserve_original_upload_name: bool = True


class UsageCounters(BaseModel):
    """
    Lightweight user-level counters.

    Detailed period-based usage should still live in usage tracking,
    but these fields are useful for fast reads and UI summaries.
    """

    total_uploads: int = 0
    total_analyses: int = 0
    total_bytes_processed: int = 0
    total_processing_minutes: float = 0.0


class UserPlanInfo(BaseModel):
    """
    Plan state stored on the user account.

    This is raw account state.
    The resolved analysis profile should still come from plan_service.py.
    """

    tier: PlanTier = PlanTier.FREE
    status: PlanStatus = PlanStatus.ACTIVE

    started_at: datetime | None = None
    renews_at: datetime | None = None
    canceled_at: datetime | None = None


# ============================================================
# Request Schemas
# ============================================================

class UserCreate(BaseModel):
    """
    Registration payload.
    """

    email: EmailStr
    username: str = Field(min_length=3, max_length=30)
    password: str = Field(min_length=8)

    usage: UsageIntent
    experience: ExperienceLevel
    selected_plan: PlanTier = PlanTier.FREE


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


# ============================================================
# Stored User Document Schema
# ============================================================

class UserDocument(BaseModel):
    """
    Canonical application-side representation of a user record.

    This is useful when validating/serializing user documents pulled from Mongo.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: str | None = Field(default=None, alias="_id")

    email: EmailStr
    username: str

    password: str

    usage: UsageIntent
    experience: ExperienceLevel

    plan: UserPlanInfo = Field(default_factory=UserPlanInfo)
    usage_counters: UsageCounters = Field(default_factory=UsageCounters)
    analysis_settings: AnalysisSettings = Field(default_factory=AnalysisSettings)
    security: SecurityMetadata = Field(default_factory=SecurityMetadata)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    is_active: bool = True
    is_verified: bool = False
    is_admin: bool = False


# ============================================================
# Public / Safe Response Schemas
# ============================================================

class UserPublic(BaseModel):
    """
    Safe user shape to return to the frontend.
    """

    id: str | None = None
    email: EmailStr
    username: str

    usage: UsageIntent
    experience: ExperienceLevel

    plan_tier: PlanTier
    plan_status: PlanStatus

    total_uploads: int = 0
    total_analyses: int = 0

    created_at: datetime | None = None
    last_login_at: datetime | None = None


class AuthResponseUser(BaseModel):
    """
    User payload returned after login/me calls.
    """

    email: EmailStr
    username: str

    plan_tier: PlanTier
    plan_status: PlanStatus

    total_uploads: int = 0
    total_analyses: int = 0
    total_bytes_processed: int = 0

    is_verified: bool = False


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthResponseUser