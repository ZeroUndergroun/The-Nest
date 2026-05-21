import uuid

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.config import settings
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/media", tags=["media"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/webm"}
IMAGE_MAX_BYTES = 10 * 1024 * 1024   # 10 MB
VIDEO_MAX_BYTES = 25 * 1024 * 1024   # 25 MB

EXT_MAP = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
    "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm",
}


@router.post("/upload")
def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not settings.supabase_url or not settings.supabase_service_key:
        raise HTTPException(status_code=503, detail="Media upload not configured")

    content_type = file.content_type or ""
    if content_type in ALLOWED_IMAGE_TYPES:
        media_type = "image"
        max_bytes = IMAGE_MAX_BYTES
    elif content_type in ALLOWED_VIDEO_TYPES:
        media_type = "video"
        max_bytes = VIDEO_MAX_BYTES
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    contents = file.file.read()
    if len(contents) > max_bytes:
        limit_mb = max_bytes // (1024 * 1024)
        raise HTTPException(status_code=400, detail=f"File too large (max {limit_mb} MB)")

    ext = EXT_MAP.get(content_type, "bin")
    path = f"{current_user.id}/{uuid.uuid4()}.{ext}"

    try:
        with httpx.Client(timeout=httpx.Timeout(10.0, write=120.0)) as client:
            res = client.put(
                f"{settings.supabase_url}/storage/v1/object/post-media/{path}",
                content=contents,
                headers={
                    "Authorization": f"Bearer {settings.supabase_service_key}",
                    "Content-Type": content_type,
                    "x-upsert": "true",
                },
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload request failed: {e}")

    if res.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail=f"Upload failed: {res.status_code} {res.text}")

    url = f"{settings.supabase_url}/storage/v1/object/public/post-media/{path}"
    return {"url": url, "media_type": media_type}
