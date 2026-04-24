from __future__ import annotations

from dataclasses import dataclass
from statistics import median
from typing import Any

from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class GroupingResult:
    speaker_profiles: list[dict[str, Any]]
    grouping_meta: dict[str, Any]


class GroupingService:
    MIN_SEGMENTS_FOR_GROUPING = 2
    MAX_PITCH_DIFF_HZ = 35.0
    MAX_SYLLABLE_RATE_DIFF = 1.25

    @classmethod
    def group_segments(
        cls,
        *,
        segment_dicts: list[dict[str, Any]],
        voice_feature_vectors: list[Any],
        max_cluster_segments: int,
    ) -> GroupingResult:
        if not segment_dicts:
            return GroupingResult(
                speaker_profiles=[],
                grouping_meta={"method": "none", "reason": "no_segments"},
            )

        if len(segment_dicts) < cls.MIN_SEGMENTS_FOR_GROUPING:
            return GroupingResult(
                speaker_profiles=[],
                grouping_meta={
                    "method": "none",
                    "reason": "not_enough_segments",
                    "segment_count": len(segment_dicts),
                },
            )

        if not voice_feature_vectors or len(voice_feature_vectors) != len(segment_dicts):
            logger.warning("Grouping skipped because feature vectors are missing or mismatched.")
            return GroupingResult(
                speaker_profiles=[],
                grouping_meta={
                    "method": "none",
                    "reason": "invalid_feature_vectors",
                    "segment_count": len(segment_dicts),
                    "feature_vector_count": len(voice_feature_vectors),
                },
            )

        groups: list[dict[str, Any]] = []

        for index, segment in enumerate(segment_dicts):
            assigned_group_index = cls._find_best_group(
                segment=segment,
                groups=groups,
                segment_dicts=segment_dicts,
            )

            if (
                assigned_group_index is not None
                and len(groups[assigned_group_index]["segment_indexes"]) < max_cluster_segments
            ):
                groups[assigned_group_index]["segment_indexes"].append(index)
            else:
                groups.append(
                    {
                        "speaker_id": len(groups) + 1,
                        "segment_indexes": [index],
                    }
                )

        for group in groups:
            for segment_index in group["segment_indexes"]:
                segment_dicts[segment_index]["speaker_id"] = group["speaker_id"]

        speaker_profiles = [
            cls._build_speaker_profile(group=group, segment_dicts=segment_dicts)
            for group in groups
        ]

        return GroupingResult(
            speaker_profiles=speaker_profiles,
            grouping_meta={
                "method": "heuristic_greedy",
                "reason": "grouped",
                "segment_count": len(segment_dicts),
                "speaker_count": len(speaker_profiles),
                "max_cluster_segments": max_cluster_segments,
            },
        )

    @classmethod
    def _find_best_group(
        cls,
        *,
        segment: dict[str, Any],
        groups: list[dict[str, Any]],
        segment_dicts: list[dict[str, Any]],
    ) -> int | None:
        segment_pitch = cls._safe_float(segment.get("pitch_hz"))
        segment_rate = cls._safe_float(segment.get("syllable_rate"))

        best_group_index: int | None = None
        best_score: float | None = None

        for group_index, group in enumerate(groups):
            grouped_segments = [segment_dicts[i] for i in group["segment_indexes"]]

            group_pitch_values = [
                value for value in
                (cls._safe_float(item.get("pitch_hz")) for item in grouped_segments)
                if value is not None
            ]
            group_rate_values = [
                value for value in
                (cls._safe_float(item.get("syllable_rate")) for item in grouped_segments)
                if value is not None
            ]

            group_pitch = median(group_pitch_values) if group_pitch_values else None
            group_rate = median(group_rate_values) if group_rate_values else None

            pitch_diff = (
                abs(segment_pitch - group_pitch)
                if segment_pitch is not None and group_pitch is not None
                else None
            )
            rate_diff = (
                abs(segment_rate - group_rate)
                if segment_rate is not None and group_rate is not None
                else None
            )

            pitch_ok = pitch_diff is None or pitch_diff <= cls.MAX_PITCH_DIFF_HZ
            rate_ok = rate_diff is None or rate_diff <= cls.MAX_SYLLABLE_RATE_DIFF

            if not (pitch_ok and rate_ok):
                continue

            score = 0.0
            if pitch_diff is not None:
                score += pitch_diff
            if rate_diff is not None:
                score += rate_diff * 10.0

            if best_score is None or score < best_score:
                best_score = score
                best_group_index = group_index

        return best_group_index

    @classmethod
    def _build_speaker_profile(
        cls,
        *,
        group: dict[str, Any],
        segment_dicts: list[dict[str, Any]],
    ) -> dict[str, Any]:
        indexes = group["segment_indexes"]
        grouped_segments = [segment_dicts[i] for i in indexes]

        pitch_values = [
            value for value in
            (cls._safe_float(segment.get("pitch_hz")) for segment in grouped_segments)
            if value is not None
        ]
        syllable_values = [
            value for value in
            (cls._safe_float(segment.get("syllable_rate")) for segment in grouped_segments)
            if value is not None
        ]
        durations = [
            value for value in
            (cls._safe_float(segment.get("duration")) for segment in grouped_segments)
            if value is not None
        ]
        confidences = [
            value for value in
            (cls._safe_float(segment.get("confidence")) for segment in grouped_segments)
            if value is not None
        ]

        median_pitch = median(pitch_values) if pitch_values else None
        median_syllable_rate = median(syllable_values) if syllable_values else None
        total_duration_s = sum(durations) if durations else 0.0
        confidence = sum(confidences) / len(confidences) if confidences else None

        return {
            "speaker_id": group["speaker_id"],
            "label": f"Speaker {group['speaker_id']}",
            "segments": indexes,
            "total_duration_s": round(total_duration_s, 3),
            "median_pitch_hz": round(median_pitch, 3) if median_pitch is not None else None,
            "pitch_bucket": cls._pitch_bucket(median_pitch),
            "median_syllable_rate": round(median_syllable_rate, 3) if median_syllable_rate is not None else None,
            "tempo_bucket": cls._tempo_bucket(median_syllable_rate),
            "confidence": round(confidence, 3) if confidence is not None else None,
        }

    @staticmethod
    def _pitch_bucket(pitch_hz: float | None) -> str | None:
        if pitch_hz is None:
            return None
        if pitch_hz < 120:
            return "low"
        if pitch_hz < 190:
            return "mid"
        return "high"

    @staticmethod
    def _tempo_bucket(rate: float | None) -> str | None:
        if rate is None:
            return None
        if rate < 3.0:
            return "slow"
        if rate < 5.5:
            return "moderate"
        return "fast"

    @staticmethod
    def _safe_float(value: Any) -> float | None:
        try:
            if value is None:
                return None
            return float(value)
        except (TypeError, ValueError):
            return None