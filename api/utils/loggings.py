"""Logging utilities for FastAPI application."""

import logging
import sys


LOG_FORMAT = "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

def setup_logging(log_level: str):
    """Configure logging for the application.

    Args:
        log_level (str): Logging level (e.g., 'INFO', 'DEBUG', etc.).
    """
    level = getattr(logging, log_level.upper(), logging.INFO)
    logging.basicConfig(
        level=level, format=LOG_FORMAT, datefmt=DATE_FORMAT, stream=sys.stdout,
    )
