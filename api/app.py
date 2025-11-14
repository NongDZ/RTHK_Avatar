"""FastAPI application factory and setup logic."""
from fastapi import FastAPI

from api.routers import include_routers
from api.settings import get_settings
from api.startup import lifespan
from api.utils.loggings import setup_logging


def create_app() -> FastAPI:
    """Application factory for FastAPI app.

    Returns:
        FastAPI: Configured FastAPI application instance.
    """
    settings = get_settings()
    setup_logging(settings.LOG_LEVEL)
    app = FastAPI(
        title=settings.API_NAME,
        debug=settings.DEBUG,
        lifespan=lifespan,
    )
    # CORS
    origins = []
    if settings.CORS_ALLOWED_ORIGINS:
        origins = [origin.strip() for origin in settings.CORS_ALLOWED_ORIGINS.split(",")]
    if origins:
        from fastapi.middleware.cors import CORSMiddleware
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    # Routers
    include_routers(app)
    return app
