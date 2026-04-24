from __future__ import annotations

from fastapi import Depends

from app.core.security import get_current_user as security_get_current_user


class AuthService:
    """
    Service-facing auth wrapper.

    Purpose:
    - Reuse the existing JWT + user lookup flow from app.core.security
    - Avoid duplicating token parsing logic in multiple places
    - Give routes/services a consistent dependency import path if desired
    """

    @staticmethod
    async def get_current_user(
        current_user: dict = Depends(security_get_current_user),
    ) -> dict:
        """
        Resolve the authenticated user from the existing security layer.
        """
        return current_user