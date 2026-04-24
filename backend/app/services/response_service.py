from __future__ import annotations

from app.schemas.analysis_schema import AnalysisResponseSchema
from app.schemas.plan_schema import AnalysisProfile


class ResponseService:
    """
    Applies plan-aware shaping to the final response.

    This avoids sprinkling free-vs-paid response logic across the pipeline.
    """

    @staticmethod
    def shape_response(
        *,
        response: AnalysisResponseSchema,
        profile: AnalysisProfile,
    ) -> AnalysisResponseSchema:
        if not profile.enable_speaker_profiles:
            response.speaker_profiles = []

        if not profile.enable_clip_previews:
            for segment in response.segments:
                segment.clip_base64 = None

        if not profile.enable_spatial_analysis:
            for segment in response.segments:
                segment.direction = None
                segment.direction_confidence = None
                segment.distance_label = None
                segment.distance_estimate_ft = None
                segment.distance_confidence = None
                segment.spatial_note = None
                segment.balance = None
                segment.balance_val = None

        if response.metadata and not profile.include_debug_metadata:
            response.metadata.debug = None

        return response