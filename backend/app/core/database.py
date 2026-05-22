from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings


client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    global client, database
    client = AsyncIOMotorClient(settings.mongodb_url, serverSelectionTimeoutMS=1500)
    database = client[settings.mongodb_db_name]
    try:
        await client.admin.command("ping")
        print("Connected to MongoDB")
    except Exception as exc:
        print(f"MongoDB unavailable, continuing with dummy data: {exc}")


async def close_mongo_connection() -> None:
    global client
    if client:
        client.close()


def get_database() -> AsyncIOMotorDatabase | None:
    return database
