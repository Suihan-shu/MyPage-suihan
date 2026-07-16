# Suihan-shu homepage structure validation (Chinese-only site)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

function Assert-FileExists {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing required file: $Path"
    }
}

function Assert-NoMatch {
    param(
        [string[]]$Paths,
        [string]$Pattern,
        [string]$Message
    )

    $files = Get-ChildItem -Path $Paths -Recurse -File -ErrorAction SilentlyContinue
    $matches = $files | Select-String -Pattern $Pattern
    if ($matches) {
        $locations = ($matches | Select-Object -First 5 | ForEach-Object { "$($_.Path):$($_.LineNumber)" }) -join ", "
        throw "$Message`n$locations"
    }
}

Push-Location $ProjectRoot
try {
    $requiredFiles = @(
        "_config.yml",
        "_data/i18n.yml",
        "_data/cv.yml",
        "_data/travel.yml",
        "_pages/about.md",
        "_pages/repositories.md",
        "_pages/cv.md",
        "_pages/books.md",
        "_pages/travel.md",
        "_layouts/travel-log.liquid",
        "assets/js/travel-log.js"
    )
    foreach ($file in $requiredFiles) { Assert-FileExists $file }

    Assert-NoMatch @("_pages", "_posts", "_series") "^lang:\s*en\s*$" "English content files still exist."
    Assert-NoMatch @("_pages", "_posts", "_series", "_layouts", "_includes") "^lang-ref:" "Deprecated lang-ref fields still exist."
    Assert-NoMatch @("_layouts", "_includes") "site\.active_lang|site\.default_lang|/zh/" "Legacy bilingual routing or language state still exists."

    $gemfile = Get-Content -LiteralPath "Gemfile" -Raw
    $config = Get-Content -LiteralPath "_config.yml" -Raw
    if ($gemfile -match "jekyll-polyglot" -or $config -match "jekyll-polyglot") {
        throw "jekyll-polyglot is still configured."
    }

    Write-Host "[OK] Chinese-only structure validation passed." -ForegroundColor Green
}
finally {
    Pop-Location
}
