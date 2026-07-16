#!/bin/bash
# =============================================================================
# Suihan-shu homepage - Local Build Script (Bash)
# Build Jekyll static site using Docker
# =============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVE=false
PRODUCTION=false

# Parse parameters
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --serve) SERVE=true ;;
        --production) PRODUCTION=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo "========================================"
echo " Suihan-shu homepage - Local Build"
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running. Please start Docker."
    exit 1
fi

cd "$PROJECT_ROOT"

if [ "$SERVE" = true ]; then
    echo ""
    echo "[INFO] Starting local development server..."
    echo "[INFO] Visit http://localhost:8040 to view the site"
    echo "[INFO] Press Ctrl+C to stop the server"
    echo ""
    docker compose up
else
    echo ""
    echo "[INFO] Starting static site build..."
    
    # Clean up old build artifacts
    rm -rf _site
    
    # Set environment variables
    if [ "$PRODUCTION" = true ]; then
        export JEKYLL_ENV=production
    else
        export JEKYLL_ENV=development
    fi
    
    # Build using Docker
    docker compose run --rm jekyll bash -c "bundle exec jekyll build --config _config.yml --trace"
    
    echo ""
    echo "[SUCCESS] Build completed!"
    echo "[INFO] Build artifacts are located in: _site/"
fi
