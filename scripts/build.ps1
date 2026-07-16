# =============================================================================
# YOUR_GITHUB_USERNAME's Blog - Local Build Script (PowerShell)
# Build Jekyll static site using Docker
# =============================================================================

param(
    [switch]$Serve,      # Start local development server
    [switch]$Production  # Build for production
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " YOUR_GITHUB_USERNAME's Blog - Local Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Docker is installed and running
try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] Docker is not installed or not in the system PATH." -ForegroundColor Red
        exit 1
    }
    docker info | Out-Null
}
catch {
    Write-Host "[ERROR] Docker Desktop is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Push-Location $ProjectRoot

try {
    if ($Serve) {
        Write-Host "`n[INFO] Starting local development server..." -ForegroundColor Green
        Write-Host "[INFO] Visit http://localhost:8040 to view the site" -ForegroundColor Yellow
        Write-Host "[INFO] Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
        docker compose up
    }
    else {
        Write-Host "`n[INFO] Starting static site build..." -ForegroundColor Green
        
        # Clean up old build artifacts. Use a fallback path for Windows lock/IO quirks.
        if (Test-Path "_site") {
            try {
                Remove-Item -Recurse -Force "_site" -ErrorAction Stop
            }
            catch {
                cmd /c "rmdir /s /q _site" | Out-Null
                if (Test-Path "_site") {
                    throw "Failed to clean _site before build. Please close file explorers/editors locking _site and retry."
                }
            }
        }
        
        # Build using Docker
        $env:JEKYLL_ENV = if ($Production) { "production" } else { "development" }

        $buildCommand = "bundle exec jekyll build --config _config.yml --trace"
        docker compose run --rm jekyll bash -lc "$buildCommand"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n[SUCCESS] Build completed!" -ForegroundColor Green
            Write-Host "[INFO] Build artifacts are located in: _site/" -ForegroundColor Yellow
        }
        else {
            Write-Host "`n[ERROR] Build failed!" -ForegroundColor Red
            exit 1
        }
    }
}
finally {
    Pop-Location
}
