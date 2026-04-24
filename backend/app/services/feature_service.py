from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import torch

from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class SegmentFeatures:
    rms: float
    pitch_hz: float | None
    syllable_rate: float
    confidence: float
    balance: str
    balance_val: float
    direction: str
    direction_confidence: float
    distance_label: str
    distance_estimate_ft: list[float]
    distance_confidence: float
    spatial_note: str


class FeatureService:
    """
    Central lazy-loading service for ML models and feature-related helpers
    used by the analysis pipeline.
    """

    _vad_model: Any = None
    _vad_utils: Any = None

    @classmethod
    def get_silero_vad(cls) -> tuple[Any, Any]:
        if cls._vad_model is None or cls._vad_utils is None:
            logger.info("Loading Silero VAD model...")
            cls._vad_model, cls._vad_utils = torch.hub.load(
                "snakers4/silero-vad",
                "silero_vad",
                trust_repo=True,
            )
            logger.info("Silero VAD model loaded.")

        return cls._vad_model, cls._vad_utils

    @staticmethod
    def extract_segment_features(
        *,
        segment_samples: np.ndarray | list[float],
        sample_rate: int,
        channels: int,
        duration_seconds: float,
        speech_probability: float,
        max_pitch_window_seconds: float,
    ) -> tuple[SegmentFeatures, list[float]]:
        samples = np.asarray(segment_samples, dtype=np.float32)

        if samples.ndim == 1:
            mono = samples
            stereo = None
        elif samples.ndim == 2:
            if samples.shape[1] == 1:
                mono = samples[:, 0]
                stereo = None
            elif samples.shape[1] >= 2:
                stereo = samples[:, :2]
                mono = stereo.mean(axis=1)
            else:
                mono = samples.flatten()
                stereo = None
        else:
            mono = samples.flatten()
            stereo = None

        if mono.size == 0 or sample_rate <= 0 or duration_seconds <= 0:
            empty_features = SegmentFeatures(
                rms=0.0,
                pitch_hz=None,
                syllable_rate=0.0,
                confidence=0.0,
                balance="center",
                balance_val=0.0,
                direction="center",
                direction_confidence=0.0,
                distance_label="unknown",
                distance_estimate_ft=[0.0, 0.0],
                distance_confidence=0.0,
                spatial_note="empty segment",
            )
            return empty_features, [0.0] * 6

        rms = float(np.sqrt(np.mean(np.square(mono)))) if mono.size else 0.0
        pitch_hz = FeatureService._estimate_pitch(
            mono=mono,
            sample_rate=sample_rate,
            max_pitch_window_seconds=max_pitch_window_seconds,
        )
        syllable_rate = FeatureService._estimate_syllable_rate(
            mono=mono,
            sample_rate=sample_rate,
            duration_seconds=duration_seconds,
        )

        spectral_centroid = FeatureService._spectral_centroid(
            mono=mono,
            sample_rate=sample_rate,
        )
        spectral_rolloff = FeatureService._spectral_rolloff(
            mono=mono,
            sample_rate=sample_rate,
        )

        balance, balance_val, direction, direction_confidence, spatial_note = (
            FeatureService._estimate_balance_and_direction(
                stereo=stereo,
                mono=mono,
                channels=channels,
            )
        )

        distance_label, distance_estimate_ft, distance_confidence = (
            FeatureService._estimate_distance(rms=rms)
        )

        confidence = FeatureService._estimate_confidence(
            speech_probability=speech_probability,
            rms=rms,
        )

        segment_features = SegmentFeatures(
            rms=rms,
            pitch_hz=pitch_hz,
            syllable_rate=syllable_rate,
            confidence=confidence,
            balance=balance,
            balance_val=balance_val,
            direction=direction,
            direction_confidence=direction_confidence,
            distance_label=distance_label,
            distance_estimate_ft=distance_estimate_ft,
            distance_confidence=distance_confidence,
            spatial_note=spatial_note,
        )

        nyquist = max(sample_rate / 2.0, 1.0)

        voice_vector = [
            float(np.clip(rms, 0.0, 1.0)),
            float(np.clip((pitch_hz or 0.0) / 500.0, 0.0, 1.0)),
            float(np.clip(syllable_rate / 10.0, 0.0, 1.0)),
            float(np.clip(spectral_centroid / nyquist, 0.0, 1.0)),
            float(np.clip(spectral_rolloff / nyquist, 0.0, 1.0)),
            float(np.clip(confidence, 0.0, 1.0)),
        ]

        return segment_features, voice_vector

    @staticmethod
    def attach_rhythm_to_segments(segment_dicts: list[dict]) -> str | None:
        if not segment_dicts:
            return None

        rates = [
            float(seg["syllable_rate"])
            for seg in segment_dicts
            if seg.get("syllable_rate") is not None
        ]

        if not rates:
            rhythm = "unknown"
        else:
            avg_rate = sum(rates) / len(rates)

            if avg_rate < 2.0:
                rhythm = "slow"
            elif avg_rate < 4.5:
                rhythm = "moderate"
            else:
                rhythm = "fast"

        for seg in segment_dicts:
            seg["rhythm_estimate"] = rhythm

        return rhythm

    @staticmethod
    def _estimate_pitch(
        *,
        mono: np.ndarray,
        sample_rate: int,
        max_pitch_window_seconds: float,
    ) -> float | None:
        max_samples = max(int(sample_rate * max_pitch_window_seconds), 1)
        window = mono[:max_samples]

        if window.size < max(int(sample_rate * 0.03), 1):
            return None

        centered = window - np.mean(window)
        energy = float(np.sum(centered ** 2))
        if energy <= 1e-10:
            return None

        autocorr = np.correlate(centered, centered, mode="full")
        autocorr = autocorr[len(autocorr) // 2 :]

        min_hz = 70.0
        max_hz = 350.0

        min_lag = max(int(sample_rate / max_hz), 1)
        max_lag = min(int(sample_rate / min_hz), len(autocorr) - 1)

        if max_lag <= min_lag:
            return None

        search = autocorr[min_lag:max_lag]
        if search.size == 0:
            return None

        peak_index = int(np.argmax(search))
        peak_value = float(search[peak_index])

        if peak_value <= 0:
            return None

        lag = peak_index + min_lag
        if lag <= 0:
            return None

        pitch = float(sample_rate / lag)

        if pitch < min_hz or pitch > max_hz:
            return None

        return pitch

    @staticmethod
    def _estimate_syllable_rate(
        *,
        mono: np.ndarray,
        sample_rate: int,
        duration_seconds: float,
    ) -> float:
        if mono.size < max(int(sample_rate * 0.15), 1):
            return 0.0

        envelope = np.abs(mono)
        window = max(int(sample_rate * 0.03), 1)

        if window > 1:
            kernel = np.ones(window, dtype=np.float32) / window
            envelope = np.convolve(envelope, kernel, mode="same")

        threshold = float(np.mean(envelope) + 0.5 * np.std(envelope))
        if threshold <= 0:
            return 0.0

        min_spacing = max(int(sample_rate * 0.12), 1)

        peaks = 0
        last_peak = -min_spacing

        for i in range(1, len(envelope) - 1):
            if (
                envelope[i] > threshold
                and envelope[i] >= envelope[i - 1]
                and envelope[i] >= envelope[i + 1]
                and (i - last_peak) >= min_spacing
            ):
                peaks += 1
                last_peak = i

        return float(peaks / max(duration_seconds, 1e-6))

    @staticmethod
    def _spectral_centroid(*, mono: np.ndarray, sample_rate: int) -> float:
        if mono.size == 0:
            return 0.0

        spectrum = np.abs(np.fft.rfft(mono))
        freqs = np.fft.rfftfreq(len(mono), d=1.0 / sample_rate)

        magnitude_sum = float(np.sum(spectrum))
        if magnitude_sum <= 1e-10:
            return 0.0

        return float(np.sum(freqs * spectrum) / magnitude_sum)

    @staticmethod
    def _spectral_rolloff(
        *,
        mono: np.ndarray,
        sample_rate: int,
        roll_percent: float = 0.85,
    ) -> float:
        if mono.size == 0:
            return 0.0

        spectrum = np.abs(np.fft.rfft(mono))
        freqs = np.fft.rfftfreq(len(mono), d=1.0 / sample_rate)

        total_energy = float(np.sum(spectrum))
        if total_energy <= 1e-10:
            return 0.0

        cumulative = np.cumsum(spectrum)
        threshold = roll_percent * total_energy
        idx = int(np.searchsorted(cumulative, threshold))

        if idx >= len(freqs):
            idx = len(freqs) - 1

        return float(freqs[idx])

    @staticmethod
    def _estimate_balance_and_direction(
        *,
        stereo: np.ndarray | None,
        mono: np.ndarray,
        channels: int,
    ) -> tuple[str, float, str, float, str]:
        if stereo is None or channels < 2:
            return "center", 0.0, "center", 0.0, "mono analysis"

        left = stereo[:, 0]
        right = stereo[:, 1]

        left_energy = float(np.sqrt(np.mean(np.square(left)))) if left.size else 0.0
        right_energy = float(np.sqrt(np.mean(np.square(right)))) if right.size else 0.0

        total = left_energy + right_energy
        if total <= 1e-10:
            return "center", 0.0, "center", 0.0, "stereo energy too low"

        balance_val = float((right_energy - left_energy) / total)

        if balance_val <= -0.2:
            balance = "left"
            direction = "left"
        elif balance_val >= 0.2:
            balance = "right"
            direction = "right"
        else:
            balance = "center"
            direction = "center"

        direction_confidence = float(min(abs(balance_val) * 2.5, 1.0))

        return balance, balance_val, direction, direction_confidence, "stereo heuristic"

    @staticmethod
    def _estimate_distance(rms: float) -> tuple[str, list[float], float]:
        if rms >= 0.25:
            return "very close", [0.0, 5.0], 0.8
        if rms >= 0.12:
            return "close", [5.0, 10.0], 0.7
        if rms >= 0.06:
            return "medium", [10.0, 20.0], 0.6
        if rms >= 0.02:
            return "far", [20.0, 35.0], 0.5
        return "very far", [35.0, 50.0], 0.4

    @staticmethod
    def _estimate_confidence(
        *,
        speech_probability: float,
        rms: float,
    ) -> float:
        speech_component = float(np.clip(speech_probability, 0.0, 1.0))
        loudness_component = float(np.clip(rms / 0.2, 0.0, 1.0))
        return float((0.7 * speech_component) + (0.3 * loudness_component))