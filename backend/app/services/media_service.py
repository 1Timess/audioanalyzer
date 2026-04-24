from __future__ import annotations

import json
import os
import subprocess
import tempfile
from dataclasses import dataclass

from fastapi import HTTPException, status

from app.schemas.plan_schema import AnalysisProfile


@dataclass
class MediaProbeResult:
    duration_seconds: float | None
    audio_streams: int
    has_video: bool


@dataclass
class PreparedMedia:
    normalized_audio_path: str
    stereo_reference_path: str | None
    probe: MediaProbeResult


class MediaService:
    """
    Media probing and normalization.

    Strategy:
    - Probe first
    - Enforce duration limits if configured
    - Produce a normalized mono analysis WAV
    - Optionally preserve a stereo analysis-ready reference when the plan allows it
    """

    @staticmethod
    def ensure_ffmpeg_available() -> None:
        try:
            subprocess.run(
                ["ffmpeg", "-version"],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            subprocess.run(
                ["ffprobe", "-version"],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception as exc:
            raise RuntimeError("ffmpeg/ffprobe must be installed and available in PATH.") from exc

    @staticmethod
    def probe_media(input_path: str) -> MediaProbeResult:
        cmd = [
            "ffprobe",
            "-v", "error",
            "-print_format", "json",
            "-show_streams",
            "-show_format",
            input_path,
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
            )
            data = json.loads(result.stdout)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to inspect uploaded media.",
            ) from exc

        streams = data.get("streams", [])
        format_info = data.get("format", {})

        audio_streams = sum(1 for s in streams if s.get("codec_type") == "audio")
        has_video = any(s.get("codec_type") == "video" for s in streams)

        duration = format_info.get("duration")
        duration_seconds = float(duration) if duration is not None else None

        if audio_streams < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file does not contain an audio stream.",
            )

        return MediaProbeResult(
            duration_seconds=duration_seconds,
            audio_streams=audio_streams,
            has_video=has_video,
        )

    @staticmethod
    def prepare_media(input_path: str, profile: AnalysisProfile) -> PreparedMedia:
        MediaService.ensure_ffmpeg_available()

        probe = MediaService.probe_media(input_path)

        if (
            profile.max_audio_duration_seconds is not None
            and probe.duration_seconds is not None
            and probe.duration_seconds > profile.max_audio_duration_seconds
        ):
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Media duration exceeds the maximum allowed for this plan.",
            )

        work_dir = tempfile.mkdtemp(prefix="analysis_media_")
        normalized_audio_path = os.path.join(work_dir, "analysis_mono.wav")
        stereo_reference_path = (
            os.path.join(work_dir, "spatial_stereo.wav")
            if profile.preserve_stereo_for_spatial and profile.enable_spatial_analysis
            else None
        )

        # Primary normalized analysis asset
        mono_cmd = [
            "ffmpeg",
            "-y",
            "-i", input_path,
            "-vn",
            "-ac", str(profile.normalized_channels),
            "-ar", str(profile.normalized_sample_rate),
            "-acodec", "pcm_s16le",
            normalized_audio_path,
        ]

        try:
            subprocess.run(
                mono_cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                check=True,
            )
        except subprocess.CalledProcessError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to normalize uploaded media.",
            ) from exc

        if stereo_reference_path is not None:
            stereo_cmd = [
                "ffmpeg",
                "-y",
                "-i", input_path,
                "-vn",
                "-ac", "2",
                "-ar", str(profile.normalized_sample_rate),
                "-acodec", "pcm_s16le",
                stereo_reference_path,
            ]
            try:
                subprocess.run(
                    stereo_cmd,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.PIPE,
                    check=True,
                )
            except subprocess.CalledProcessError:
                stereo_reference_path = None

        return PreparedMedia(
            normalized_audio_path=normalized_audio_path,
            stereo_reference_path=stereo_reference_path,
            probe=probe,
        )