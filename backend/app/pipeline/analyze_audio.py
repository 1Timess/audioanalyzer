from __future__ import annotations

import os
import time

from app.schemas.analysis_schema import AnalysisResponseSchema
from app.schemas.plan_schema import AnalysisProfile
from app.schemas.usage_schema import UsageIncrement
from app.services.feature_service import FeatureService
from app.services.grouping_service import GroupingService
from app.services.media_service import MediaService
from app.services.response_service import ResponseService
from app.services.upload_service import StagedUpload, UploadService
from app.services.usage_service import UsageService
from app.services.vad_service import VADService
from app.utils.audio import encode_wav_clip_base64


class AudioAnalysisPipeline:
    """
    Central orchestration point for the audio analysis flow.

    High-level flow:
    1. Uploaded file has already been validated/staged.
    2. Media is probed and normalized.
    3. Normalized audio is segmented with VAD.
    4. Per-segment features are extracted.
    5. Optional speaker grouping is performed.
    6. Response is shaped according to the resolved plan profile.
    7. Usage is recorded.
    """

    @staticmethod
    async def run(
        *,
        user_id: str,
        staged_upload: StagedUpload,
        profile: AnalysisProfile,
    ) -> AnalysisResponseSchema:
        started_at = time.perf_counter()
        prepared_media = None

        try:
            prepared_media = MediaService.prepare_media(
                input_path=staged_upload.temp_path,
                profile=profile,
            )

            # --------------------------------------------------
            # Load normalized mono analysis asset + detect VAD
            # --------------------------------------------------
            mono_samples, sample_rate, channels, vad_segments = VADService.load_and_detect(
                prepared_media.normalized_audio_path
            )

            # Optional stereo reference for spatial analysis
            stereo_samples = None
            stereo_sample_rate = None
            stereo_channels = None

            if (
                profile.enable_spatial_analysis
                and profile.preserve_stereo_for_spatial
                and prepared_media.stereo_reference_path
            ):
                stereo_samples, stereo_sample_rate, stereo_channels = VADService.load_audio_file(
                    prepared_media.stereo_reference_path
                )

            segment_dicts: list[dict] = []
            voice_feature_vectors = []

            for index, vad_segment in enumerate(vad_segments):
                mono_segment_samples = mono_samples[
                    vad_segment.start_sample:vad_segment.end_sample
                ]

                # If stereo reference exists and aligns, use it for spatial analysis.
                # Otherwise fall back to mono segment samples.
                if (
                    stereo_samples is not None
                    and stereo_sample_rate == sample_rate
                    and stereo_channels == 2
                    and vad_segment.end_sample <= len(stereo_samples)
                ):
                    feature_segment_samples = stereo_samples[
                        vad_segment.start_sample:vad_segment.end_sample
                    ]
                    feature_channels = stereo_channels
                else:
                    feature_segment_samples = mono_segment_samples
                    feature_channels = channels

                segment_features, voice_vector = FeatureService.extract_segment_features(
                    segment_samples=feature_segment_samples,
                    sample_rate=sample_rate,
                    channels=feature_channels,
                    duration_seconds=vad_segment.duration_seconds,
                    speech_probability=vad_segment.speech_probability,
                    max_pitch_window_seconds=profile.max_pitch_window_seconds,
                )

                clip_base64 = None
                if (
                    profile.enable_clip_previews
                    and len(segment_dicts) < profile.max_clip_previews
                ):
                    max_clip_samples = int(sample_rate * profile.max_clip_seconds)
                    clip_samples = mono_segment_samples[:max_clip_samples]
                    clip_base64 = encode_wav_clip_base64(
                        samples=clip_samples,
                        sample_rate=sample_rate,
                        channels=channels,
                    )

                segment_dict = {
                    "start": vad_segment.start_seconds,
                    "end": vad_segment.end_seconds,
                    "duration": vad_segment.duration_seconds,
                    "rms": segment_features.rms,
                    "pitch_hz": segment_features.pitch_hz,
                    "syllable_rate": segment_features.syllable_rate,
                    "confidence": segment_features.confidence,
                    "balance": segment_features.balance,
                    "balance_val": segment_features.balance_val,
                    "direction": segment_features.direction,
                    "direction_confidence": segment_features.direction_confidence,
                    "distance_label": segment_features.distance_label,
                    "distance_estimate_ft": segment_features.distance_estimate_ft,
                    "distance_confidence": segment_features.distance_confidence,
                    "spatial_note": segment_features.spatial_note,
                    "rhythm_estimate": None,
                    "speaker_id": None,
                    "clip_base64": clip_base64,
                }

                segment_dicts.append(segment_dict)
                voice_feature_vectors.append(voice_vector)

            # --------------------------------------------------
            # Attach shared rhythm estimate
            # --------------------------------------------------
            rhythm_estimate = FeatureService.attach_rhythm_to_segments(segment_dicts)

            # --------------------------------------------------
            # Speaker grouping
            # --------------------------------------------------
            grouping_meta = {
                "method": "none",
                "reason": "speaker_profiles_disabled",
            }
            speaker_profiles: list[dict] = []

            if profile.enable_speaker_profiles and segment_dicts:
                grouping_result = GroupingService.group_segments(
                    segment_dicts=segment_dicts,
                    voice_feature_vectors=voice_feature_vectors,
                    max_cluster_segments=profile.max_cluster_segments,
                )
                speaker_profiles = grouping_result.speaker_profiles
                grouping_meta = grouping_result.grouping_meta

            # --------------------------------------------------
            # Build metadata / debug block
            # --------------------------------------------------
            debug_metadata = None
            if profile.include_debug_metadata:
                debug_metadata = {
                    "vad_segment_count": len(vad_segments),
                    "grouping_meta": grouping_meta,
                    "rhythm_estimate": rhythm_estimate,
                    "used_stereo_reference": bool(
                        stereo_samples is not None
                        and stereo_sample_rate == sample_rate
                        and stereo_channels == 2
                    ),
                    "normalized_audio_path": os.path.basename(
                        prepared_media.normalized_audio_path
                    ) if prepared_media.normalized_audio_path else None,
                    "stereo_reference_path": os.path.basename(
                        prepared_media.stereo_reference_path
                    ) if prepared_media.stereo_reference_path else None,
                }

            raw_result = {
                "sample_rate": sample_rate,
                "channels": channels,
                "segments": segment_dicts,
                "speaker_profiles": speaker_profiles,
                "metadata": {
                    "filename": staged_upload.original_filename,
                    "content_type": staged_upload.content_type,
                    "file_size_bytes": staged_upload.size_bytes,
                    "original_duration_seconds": prepared_media.probe.duration_seconds,
                    "normalized_sample_rate": sample_rate,
                    "normalized_channels": channels,
                    "plan_tier": profile.plan_tier.value,
                    "debug": debug_metadata,
                },
            }

            response = AnalysisResponseSchema.model_validate(raw_result)
            response = ResponseService.shape_response(
                response=response,
                profile=profile,
            )

            elapsed_minutes = max((time.perf_counter() - started_at) / 60.0, 0.0)
            await UsageService.record_usage(
                user_id=user_id,
                increment=UsageIncrement(
                    upload_count_delta=1,
                    bytes_processed_delta=staged_upload.size_bytes,
                    analysis_minutes_delta=elapsed_minutes,
                ),
            )

            return response

        finally:
            if prepared_media is not None:
                normalized_parent = os.path.dirname(prepared_media.normalized_audio_path)
                UploadService.cleanup_directory(normalized_parent)