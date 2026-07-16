# Maintenance Runbook

This runbook defines operational checks for local development, pre-release validation, and troubleshooting.

## 1. Standard Local Workflow

1. Clean previous build artifacts before audit/review:
   - Remove-Item -Recurse -Force _site (PowerShell)
   - or rm -rf _site (bash)
2. Start local environment:
   - scripts/serve.ps1 (PowerShell)
   - or docker compose up
3. Make change in source-of-truth file.
4. Run structural checks:
   - scripts/validate_structure.ps1
5. Run full build once:
   - docker compose run --rm jekyll bash -c "bundle exec jekyll build --config _config.yml"
6. Perform manual verification checklist.
7. Deploy scripts should preserve LF in published artifacts via gh-pages `.gitattributes` to avoid Windows CRLF warning noise during `git add`.

## 2. Manual Verification Checklist

1. Home and navigation:
   - Language toggle works.
   - Brand/nav typography remains expected.
   - News section shows auto-classification badges (publication/award/talk/funding/general).
2. Blog index (en and zh):
   - Header/subtitle render correctly.
   - Series cards and featured cards render without broken styles.
   - Taxonomy strip uses unified strategy.
   - Tag/category links resolve to archive pages with trailing slash paths.
3. Single blog post:
   - Metadata and taxonomy are correct.
   - TOC sidebar appears and shows nested headings.
   - Content width and TOC spacing look balanced on desktop.
   - Language switch updates full page chrome and content together (not content-only switch).
   - Comment area behavior is correct:
     - If giscus is fully configured, the comment widget loads.
     - If required giscus IDs are missing, the configuration warning block is shown.
     - Giscus theme follows site dark/light mode.
   - Image gallery (if used) renders responsive grid and medium-zoom works on click.
4. Repositories page:
   - Card typography and hover behavior are correct.
5. CV page:
   - No unintended card typography spillover.
6. Heatmap:
   - Labels and locale remain fixed English by design.
   - Mobile view keeps readable grid cells (no label overlap or clipping).
7. Series pages:
   - Series landing pages render in both en and zh.
   - Post ordering follows series_order.
   - Bilingual pairing works via lang-ref.

## 3. Pre-Release Checklist

1. scripts/validate_structure.ps1 passes.
2. Full Jekyll build passes.
3. No new problems in editor diagnostics for touched files.
4. Docs reflect behavior changes:
   - docs/ARCHITECTURE_CHANGE_GUIDE.md
   - docs/CHANGE_DECISION_TREE.md
   - docs/DOCS_GUIDE.md and root README if navigation changed.

## 3.1 Course Assets Sync Checklist

When adding or updating course materials in external asset storage (for example `YOUR_GITHUB_USERNAME/course-assets`):

1. Verify files exist in the asset repo path before updating site data links.
2. In blog repo, update `_data/course_resources.yml` and matching bilingual detail pages under `_pages/courses/`.
3. Run:
   - `scripts/validate_structure.ps1`
   - `docker compose run --rm jekyll bash -c "bundle exec jekyll build --config _config.yml"`
4. Spot-check in browser:
   - courses overview card appears in both languages
   - detail page route resolves in both languages
   - preview/download buttons return valid HTTP responses
5. Keep source attribution status documented in the asset repo README before public release.

## 4. Troubleshooting

## 4.0 GitHub Rejects Push Due To Large File (>100MB)

1. Symptom: remote rejects push with `GH001: Large files detected`.
2. Cause: a file larger than 100MB exists in commit history being pushed.
3. Immediate checks:
   - `git rev-list --objects --all | findstr /I <filename>`
4. Recovery options:
   - If only the most recent local commit is affected, rebuild commit without the large file.
   - Otherwise remove the file from history (for example with `git filter-repo`) and push rewritten history.
5. Do not assume deleting the working tree file is enough; history must be clean.
6. Git LFS can be used, but review storage/bandwidth quota policy before enabling.

## 4.1 TOC Sidebar Missing

1. Confirm page front matter includes:
   - toc:
     sidebar: left or right
2. Confirm default layout still renders #toc-sidebar.
3. Confirm assets/js/common.js custom TOC builder was not broken.
4. Inspect browser console for JS errors.

## 4.11 TOC Items Render In One Line Or Active State Not Updating

1. Confirm generated TOC markup uses dedicated classes:
   - `toc-nav-list`
   - `toc-nav-item`
   - `toc-nav-link`
2. Confirm `_sass/_custom.scss` keeps TOC list/item/link selectors scoped to those classes (not generic `.nav` selectors).
3. Confirm `assets/js/common.js` unified TOC state is active (absolute scroll anchor + cached heading positions).
4. Rebuild and hard-refresh browser cache after style/script changes.

## 4.12 Blog Taxonomy Links Or Mobile Heatmap Looks Broken

1. Verify taxonomy links are generated from source-of-truth templates:
   - `_includes/blog_index_content.liquid`
   - `_layouts/post.liquid`
2. Confirm archive links use normalized trailing-slash routes:
   - `/blog/category/<slug>/`
   - `/blog/tag/<slug>/`
3. For zh pages, ensure links remain in language space (`/zh/blog/...`) when applicable.
4. If mobile heatmap layout is compressed, verify `_includes/blog_heatmap.liquid` applies responsive cell sizing and keeps labels readable on narrow screens without horizontal scrolling.
5. Run full build and test at desktop + mobile breakpoints before deploy.

## 4.2 Unexpected Typography Regressions

1. Inspect _sass/_custom.scss for overly broad selectors.
2. Ensure scoped selectors use semantic classes (repo-card, series-card).
3. Rebuild assets and hard-refresh browser cache.

