from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
from scipy.io import wavfile

from app.services.feature_service import FeatureService


@dataclass
class VADSegment:
    start_sample: int
    end_sample: int
    start_seconds: float
    end_seconds: float
    duration_seconds: float
    speech_probability: float


class VADService:
    @staticmethod
    def load_audio_file(path: str) -> tuple[np.ndarray, int, int]:
        sample_rate, samples = wavfile.read(path)

        if samples.ndim == 1:
            channels = 1
        else:
            channels = samples.shape[1]

        if np.issubdtype(samples.dtype, np.integer):
            max_val = np.iinfo(samples.dtype).max
            samples = samples.astype(np.float32) / float(max_val)
        else:
            samples = samples.astype(np.float32)

        return samples, int(sample_rate), int(channels)

    @staticmethod
    def load_and_detect(path: str) -> tuple[np.ndarray, int, int, list[VADSegment]]:
        samples, sample_rate, channels = VADService.load_audio_file(path)

        if channels > 1:
            mono_samples = samples.mean(axis=1).astype(np.float32)
        else:
            mono_samples = samples.astype(np.float32)

        vad_model, vad_utils = FeatureService.get_silero_vad()
        get_speech_timestamps = vad_utils[0]

        speech_timestamps = get_speech_timestamps(
            mono_samples,
            vad_model,
            sampling_rate=sample_rate,
        )

        vad_segments: list[VADSegment] = []

        for ts in speech_timestamps:
            start_sample = int(ts["start"])
            end_sample = int(ts["end"])

            start_seconds = start_sample / sample_rate
            end_seconds = end_sample / sample_rate
            duration_seconds = max(end_seconds - start_seconds, 0.0)

            vad_segments.append(
                VADSegment(
                    start_sample=start_sample,
                    end_sample=end_sample,
                    start_seconds=start_seconds,
                    end_seconds=end_seconds,
                    duration_seconds=duration_seconds,
                    speech_probability=1.0,
                )
            )

        return mono_samples, sample_rate, channels, vad_segments