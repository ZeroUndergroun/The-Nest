from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.config import settings
from app.routers import admin, auth, hashtags, media, messages, notifications, posts, users

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="The Nest API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(media.router)
app.include_router(posts.router)
app.include_router(users.router)
app.include_router(messages.router)
app.include_router(notifications.router)
app.include_router(hashtags.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
