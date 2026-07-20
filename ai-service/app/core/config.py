from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Typed configuration for the AI service.

    Milestone 0 only defines the settings needed to boot the service
    (host, port, log level). MODEL_PATH, DEVICE, and batching settings
    are documented in .env.example for later milestones but are not
    required here since no model is loaded yet.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"
    environment: str = "development"


settings = Settings()
