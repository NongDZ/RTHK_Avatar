"""Startup and teardown logic for FastAPI application resources."""

import gc
import logging
from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI
import polars as pl
from sentence_transformers import SentenceTransformer

from api.settings import get_settings


logger = logging.getLogger(__name__)
settings = get_settings()


def get_processing_device(requested_device_str: str) -> torch.device:
    """Select processing device for torch operations.

    Args:
        requested_device_str (str): Device string ('cuda', 'mps', 'cpu', 'auto').

    Returns:
        torch.device: Selected device.
    """
    if requested_device_str == "cuda" and torch.cuda.is_available():
        logger.info("CUDA is available and selected.")
        return torch.device("cuda")
    if requested_device_str in ["auto", "mps"] and torch.backends.mps.is_available():
        logger.info("MPS is available and selected.")
        return torch.device("mps")
    logger.info(f"Requested device '{requested_device_str}' not available or not 'cuda'/'mps'. Defaulting to CPU.")
    return torch.device("cpu")


def init_embedding_resources(app: FastAPI) -> None:
    """Initialize embedding model, phrase DB, index, and T2S model."""
    logger.info("Loading keypoints resources...")
    try:
        app.state.embedder = SentenceTransformer(str(settings.EMBEDDER_MODEL_NAME))
        logger.info("Embedder loaded successfully")
        app.state.phrase_db = pl.read_csv(str(settings.PHRASE_TABLE_PATH))
        logger.info("Phrases database loaded successfully")
        app.state.index = pl.read_parquet(str(settings.VECTOR_DB_PATH))
        logger.info("Embedding database loaded successfully")
    except Exception as e:
        logger.error(f"Error loading keypoints resources: {e}", exc_info=True)
        raise e


def cleanup_embedding_resources(app: FastAPI) -> None:
    """Cleanup embedding-related resources from app state."""
    for attr in ("embedder", "phrase_db", "index"):
        if hasattr(app.state, attr):
            setattr(app.state, attr, None)


def cleanup_device_cache(app: FastAPI) -> None:
    """Cleanup device-specific caches (CUDA/MPS)."""
    if hasattr(app.state, "device"):
        if app.state.device.type == "cuda":
            torch.cuda.empty_cache()
            logger.info("CUDA cache emptied.")
        elif app.state.device.type == "mps":
            torch.mps.empty_cache()
            logger.info("MPS cache emptied.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan context manager for resource setup and teardown.

    Args:
        app (FastAPI): The FastAPI application instance.
    """
    logger.info("Application startup...")
    logger.info(f"Running in {'DEBUG' if settings.DEBUG else 'PRODUCTION'} mode")
    logger.info(f"Log level set to: {settings.LOG_LEVEL}")
    logger.info(f"LLM Provider: {settings.LLM_PROVIDER}")

    # Device
    app.state.device = get_processing_device(settings.DEVICE)
    logger.info(f"Using device: {app.state.device}")

    # Individual resource initializations
    init_embedding_resources(app)

    try:
        yield
    finally:
        logger.info("Cleaning up resources...")
        cleanup_embedding_resources(app)
        gc.collect()  # Force garbage collection
        cleanup_device_cache(app)
        logger.info("Application shutdown...")
