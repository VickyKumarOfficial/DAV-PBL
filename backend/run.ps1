# FastAPI Backend Startup Script
Write-Host "Starting FastAPI Backend Server..." -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
