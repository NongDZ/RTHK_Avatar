"""Router registration helpers for the API package."""
from fastapi import FastAPI


def include_routers(app: FastAPI):
    """Attach all API routers to the FastAPI app.

    Args:
        app (FastAPI): The FastAPI application instance.
    """
    from api.routers import translate
    app.include_router(translate.router)
