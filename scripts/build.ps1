# =============================================================================
# Suihan-shu homepage - Local Build Script (PowerShell)
# Build Jekyll static site using Docker
# =============================================================================

param(
    [switch]$Serve,      # Start local development server
    [switch]$Production  # Build for production
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Suihan-shu homepage - Local Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Docker is installed and running
try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] Docker is not installed or not in the system PATH." -ForegroundColor Red
        exit 1
    }
    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Docker Desktop is not running." }
}
catch {
    Write-Host "[ERROR] Docker Desktop is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

$previousJekyllEnv = $env:JEKYLL_ENV
Push-Location $ProjectRoot

try {
    if ($Serve) {
        Write-Host "`n[INFO] Starting local development server..." -ForegroundColor Green
        Write-Host "[INFO] Visit http://localhost:8040 to view the site" -ForegroundColor Yellow
        Write-Host "[INFO] Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
        docker compose up
        if ($LASTEXITCODE -ne 0) { throw "Preview failed." }
    }
    else {
        Write-Host "`n[INFO] Starting static site build..." -ForegroundColor Green
        
        # Remove stale output (including read-only files copied through Docker).
        $siteDir = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot '_site'))
        $expectedSiteDir = [System.IO.Path]::GetFullPath($ProjectRoot) + [System.IO.Path]::DirectorySeparatorChar + '_site'
        if ($siteDir -ne $expectedSiteDir) { throw "Unexpected build directory: $siteDir" }
        if (Test-Path -LiteralPath $siteDir) {
            $siteItem = Get-Item -LiteralPath $siteDir -Force
            if ($siteItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
                throw "Refusing to clean a linked build directory: $siteDir"
            }
            Remove-Item -LiteralPath $siteDir -Recurse -Force -ErrorAction Stop
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
    $env:JEKYLL_ENV = $previousJekyllEnv
    Pop-Location
}
