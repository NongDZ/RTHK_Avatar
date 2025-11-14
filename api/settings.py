"""Settings and configuration for the Impact AI application."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


# Assuming settings.py is in <project_root>/api/settings.py
PROJECT_ROOT_DIR = Path(__file__).resolve().parent.parent


def assert_exists(path: Path, desc: str, field_name: str) -> None:
    """Raise FileNotFoundError if the given path does not exist."""
    if not path.exists():
        raise FileNotFoundError(
            f"{desc} not found at '{path}'. "
            f"Please check the path or set the '{field_name.upper()}' environment variable.",
        )


class Settings(BaseSettings):
    """Required environment variables for Impact AI API.

    GAN_CHECKPOINT_PATH=./models/gan_checkpoints/latest.pt
    IMG_FONT=./assets/fonts/handwritten.ttf
    KEYPOINTS_BASE_DIR=./data/keypoints
    STYLE_IMAGE_PATH=./assets/img/style_img_raw.jpg
    (Set these to the correct paths for your deployment. The application will fail to start if any are missing.)
    """

    # Development settings
    DEBUG: bool = Field(default=True)
    CORS_ALLOWED_ORIGINS: str = "*"

    # API settings
    API_NAME: str = "RTHK API"
    API_HOST: str = Field(default="localhost")
    API_PORT: int = Field(default=3001)
    LOG_LEVEL: str = Field(default="INFO")
    MAX_CONCURRENT_REQUESTS: int = Field(default=5)

    # Translation Settings (Add specific ones needed by core/translation)
    LLM_PROVIDER: str = Field(default="ollama", description="LLM provider")

    # OpenRouter Settings
    OPENROUTER_API_KEY: str | None = Field(default=None)
    OPENROUTER_API_BASE_URL: str = Field(default="https://openrouter.ai/api/v1")
    OPENROUTER_HTTP_REFERRER: str | None = Field(default="https://localhost")
    OPENROUTER_MODEL_NAME: str = Field(default="qwen/qwen3-30b-a3b")

    # Ollama Settings
    OLLAMA_BASE_URL: str | None = Field(default="http://localhost:11434")
    OLLAMA_MODEL_NAME: str = Field(default="qwen3:8b")

    # Embedding model for text-to-keyframes
    EMBEDDER_MODEL_NAME: str = Field(default="Qwen/Qwen3-Embedding-0.6B")
    VECTOR_DB_PATH: Path = Field(default=PROJECT_ROOT_DIR / "data/translation/embeddings.parquet")
    PHRASE_TABLE_PATH: Path = Field(default=PROJECT_ROOT_DIR / "data/translation/weather_phrases.csv")
    DEVICE: str = Field(
        default="cuda",
        description=(
            "Device for PyTorch inference ('cuda', 'mps', 'cpu', or 'auto' for auto-detection)."
        ),
    )
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

@lru_cache
def get_settings() -> Settings:
    """Return the singleton Settings instance."""
    # Settings initialization will now trigger model_post_init, which includes path validation
    # and directory creation.
    return Settings()
