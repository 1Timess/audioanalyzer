from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    password_needs_rehash,
    verify_password,
)
from app.db.database import db
from app.schemas.user_schema import AuthTokenResponse, UserCreate, UserLogin

router = APIRouter(prefix="/auth", tags=["auth"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _extract_client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        first_ip = forwarded_for.split(",")[0].strip()
        if first_ip:
            return first_ip

    if request.client and request.client.host:
        return request.client.host

    return None


def _build_auth_user_payload(db_user: dict) -> dict:
    usage_counters = db_user.get("usage_counters", {})
    plan = db_user.get("plan", {})
    security = db_user.get("security", {})

    return {
        "email": db_user["email"],
        "username": db_user["username"],
        "plan_tier": plan.get("tier", "free"),
        "plan_status": plan.get("status", "active"),
        "total_uploads": usage_counters.get("total_uploads", 0),
        "total_analyses": usage_counters.get("total_analyses", 0),
        "total_bytes_processed": usage_counters.get("total_bytes_processed", 0),
        "is_verified": db_user.get("is_verified", False),
        "last_login_at": security.get("last_login_at"),
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    normalized_email = user.email.strip().lower()
    normalized_username = user.username.strip()
    now = _utcnow()

    existing_email = await db.users.find_one({"email": normalized_email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = await db.users.find_one({"username": normalized_username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    try:
        hashed = hash_password(user.password)

        await db.users.insert_one({
            "email": normalized_email,
            "username": normalized_username,
            "password": hashed,
            "usage": user.usage.value if hasattr(user.usage, "value") else str(user.usage),
            "experience": user.experience.value if hasattr(user.experience, "value") else str(user.experience),
            "plan": {
                "tier": user.selected_plan.value if hasattr(user.selected_plan, "value") else str(user.selected_plan),
                "status": "active",
                "started_at": now,
                "renews_at": None,
                "canceled_at": None,
            },
            "usage_counters": {
                "total_uploads": 0,
                "total_analyses": 0,
                "total_bytes_processed": 0,
                "total_processing_minutes": 0.0,
            },
            "analysis_settings": {
                "preferred_sample_rate": 16000,
                "enable_clip_previews": False,
                "enable_speaker_profiles": True,
                "enable_spatial_analysis": False,
                "default_max_clip_seconds": 2.0,
                "preserve_original_upload_name": True,
            },
            "security": {
                "last_login_at": None,
                "last_login_ip": None,
                "last_login_user_agent": None,
                "failed_login_attempts": 0,
                "locked_until": None,
                "password_changed_at": now,
                "password_rehash_required": False,
                "login_history": [],
            },
            "created_at": now,
            "updated_at": now,
            "is_active": True,
            "is_verified": False,
            "is_admin": False,
        })

        return {
            "message": "User created successfully",
        }

    except Exception as e:
        print("REGISTER ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Registration failed on the server.",
        )


@router.post("/login", response_model=AuthTokenResponse)
async def login(user: UserLogin, request: Request):
    normalized_email = user.email.strip().lower()
    db_user = await db.users.find_one({"email": normalized_email})

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not db_user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is disabled")

    if not verify_password(user.password, db_user["password"]):
        await db.users.update_one(
            {"_id": db_user["_id"]},
            {
                "$inc": {"security.failed_login_attempts": 1},
                "$set": {"updated_at": _utcnow()},
            },
        )
        raise HTTPException(status_code=400, detail="Invalid credentials")

    now = _utcnow()
    client_ip = _extract_client_ip(request)
    user_agent = request.headers.get("user-agent")

    update_fields = {
        "security.last_login_at": now,
        "security.last_login_ip": client_ip,
        "security.last_login_user_agent": user_agent,
        "security.failed_login_attempts": 0,
        "updated_at": now,
    }

    if password_needs_rehash(db_user["password"]):
        update_fields["password"] = hash_password(user.password)
        update_fields["security.password_rehash_required"] = False
        update_fields["security.password_changed_at"] = now

    await db.users.update_one(
        {"_id": db_user["_id"]},
        {
            "$set": update_fields,
            "$push": {
                "security.login_history": {
                    "$each": [{
                        "ip_address": client_ip,
                        "user_agent": user_agent,
                        "logged_in_at": now,
                    }],
                    "$slice": -20,
                }
            },
        },
    )

    refreshed_user = await db.users.find_one({"_id": db_user["_id"]})
    if not refreshed_user:
        raise HTTPException(status_code=500, detail="Failed to load updated user.")

    token = create_access_token({
        "sub": refreshed_user["email"],
        "username": refreshed_user["username"],
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _build_auth_user_payload(refreshed_user),
    }


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return {
        "user": _build_auth_user_payload(current_user),
    }