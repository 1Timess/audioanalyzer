from __future__ import annotations

import math
from typing import Iterable

import numpy as np


def clamp(value: float, minimum: float, maximum: float) -> float:
    return float(max(minimum, min(value, maximum)))


def clamp01(value: float) -> float:
    return clamp(value, 0.0, 1.0)


def safe_mean(values: Iterable[float], default: float = 0.0) -> float:
    vals = [float(v) for v in values if v is not None and math.isfinite(float(v))]
    if not vals:
        return float(default)
    return float(sum(vals) / len(vals))


def safe_median(values: Iterable[float], default: float | None = None) -> float | None:
    vals = [float(v) for v in values if v is not None and math.isfinite(float(v))]
    if not vals:
        return default
    return float(np.median(vals))


def safe_std(values: Iterable[float], default: float = 0.0) -> float:
    vals = [float(v) for v in values if v is not None and math.isfinite(float(v))]
    if len(vals) < 2:
        return float(default)
    return float(np.std(vals))


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    if denominator == 0:
        return float(default)
    return float(numerator / denominator)


def is_finite_number(value: object) -> bool:
    try:
        return math.isfinite(float(value))
    except (TypeError, ValueError):
        return False