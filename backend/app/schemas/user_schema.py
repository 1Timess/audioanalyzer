from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# -------------------------
# Base User Model (Shared Fields)
# -------------------------

class UserBase(BaseModel):
    email: EmailStr


# -------------------------
# Registration Input
# -------------------------

class UserCreate(UserBase):
    password: str = Field(min_length=8)


# -------------------------
# Login Input
# -------------------------

class UserLogin(UserBase):
    password: str


# -------------------------
# Database Model (Internal Use)
# -------------------------

class UserInDB(UserBase):
    id: str
    plan: str = "free"
    usage_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -------------------------
# Public User Response (Safe)
# -------------------------

class UserPublic(UserBase):
    id: str
    plan: str
    usage_count: int


# -------------------------
# Token Response
# -------------------------

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"