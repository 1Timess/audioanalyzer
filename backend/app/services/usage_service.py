from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.schemas.usage_schema import UsageCheckResult, UsageIncrement, UsageSnapshot


class UsageService:
    """
    Scaffolding for usage / quota tracking.

    Replace the placeholder storage logic with MongoDB reads/writes when ready.
    """

    @staticmethod
    async def get_current_usage(user_id: str) -> UsageSnapshot:
        """
        Load the current quota snapshot for a user.

        TODO:
        - Replace with MongoDB lookup
        - Align billing periods with your subscription provider
        """
        now = datetime.now(timezone.utc)
        return UsageSnapshot(
            user_id=user_id,
            period_start=now.replace(day=1, hour=0, minute=0, second=0, microsecond=0),
            period_end=(now.replace(day=1, hour=0, minute=0, second=0, microsecond=0) + timedelta(days=32)).replace(day=1),
            uploads_used=0,
            uploads_limit=None,
            bytes_processed=0,
            bytes_limit=None,
            analysis_minutes_used=0.0,
            analysis_minutes_limit=None,
        )

    @staticmethod
    async def ensure_analysis_allowed(snapshot: UsageSnapshot) -> UsageCheckResult:
        """
        Enforce quota restrictions before heavy work begins.
        """
        if snapshot.uploads_limit is not None and snapshot.uploads_used >= snapshot.uploads_limit:
            return UsageCheckResult(
                allowed=False,
                reason="upload_limit_reached",
                snapshot=snapshot,
            )

        if snapshot.bytes_limit is not None and snapshot.bytes_processed >= snapshot.bytes_limit:
            return UsageCheckResult(
                allowed=False,
                reason="byte_limit_reached",
                snapshot=snapshot,
            )

        if (
            snapshot.analysis_minutes_limit is not None
            and snapshot.analysis_minutes_used >= snapshot.analysis_minutes_limit
        ):
            return UsageCheckResult(
                allowed=False,
                reason="analysis_minutes_limit_reached",
                snapshot=snapshot,
            )

        return UsageCheckResult(
            allowed=True,
            reason="allowed",
            snapshot=snapshot,
        )

    @staticmethod
    async def record_usage(user_id: str, increment: UsageIncrement) -> None:
        """
        Persist usage after successful analysis.

        TODO:
        - Replace with MongoDB update
        - Make updates atomic
        """
        _ = (user_id, increment)
        return