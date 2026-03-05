from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.db.database import connect_to_mongo, close_mongo_connection

app = FastAPI()

# -----------------------------
# CORS Configuration
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Routes
# -----------------------------
app.include_router(auth_router, prefix="/auth", tags=["auth"])

# -----------------------------
# Database Lifecycle
# -----------------------------
@app.on_event("startup")
async def startup():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown():
    await close_mongo_connection()


# -----------------------------
# Health Check
# -----------------------------
@app.get("/")
async def root():
    return {"status": "AudioAnalyzer v3 backend running"}