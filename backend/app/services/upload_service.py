from __future__ import annotations

import os
import shutil
import tempfile
from dataclasses import dataclass
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.schemas.plan_schema import AnalysisProfile


@dataclass
class StagedUpload:
    temp_path: str
    original_filename: str | None
    content_type: str | None
    size_bytes: int


class UploadService:
    """
    Handles upload validation and disk staging.

    Important:
    - Never read the entire file into memory.
    - Always stream to disk in bounded chunks.
    - Always clean temp files after analysis.
    """

    DEFAULT_CHUNK_SIZE = 1024 * 1024  # 1 MB
    ALLOWED_EXTENSIONS = {
        ".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".mp4", ".mov", ".mkv", ".webm"
    }

    @staticmethod
    def validate_filename(filename: str | None) -> None:
        if not filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must have a filename.",
            )

        suffix = Path(filename).suffix.lower()
        if suffix not in UploadService.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {suffix or 'unknown'}",
            )

    @staticmethod
    async def stage_upload(
        file: UploadFile,
        profile: AnalysisProfile,
        chunk_size: int = DEFAULT_CHUNK_SIZE,
    ) -> StagedUpload:
        """
        Stream the upload to a temp file while enforcing plan max size.
        """
        UploadService.validate_filename(file.filename)

        suffix = Path(file.filename or "").suffix.lower()
        temp_fd, temp_path = tempfile.mkstemp(prefix="analysis_", suffix=suffix)
        os.close(temp_fd)

        bytes_written = 0

        try:
            with open(temp_path, "wb") as out_file:
                while True:
                    chunk = await file.read(chunk_size)
                    if not chunk:
                        break

                    bytes_written += len(chunk)
                    if bytes_written > profile.max_upload_bytes:
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail="File exceeds the maximum upload size for this plan.",
                        )

                    out_file.write(chunk)

            return StagedUpload(
                temp_path=temp_path,
                original_filename=file.filename,
                content_type=file.content_type,
                size_bytes=bytes_written,
            )

        except Exception:
            UploadService.cleanup_file(temp_path)
            raise
        finally:
            await file.close()

    @staticmethod
    def cleanup_file(path: str | None) -> None:
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except OSError:
                pass

    @staticmethod
    def cleanup_directory(path: str | None) -> None:
        if path and os.path.exists(path):
            try:
                shutil.rmtree(path, ignore_errors=True)
            except OSError:
                pass