"""Module for language model factory. To be configured for DSPy."""

from typing import Any

from dspy import LM

from api.settings import get_settings


settings = get_settings()


def get_ollama_lm() -> LM:
    """Get an Ollama language model instance using the base URL and model name.

    Returns:
        LM: The Ollama language model instance.
    """
    return LM(
            f"ollama_chat/{settings.OLLAMA_MODEL_NAME}",
            api_key="",
            api_base=settings.OLLAMA_BASE_URL,
        )


def get_openrouter_lm() -> LM:
    """Get an OpenRouter language model instance. Needs API key.

    Returns:
        LM: The OpenRouter language model instance.
    """
    return LM(
            f"openrouter/{settings.OPENROUTER_MODEL_NAME}",
            api_key=settings.OPENROUTER_API_KEY,
            api_base=settings.OPENROUTER_API_BASE_URL,
            max_tokens=20000,
        )


def lm_factory(provider: str) -> LM:
    """Get a language model instance based on the provider string.

    These are the available providers:
    - ollama
    - openrouter

    Args:
        provider: The provider to use for the language model.

    Returns:
        LM: The language model instance.
    """
    available_providers: dict[str, Any] = {
        "ollama": get_ollama_lm,
        "openrouter": get_openrouter_lm,
    }

    func = available_providers.get(provider)

    if not func:
        raise ValueError(f"Unknown provider: {provider}")
    return func()
