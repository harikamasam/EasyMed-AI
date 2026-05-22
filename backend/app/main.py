from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import close_mongo_connection, connect_to_mongo
from app.routes import ai, appointments, auth, dashboard, reminders, reports


app = FastAPI(
    title="EasyMed AI Healthcare API",
    description="AI-powered healthcare platform API with MongoDB support.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_mongo_connection()


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": "EasyMed API"}


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(ai.router, prefix="/api", tags=["ai"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(reminders.router, prefix="/api/reminders", tags=["reminders"])
