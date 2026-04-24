from __future__ import annotations

from app.schemas.plan_schema import (
    AnalysisProfile,
    PlanResolutionResult,
    PlanStatus,
    PlanTier,
)
from app.schemas.usage_schema import UsageSnapshot


class PlanService:
    """
    Resolves a user's plan + usage context into an AnalysisProfile.

    Downstream services should read only the resolved profile rather than
    branching on plan names directly.
    """

    ONE_GB = 1024 * 1024 * 1024

    @staticmethod
    def resolve_profile(
        *,
        plan_tier: PlanTier,
        plan_status: PlanStatus,
        usage_snapshot: UsageSnapshot | None = None,
    ) -> PlanResolutionResult:
        """
        Return an analysis profile based on plan tier and status.

        This is the core entitlement gate for the analysis pipeline.
        """
        if plan_status in {PlanStatus.CANCELED, PlanStatus.PAST_DUE}:
            # Conservative fallback if billing is no longer in good standing.
            profile = AnalysisProfile(
                plan_tier=PlanTier.FREE,
                plan_status=plan_status,
                max_upload_bytes=25 * 1024 * 1024,
                max_audio_duration_seconds=15 * 60,
                enable_speaker_profiles=True,
                enable_spatial_analysis=False,
                enable_clip_previews=False,
                max_clip_previews=0,
                max_clip_seconds=0.0,
                max_pitch_window_seconds=1.5,
                max_cluster_segments=250,
                preserve_stereo_for_spatial=False,
                normalized_sample_rate=16000,
                normalized_channels=1,
                normalized_sample_width=2,
                max_processing_minutes=10,
                include_debug_metadata=False,
                include_extended_segment_metrics=True,
            )
            return PlanResolutionResult(profile=profile, reason="billing_not_active")

        if plan_tier == PlanTier.FREE:
            profile = AnalysisProfile(
                plan_tier=plan_tier,
                plan_status=plan_status,
                max_upload_bytes=25 * 1024 * 1024,
                max_audio_duration_seconds=15 * 60,
                enable_speaker_profiles=True,
                enable_spatial_analysis=False,
                enable_clip_previews=False,
                max_clip_previews=0,
                max_clip_seconds=0.0,
                max_pitch_window_seconds=1.5,
                max_cluster_segments=250,
                preserve_stereo_for_spatial=False,
                normalized_sample_rate=16000,
                normalized_channels=1,
                normalized_sample_width=2,
                max_processing_minutes=10,
                include_debug_metadata=False,
                include_extended_segment_metrics=True,
            )
            return PlanResolutionResult(profile=profile, reason="resolved_free")

        if plan_tier == PlanTier.PRO:
            profile = AnalysisProfile(
                plan_tier=plan_tier,
                plan_status=plan_status,
                max_upload_bytes=250 * 1024 * 1024,
                max_audio_duration_seconds=60 * 60,
                enable_speaker_profiles=True,
                enable_spatial_analysis=False,
                enable_clip_previews=True,
                max_clip_previews=6,
                max_clip_seconds=2.0,
                max_pitch_window_seconds=2.0,
                max_cluster_segments=750,
                preserve_stereo_for_spatial=False,
                normalized_sample_rate=16000,
                normalized_channels=1,
                normalized_sample_width=2,
                max_processing_minutes=20,
                include_debug_metadata=False,
                include_extended_segment_metrics=True,
            )
            return PlanResolutionResult(profile=profile, reason="resolved_pro")

        if plan_tier == PlanTier.EXPERT:
            profile = AnalysisProfile(
                plan_tier=plan_tier,
                plan_status=plan_status,
                max_upload_bytes=PlanService.ONE_GB,
                max_audio_duration_seconds=2 * 60 * 60,
                enable_speaker_profiles=True,
                enable_spatial_analysis=True,
                enable_clip_previews=True,
                max_clip_previews=10,
                max_clip_seconds=2.0,
                max_pitch_window_seconds=2.0,
                max_cluster_segments=1000,
                preserve_stereo_for_spatial=True,
                normalized_sample_rate=16000,
                normalized_channels=1,
                normalized_sample_width=2,
                max_processing_minutes=30,
                include_debug_metadata=False,
                include_extended_segment_metrics=True,
            )
            return PlanResolutionResult(profile=profile, reason="resolved_expert")

        # Enterprise defaults
        profile = AnalysisProfile(
            plan_tier=PlanTier.ENTERPRISE,
            plan_status=plan_status,
            max_upload_bytes=PlanService.ONE_GB,
            max_audio_duration_seconds=4 * 60 * 60,
            enable_speaker_profiles=True,
            enable_spatial_analysis=True,
            enable_clip_previews=True,
            max_clip_previews=12,
            max_clip_seconds=2.0,
            max_pitch_window_seconds=2.0,
            max_cluster_segments=1500,
            preserve_stereo_for_spatial=True,
            normalized_sample_rate=16000,
            normalized_channels=1,
            normalized_sample_width=2,
            max_processing_minutes=45,
            include_debug_metadata=True,
            include_extended_segment_metrics=True,
        )
        return PlanResolutionResult(profile=profile, reason="resolved_enterprise")