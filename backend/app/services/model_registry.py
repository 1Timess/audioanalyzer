from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path


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