from fastapi import FastAPI

from app.api.health import router as health_router
from app.core.config import settings

app = FastAPI(
    title="PhishGuardX AI Service",
    description="AI inference microservice for PhishGuardX (Milestone 0: scaffolding only).",
    version="0.1.0",
)

app.include_router(health_router, prefix="/api/v1")


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "PhishGuardX AI Service", "status": "running"}
