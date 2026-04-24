from __future__ import annotations

import base64
import io
import os
import shutil
import tempfile
import wave
from pathlib import Path

import numpy as np


def ensure_directory(path: str) -> str:
    os.makedirs(path, exist_ok=True)
    return path


def create_temp_directory(prefix: str = "tmp_") -> str:
    return tempfile.mkdtemp(prefix=prefix)


def create_temp_file_path(prefix: str = "tmp_", suffix: str = "") -> str:
    fd, path = tempfile.mkstemp(prefix=prefix, suffix=suffix)
    os.close(fd)
    return path


def get_file_extension(filename: str | None) -> str:
    if not filename:
        return ""
    return Path(filename).suffix.lower()


def file_exists(path: str | None) -> bool:
    return bool(path and os.path.exists(path))


def get_file_size_bytes(path: str) -> int:
    return int(os.path.getsize(path))


def cleanup_file(path: str | None) -> None:
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass


def cleanup_directory(path: str | None) -> None:
    if path and os.path.exists(path):
        shutil.rmtree(path, ignore_errors=True)


def encode_wav_clip_base64(
    *,
    samples: np.ndarray,
    sample_rate: int,
    channels: int,
) -> str:
    if samples is None:
        return ""

    array = np.asarray(samples)

    if array.size == 0:
        return ""

    if array.dtype != np.float32:
        array = array.astype(np.float32)

    array = np.clip(array, -1.0, 1.0)
    pcm16 = (array * 32767.0).astype(np.int16)

    buffer = io.BytesIO()

    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(int(channels))
        wav_file.setsampwidth(2)
        wav_file.setframerate(int(sample_rate))
        wav_file.writeframes(pcm16.tobytes())

    return base64.b64encode(buffer.getvalue()).decode("utf-8")