from api.app import create_app
from api.settings import get_settings
from uvicorn import run

app = create_app()

def main():
    settings = get_settings()
    run(
        "api.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        log_level=settings.LOG_LEVEL.lower(),
        reload=settings.DEBUG,
        reload_dirs=["api"],
    )

if __name__ == "__main__":
    main()
