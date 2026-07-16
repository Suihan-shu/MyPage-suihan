# =============================================================================
# Suihan-shu homepage - One-Click Deploy Script (PowerShell)
# Deploy build artifacts to gh-pages branch
# =============================================================================

param(
    [string]$Message = "Deploy site updates",  # Commit message
    [string]$CustomMessage = "",
    [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$GhPagesDir = Join-Path $ProjectRoot "_gh-pages"
$SiteDir = Join-Path $ProjectRoot "_site"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Suihan-shu homepage - One-Click Deploy" -ForegroundColor Cyan
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
    # Step 1: Production Build
    Write-Host "`n[Step 1/5] Building for production..." -ForegroundColor Green
    
    # Clean up old build artifacts. Use a fallback path for Windows lock/IO quirks.
    if (Test-Path $SiteDir) {
        try {
            Remove-Item -Recurse -Force $SiteDir -ErrorAction Stop
        }
        catch {
            cmd /c "rmdir /s /q \"$SiteDir\"" | Out-Null
            if (Test-Path $SiteDir) {
                throw "Failed to clean build directory: $SiteDir. Please close file explorers/editors locking _site and retry."
            }
        }
    }
    
    $env:JEKYLL_ENV = "production"
    docker compose run --rm jekyll bash -c "bundle exec jekyll build --config _config.yml --trace"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Build failed!" -ForegroundColor Red
        exit 1
    }
    
    # Step 2: Check Build Artifacts
    Write-Host "[Step 2/5] Checking build artifacts..." -ForegroundColor Green
    if (-not (Test-Path $SiteDir)) {
        Write-Host "[ERROR] Build artifacts not found: $SiteDir" -ForegroundColor Red
        exit 1
    }
     
    $fileCount = (Get-ChildItem -Recurse $SiteDir | Measure-Object).Count
    Write-Host "[INFO] Build contains $fileCount files" -ForegroundColor Yellow

    # Step 2.5: Normalize text artifacts before syncing to gh-pages.
    # Doing this in _site avoids Windows file-mapping locks in the gh-pages worktree.
    Write-Host "[Step 2.5/5] Normalizing text artifacts in build output..." -ForegroundColor Green
    $lfExtensions = @(
        ".html", ".md", ".txt", ".xml", ".css", ".js", ".json", ".yml", ".yaml", ".csv", ".bib"
    )
    Get-ChildItem -Path $SiteDir -Recurse -File |
        Where-Object { $lfExtensions -contains $_.Extension.ToLowerInvariant() } |
        ForEach-Object {
            $fullPath = $_.FullName
            $raw = [System.IO.File]::ReadAllText($fullPath)
            $normalized = $raw -replace "`r`n", "`n"
            if ($raw -ne $normalized) {
                [System.IO.File]::WriteAllText(
                    $fullPath,
                    $normalized,
                    [System.Text.UTF8Encoding]::new($false)
                )
            }
        }
    
    # Step 3: Sync to gh-pages branch
    Write-Host "[Step 3/5] Syncing to gh-pages branch..." -ForegroundColor Green
    
    # Check if worktree exists
    if (-not (Test-Path $GhPagesDir)) {
        Write-Host "[INFO] Creating gh-pages worktree..." -ForegroundColor Yellow
        git worktree add $GhPagesDir gh-pages
    }
    
    # Clean gh-pages directory (keep .git)
    Get-ChildItem -Path $GhPagesDir -Exclude ".git" | Remove-Item -Recurse -Force
    
    # Copy build artifacts
    Copy-Item -Path "$SiteDir\*" -Destination $GhPagesDir -Recurse -Force

    # Keep published artifacts on LF to avoid noisy Git CRLF conversion warnings on Windows.
    [System.IO.File]::WriteAllText(
        "$GhPagesDir\.gitattributes",
        "* text=auto eol=lf`n*.ps1 text eol=crlf`n",
        [System.Text.UTF8Encoding]::new($false)
    )
    
    # Add .nojekyll file (tells GitHub Pages not to rebuild)
    New-Item -Path "$GhPagesDir\.nojekyll" -ItemType File -Force | Out-Null


    # Step 3.5: Optional custom commit message prompt
    if (-not $NonInteractive -and [string]::IsNullOrWhiteSpace($CustomMessage)) {
        $CustomMessage = Read-Host "Enter optional commit message (Press Enter for default)"
    }
    
    # Step 4: Commit Changes
    Write-Host "[Step 4/5] Committing changes..." -ForegroundColor Green
    Push-Location $GhPagesDir
    
    try {
        git add -A
        $changes = git status --porcelain
        if ($changes) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            
            if (-not [string]::IsNullOrWhiteSpace($CustomMessage)) {
                $CommitMsg = "Deploy: $CustomMessage - $timestamp"
            }
            else {
                $CommitMsg = "$Message - $timestamp"
            }
        
            git commit -m "$CommitMsg"
            Write-Host "[INFO] Commit successful: $CommitMsg" -ForegroundColor Green
        }
        else {
            Write-Host "[INFO] No changes to commit" -ForegroundColor Yellow
        }
        
        # Step 5: Push to Remote
        Write-Host "[Step 5/5] Pushing to GitHub..." -ForegroundColor Green
        git push origin gh-pages
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n========================================" -ForegroundColor Green
            Write-Host " Deploy Successful!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "`n[INFO] Site will be live in a few minutes:" -ForegroundColor Yellow
            Write-Host "       https://your-github-username.github.io" -ForegroundColor Cyan
        }
        else {
            Write-Host "`n[ERROR] Push failed!" -ForegroundColor Red
            exit 1
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}
