# =============================================================================
# YOUR_GITHUB_USERNAME's Blog - Quick Structure Validation (PowerShell)
# Checks high-value consistency rules after refactoring.
# =============================================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

function Assert-FileExists {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        throw "Missing required file: $Path"
    }
}

function Assert-NoPattern {
    param(
        [string]$Path,
        [string]$Pattern,
        [string]$Message
    )

    $matches = Select-String -Path $Path -Pattern $Pattern -SimpleMatch
    if ($matches) {
        throw $Message
    }
}

function Assert-ContainsPattern {
    param(
        [string]$Path,
        [string]$Pattern,
        [string]$Message
    )

    $matches = Select-String -Path $Path -Pattern $Pattern -SimpleMatch
    if (-not $matches) {
        throw $Message
    }
}

function Get-ChangedFiles {
    $changed = @()
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"

    try {
        $unstaged = git diff --name-only 2>&1 | Where-Object { $_ -and ($_ -notmatch '^warning:') }
        if ($LASTEXITCODE -eq 0 -and $unstaged) {
            $changed += $unstaged
        }

        $staged = git diff --name-only --cached 2>&1 | Where-Object { $_ -and ($_ -notmatch '^warning:') }
        if ($LASTEXITCODE -eq 0 -and $staged) {
            $changed += $staged
        }

        $untracked = git ls-files --others --exclude-standard 2>&1 | Where-Object { $_ -and ($_ -notmatch '^warning:') }
        if ($LASTEXITCODE -eq 0 -and $untracked) {
            $changed += $untracked
        }
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    return $changed | Sort-Object -Unique
}

function Assert-DocumentationSync {
    $changedFiles = Get-ChangedFiles
    if (-not $changedFiles -or $changedFiles.Count -eq 0) {
        return
    }

    $architecturePatterns = @(
        '^_layouts/',
        '^_includes/',
        '^_sass/',
        '^assets/js/',
        '^scripts/(build|deploy|serve|validate_structure)',
        '^_config\.yml$'
    )

    $docPatterns = @(
        '^docs/ARCHITECTURE_CHANGE_GUIDE\.md$',
        '^docs/CHANGE_DECISION_TREE\.md$',
        '^docs/MAINTENANCE_RUNBOOK\.md$',
        '^docs/DOCUMENTATION_GOVERNANCE\.md$',
        '^docs/prompt/AI_CHANGE_PROMPT\.md$',
        '^docs/DOCS_GUIDE\.md$',
        '^README\.md$',
        '^\.github/copilot-instructions\.md$'
    )

    $hasArchitectureChange = $false
    foreach ($file in $changedFiles) {
        foreach ($pattern in $architecturePatterns) {
            if ($file -match $pattern) {
                $hasArchitectureChange = $true
                break
            }
        }
        if ($hasArchitectureChange) { break }
    }

    if (-not $hasArchitectureChange) {
        return
    }

    $hasDocUpdate = $false
    foreach ($file in $changedFiles) {
        foreach ($pattern in $docPatterns) {
            if ($file -match $pattern) {
                $hasDocUpdate = $true
                break
            }
        }
        if ($hasDocUpdate) { break }
    }

    if (-not $hasDocUpdate) {
        throw "Architecture-impacting changes detected but no documentation update found. Update docs/ARCHITECTURE_CHANGE_GUIDE.md, docs/CHANGE_DECISION_TREE.md, docs/MAINTENANCE_RUNBOOK.md, docs/DOCS_GUIDE.md, or README.md."
    }
}

Push-Location $ProjectRoot
try {
    Assert-FileExists "_data/i18n.yml"
    Assert-FileExists "_includes/blog_index_content.liquid"

    Assert-NoPattern "scripts/build.ps1" "webserver" "scripts/build.ps1 still references deprecated compose service name 'webserver'."
    Assert-NoPattern "scripts/build.sh" "webserver" "scripts/build.sh still references deprecated compose service name 'webserver'."
    Assert-NoPattern "scripts/deploy.sh" "webserver" "scripts/deploy.sh still references deprecated compose service name 'webserver'."

    Assert-ContainsPattern "_includes/blog_index_content.liquid" "site.data.i18n" "blog index include is not using centralized i18n data."
    Assert-ContainsPattern "_includes/blog_heatmap.liquid" "const locale = 'en-US'" "blog heatmap locale is expected to stay fixed to English."

    Assert-DocumentationSync

    Write-Host "[OK] Structure validation passed." -ForegroundColor Green
}
finally {
    Pop-Location
}
