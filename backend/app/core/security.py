from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.db.database import db

pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto",
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def password_needs_rehash(hashed_password: str) -> bool:
    return pwd_context.needs_update(hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire,
        "type": "access",
    })

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def _token_preview(token: str | None) -> str:
    if not token:
        return "<missing>"
    if len(token) <= 24:
        return token
    return f"{token[:12]}...{token[-12:]}"


def decode_token(token: str) -> dict:
    print("[AUTH] decode_token called")
    print("[AUTH] token preview:", _token_preview(token))
    print("[AUTH] JWT algorithm:", settings.JWT_ALGORITHM)
    print("[AUTH] JWT secret present:", bool(settings.JWT_SECRET))

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        print("[AUTH] token decoded successfully")
        print("[AUTH] payload:", payload)
        return payload
    except JWTError as exc:
        print("[AUTH] token decode failed:", repr(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme),
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    auth_header = request.headers.get("authorization")
    print("[AUTH] authorization header:", auth_header)
    print("[AUTH] oauth2 parsed token:", _token_preview(token))

    payload = decode_token(token)

    email: Optional[str] = payload.get("sub")
    token_type: Optional[str] = payload.get("type")

    print("[AUTH] payload sub:", email)
    print("[AUTH] payload type:", token_type)

    if not email or token_type != "access":
        print("[AUTH] invalid payload structure")
        raise credentials_exception

    user = await db.users.find_one({"email": email})
    print("[AUTH] user lookup email:", email)
    print("[AUTH] user found:", bool(user))

    if not user:
        raise credentials_exception

    if not user.get("is_active", True):
        print("[AUTH] user inactive")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    return user