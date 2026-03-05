from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# Create global client (single instance for app lifecycle)
client = AsyncIOMotorClient(settings.MONGODB_URI)

# Explicit database reference
db = client.audioanalyzer


async def connect_to_mongo():
    try:
        await db.command("ping")
        print("MongoDB connection successful")
    except Exception as e:
        print("MongoDB connection failed:", e)
        raise e


async def close_mongo_connection():
    client.close()