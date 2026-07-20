from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """
    Confirms the AI service is up and reachable. No model is loaded in
    Milestone 0 - inference endpoints are introduced in Milestone 4.
    """
    return HealthResponse(
        status="ok",
        service="ai-service",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
