from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    resend_api_key: str
    frontend_url: str
    supabase_url: Optional[str] = None
    supabase_service_key: Optional[str] = None
    dev_allowed_emails: Optional[str] = None  # comma-separated test emails
    admin_emails: Optional[str] = None  # comma-separated admin emails


settings = Settings()
