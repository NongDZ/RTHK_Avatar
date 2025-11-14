@echo off
setlocal enabledelayedexpansion

REM Absolute path to your project root
set "PROJECT_DIR=D:\RTHK_Avatar"

if not exist "%PROJECT_DIR%" (
  echo [ERROR] Project directory "%PROJECT_DIR%" does not exist.
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%"

REM Optional: confirm pnpm is available
where pnpm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] pnpm is not installed or not in PATH.
  pause
  exit /b 1
)

echo Starting Next.js from %PROJECT_DIR% ...
pnpm run start

if errorlevel 1 (
  echo.
  echo [ERROR] pnpm run start exited with code %errorlevel%
  pause
)

endlocal