## 4.3 Language Toggle Links Wrong

1. Verify lang and lang-ref fields exist in paired pages/posts.
2. Validate _includes/lang_switch_url.liquid fallback logic.
3. Confirm about/home pages have lang-ref mapping.
4. Verify language-switch URL enters target language space:
   - zh target URL should include /zh/ prefix.
   - default language target URL should not include /zh/ prefix.

## 4.4 Script or Lint Warnings

1. Use approved PowerShell verbs.
2. Keep script docs in sync with actual ports/commands.
3. Avoid interactive prompts in automation paths.

## 4.5 Series Page Missing Posts

1. Prefer series_key in both _series and _posts front matter.
2. Ensure series_key values are exactly identical (case-sensitive).
3. Confirm lang is aligned with the active language page.

## 4.15 Series Cards Overlapping or Uneven Heights

1. Root cause: `row-cols-md-2` grid with odd series count causes solo card on last row; `h-100` only equalizes heights within the same Bootstrap row.
2. Fix is in `_sass/_custom.scss` under `.post .series-grid`:
   - `.col` set to `display: flex`
   - `.col > a` set to `display: flex; flex: 1`
   - `.series-card` set to `flex: 1; min-height: 130px`
3. This ensures all series cards render at the same height regardless of row position.

## 4.6 Giscus Comments Not Showing

1. Check `_config.yml` has all required fields under `giscus`:
   - `repo`
   - `repo_id`
   - `category_id`
2. Recommended bilingual setup:
   - `mapping: pathname`
   - `strict: 0`
   - `lang: auto`
3. Confirm post or book page has comments enabled (by defaults or per-page front matter):
   - `giscus_comments: true`
4. Giscus initialization is inline in `_includes/giscus.liquid` (no external JS file needed).
5. Theme-aware: uses `determineComputedTheme()` from `theme.js` on initial load, and `setGiscusTheme()` for runtime theme switching.
6. Config supports `giscus.dark_theme` and `giscus.light_theme` for custom giscus color schemes.

## 4.7 LF/CRLF Warnings During Deploy

1. These warnings are usually line-ending normalization noise, not build failures.
2. Ensure deploy scripts generate gh-pages `.gitattributes` with:
   - `* text=auto eol=lf`
   - `*.ps1 text eol=crlf`
3. Deploy scripts normalize common text artifacts (including `.bib`) to LF in `_site` before copying into `_gh-pages`.
4. Deploy scripts write gh-pages `.gitattributes` with explicit LF newlines.
5. This avoids post-copy rewrite in `_gh-pages`, reducing Windows file-lock and memory-map write failures.
6. Re-run deploy; warnings should drop significantly for generated files.

## 4.8 Search Modal Not Opening

1. Confirm `search_enabled: true` in `_config.yml`.
2. Verify generated page contains all search assets:
   - `/assets/js/search-setup.js`
   - `/assets/js/search-data.js`
   - `/assets/js/shortcut-key.js`
3. Ensure `openSearchModal` is attached to `window` so header `onclick` can invoke it.
4. Rebuild and redeploy if search script changed.

## 4.9 Polyglot + Imagemagick Build Race

1. Symptom: build fails with `Errno::ENOENT` on `/srv/jekyll/_site/zh` during imagemagick generation.
2. Cause: concurrent language workers can race while writing `_site` assets.
3. Mitigation: set `parallel_localization: false` in `_config.yml`.
4. Re-run build with `./scripts/build.ps1` after updating config.

## 4.10 Benign 404 Noise (.well-known / content.css.map)

1. `/.well-known/appspecific/com.chrome.devtools.json` requests are often browser probe noise during local browsing.
2. `.../content.css.map` can be generated by devtools/extensions probing source maps and may not indicate site runtime breakage.
3. Treat these as non-functional unless user-visible behavior is broken.
4. Prefer routing/config-level handling and documentation; do not add one-off per-page placeholder files as a long-term fix.
5. Validate impact by checking actual page render, navigation, and language routing behavior after a full build.

## 4.13 News Auto-Classification Not Working

1. Verify `_includes/news.liquid` exists and is the enhanced version with badge support.
2. News items can set `news_type` in front matter to override auto-detection:
   - `news_type: publication | award | talk | funding | general`
3. Auto-detection keywords:
   - **publication**: "accepted", "published", "paper", "journal", "conference"
   - **award**: "award", "prize", "scholarship", "fellowship"
   - **talk**: "talk", "keynote", "presentation", "invited", "seminar"
   - **funding**: "grant", "funding", "nsf", "sponsor"
4. Badge styles are in `_sass/_blog.scss` with dark mode variants.
5. i18n: badge labels are English-only by design (consistent with heatmap).

## 4.14 Image Gallery Not Rendering

1. Verify `_includes/image_gallery.liquid` exists.
2. Gallery is used in posts/pages via front matter:
   ```yaml
   gallery:
     - url: /assets/img/photo1.jpg
       alt: "Description"
       caption: "Optional caption"
   ```
3. Include in content: `{% include image_gallery.liquid images=page.gallery columns=3 %}`
4. Requires `enable_medium_zoom: true` in `_config.yml` for zoom-on-click.
5. Gallery styles are in `_sass/_components.scss` (`.image-gallery` class).
6. Responsive: 3→2→1 columns at desktop/tablet/mobile breakpoints.

## 5. Release Notes Template

Use this short template in PRs/releases:

1. Scope: what user-visible behavior changed
2. Architecture touchpoints: files that were source of truth
3. Validation: commands and manual pages checked
4. Risks: known limitations or deferred follow-ups

A consistent release note format improves continuity for both humans and AI agents.
