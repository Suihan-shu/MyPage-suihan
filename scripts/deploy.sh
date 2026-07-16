#!/bin/bash
# =============================================================================
# Suihan-shu homepage - One-Click Deploy Script (Bash)
# Deploy build artifacts to gh-pages branch
# =============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GH_PAGES_DIR="$PROJECT_ROOT/_gh-pages"
SITE_DIR="$PROJECT_ROOT/_site"
MESSAGE="${1:-Deploy site updates}"
CUSTOM_MSG="${2:-}"
NON_INTERACTIVE="${NON_INTERACTIVE:-false}"

echo "========================================"
echo " Suihan-shu homepage - One-Click Deploy"
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running. Please start Docker."
    exit 1
fi

cd "$PROJECT_ROOT"

# Step 1: Production Build
echo ""
echo "[Step 1/5] Building for production..."

rm -rf "$SITE_DIR"
export JEKYLL_ENV=production
docker compose run --rm jekyll bash -c "bundle exec jekyll build --config _config.yml --trace"

# Step 2: Check Build Artifacts
echo "[Step 2/5] Checking build artifacts..."
if [ ! -d "$SITE_DIR" ]; then
    echo "[ERROR] Build artifacts not found: $SITE_DIR"
    exit 1
fi

FILE_COUNT=$(find "$SITE_DIR" -type f | wc -l)
echo "[INFO] Build contains $FILE_COUNT files"

# Step 3: Sync to gh-pages branch
echo "[Step 3/5] Syncing to gh-pages branch..."

if [ ! -d "$GH_PAGES_DIR" ]; then
    echo "[INFO] Creating gh-pages worktree..."
    git worktree add "$GH_PAGES_DIR" gh-pages
fi

# Clean gh-pages directory (keep .git)
find "$GH_PAGES_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# Copy build artifacts
cp -r "$SITE_DIR/"* "$GH_PAGES_DIR/"

# Keep published artifacts on LF to avoid noisy Git CRLF conversion warnings on Windows.
cat > "$GH_PAGES_DIR/.gitattributes" <<'EOF'
* text=auto eol=lf
*.ps1 text eol=crlf
EOF

# Add .nojekyll file
touch "$GH_PAGES_DIR/.nojekyll"

# Normalize text artifacts to LF before staging to reduce CRLF->LF warnings.
find "$GH_PAGES_DIR" -type f \( \
    -name "*.html" -o -name "*.md" -o -name "*.txt" -o -name "*.xml" -o \
    -name "*.css" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o \
    -name "*.yaml" -o -name "*.csv" \
\) -exec sed -i 's/\r$//' {} +

# Step 4: Commit Changes
echo -e "\033[0;32m[Step 4/5] Committing changes...\033[0m"
cd "$GH_PAGES_DIR"

git add -A
if [ -n "$(git status --porcelain)" ]; then
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    
    # Ask for custom commit message only in interactive mode.
    if [ "$NON_INTERACTIVE" != "true" ] && [ -z "$CUSTOM_MSG" ]; then
        read -p "Enter optional commit message (Press Enter for default): " CUSTOM_MSG
    fi
    
    if [ -n "$CUSTOM_MSG" ]; then
        COMMIT_MSG="Deploy: $CUSTOM_MSG - $TIMESTAMP"
    else
        COMMIT_MSG="$MESSAGE - $TIMESTAMP"
    fi

    git commit -m "$COMMIT_MSG"
    echo -e "\033[0;32m[INFO] Commit successful: $COMMIT_MSG\033[0m"
else
    echo -e "\033[0;33m[INFO] No changes to commit\033[0m"
fi

# Step 5: Push to Remote
echo "[Step 5/5] Pushing to GitHub..."
git push origin gh-pages

echo ""
echo "========================================"
echo " Deploy Successful!"
echo "========================================"
echo ""
echo "[INFO] Site will be live in a few minutes:"
echo "       https://your-github-username.github.io"

cd "$PROJECT_ROOT"
