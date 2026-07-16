# =============================================================================
# Suihan-shu homepage - Quick Start Script (PowerShell)
# Shortcut: Start local development server
# =============================================================================

# Set console output encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $ProjectRoot

# Function to remove old build and cache files
function Remove-BuildDirectories {
    Write-Host "Cleaning up previous build files..." -ForegroundColor Cyan
    $directoriesToClean = @('_site', '.jekyll-cache')
    
    foreach ($dir in $directoriesToClean) {
        $fullPath = Join-Path $ProjectRoot $dir
        if (Test-Path $fullPath) {
            try {
                Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
                Write-Host "  Removed: $dir" -ForegroundColor Green
            } catch {
                Write-Warning "  Failed to remove: $dir - $($_.Exception.Message)"
            }
        }
    }
}

try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in the system PATH. Please install Docker Desktop and try again."
        exit 1
    }

    Remove-BuildDirectories

    Write-Host "`nStarting Suihan-shu homepage local development server..." -ForegroundColor Cyan
    Write-Host "Visit: http://localhost:8040" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""

    docker compose up
}
finally {
    Pop-Location
}
