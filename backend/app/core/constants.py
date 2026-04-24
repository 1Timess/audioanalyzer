from __future__ import annotations

import logging
import sys
from typing import Optional


LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def configure_logging(level: str = "INFO") -> None:
    """
    Configure application-wide logging once at startup.

    Safe to call multiple times. Existing handlers will be replaced so
    duplicate logs do not accumulate during reloads.
    """
    root_logger = logging.getLogger()
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))

    root_logger.addHandler(handler)
    root_logger.setLevel(level.upper())


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Return a named logger for a module/service.
    """
    return logging.getLogger(name or "app")