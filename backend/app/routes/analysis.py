from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.pipeline.analyze_audio import AudioAnalysisPipeline
from app.schemas.analysis_schema import AnalysisResponseSchema
from app.schemas.plan_schema import PlanStatus, PlanTier
from app.services.auth_service import AuthService
from app.services.plan_service import PlanService
from app.services.upload_service import UploadService
from app.services.usage_service import UsageService

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/", response_model=AnalysisResponseSchema)
async def analyze_audio(
    file: UploadFile = File(...),
    current_user: dict = Depends(AuthService.get_current_user),
) -> AnalysisResponseSchema:
    """
    Analysis entrypoint.

    Route responsibilities:
    - authenticate user
    - resolve plan and usage
    - stage upload safely
    - hand off to pipeline
    - ensure temp cleanup
    """
    user_id = str(current_user["_id"])

    plan_data = current_user.get("plan", {}) or {}
    raw_plan_tier = str(plan_data.get("tier", "free")).lower()
    raw_plan_status = str(plan_data.get("status", "active")).lower()

    try:
        plan_tier = PlanTier(raw_plan_tier)
    except ValueError:
        plan_tier = PlanTier.FREE

    try:
        plan_status = PlanStatus(raw_plan_status)
    except ValueError:
        plan_status = PlanStatus.ACTIVE

    usage_snapshot = await UsageService.get_current_usage(user_id)
    usage_check = await UsageService.ensure_analysis_allowed(usage_snapshot)

    if not usage_check.allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=usage_check.reason,
        )

    resolution = PlanService.resolve_profile(
        plan_tier=plan_tier,
        plan_status=plan_status,
        usage_snapshot=usage_snapshot,
    )

    staged_upload = None
    try:
        staged_upload = await UploadService.stage_upload(
            file=file,
            profile=resolution.profile,
        )

        return await AudioAnalysisPipeline.run(
            user_id=user_id,
            staged_upload=staged_upload,
            profile=resolution.profile,
        )

    finally:
        if staged_upload is not None:
            UploadService.cleanup_file(staged_upload.temp_path)