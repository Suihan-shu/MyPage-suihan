# Architecture and Change Guide

This is the primary architecture reference for this repository. It explains structure, ownership boundaries, and safe change patterns for both human contributors and AI coding agents.

## 1. Purpose and Non-Goals

Purpose:

1. Keep customization centralized.
2. Keep bilingual behavior consistent.
3. Prevent drift from repeated one-off patches.
4. Provide deterministic change entry points.

Non-goals:

1. Re-document all upstream al-folio behavior.
2. Replace script-level inline comments.
3. Introduce CI-level policy in this document.

## 2. High-Level Architecture

Core stack:

1. Jekyll (static generation)
2. al-folio (theme baseline)
3. jekyll-polyglot (en/zh)
4. Sass modules (compiled through assets/css/main.scss)
5. Docker Compose for local runtime/build parity

Branch and publish model:

1. Source branch: main
2. Publish branch/worktree: gh-pages mounted at _gh-pages/

## 3. Source-of-Truth Map

Use this map before editing.

1. Site/global runtime config: _config.yml
2. Bilingual text and date formats: _data/i18n.yml
3. Shared blog index logic: _includes/blog_index_content.liquid
4. Language switch routing logic: _includes/lang_switch_url.liquid
5. Blog heatmap rendering logic: _includes/blog_heatmap.liquid
6. Global layout shell and TOC columns: _layouts/default.liquid
7. Post metadata/taxonomy rules: _layouts/post.liquid
8. Book review taxonomy parity: _layouts/book-review.liquid
9. Repository card markup: _includes/repository/repo.liquid
10. Global style entrypoint: assets/css/main.scss
11. Centralized customization layer: _sass/_custom.scss
12. Search command data generation: _scripts/search.liquid.js
13. Search UI bootstrap and key handling: _includes/scripts.liquid, _includes/distill_scripts.liquid, assets/js/search-setup.js, assets/js/shortcut-key.js
14. CV rendering and bilingual data source: _layouts/cv.liquid, _data/cv.yml, _data/cv_zh.yml (RenderCV schema under cv.sections)
15. Course resource row rendering: _includes/course_resource_row.liquid
16. Structural guardrails: scripts/validate_structure.ps1

## 4. Rendering Pipeline

Request-to-page rendering sequence:

1. _layouts/default.liquid wraps page content.
2. _includes/header.liquid and _includes/footer.liquid provide global chrome.
3. Page-specific layout is rendered (for example _layouts/post.liquid).
4. Shared include fragments are injected (for example blog index content).
5. Styles compile from assets/css/main.scss.
6. _sass/_custom.scss is loaded last to ensure predictable overrides.

## 5. Current Design Decisions

1. Blog index pages are wrappers only.
   - _pages/blog.md and _pages/blog_zh.md should not host duplicated listing logic.
2. Heatmap language is intentionally fixed to English.
3. Taxonomy display is unified style.
   - Prefer categories.
   - Fallback to tags.
   - Shared icon style.
4. TOC sidebar is generated client-side from h1-h5 using custom strict hierarchy logic.
   - TOC generation first targets `#markdown-content`, falls back to `.post article`, and finally `.post`.
   - The global page title (`h1.post-title`) is always organically injected as the TOC root node, regardless of the matched scope, unless specifically marked with `data-toc-skip`.
   - Custom TOC generation algorithm precisely preserves DOM heading levels and maps them to nested HTML `<ul>` trees, ensuring robust handling of jumpy levels (e.g. `h3` immediately after `h1`) without corrupting parents.
5. On small screens, TOC is accessed via a localized floating trigger that shows section title + Contents/目录 and opens a drawer; the inline sidebar is hidden.
   - On desktop/tablet widths (>= 992px), the mobile TOC trigger/drawer must remain hidden to avoid duplicate TOC affordances.
   - The mobile TOC behavior must still work when entering mobile width after an initial desktop load (viewport resize/device emulation).
   - TOC state uses one shared current-section computation from headings in the active content scope, and drives both desktop sidebar active link and mobile current-section label.
   - Current-section selection uses an absolute scroll anchor (scrollTop + fixed-header offset) with cached heading positions to reduce viewport-height sensitivity.
   - Custom TOC markup/styles should rely on dedicated `toc-nav-*` classes instead of Bootstrap generic `.nav` classes, so future course additions keep a stable vertical TOC layout.
6. Typography and spacing customization is centralized in _sass/_custom.scss.
7. Courses page keeps the left TOC pattern but uses a wider content split than blog posts through a scoped body class (is-courses-page).
   - For TOC readability, each course card title is rendered as a top-level heading on courses overview pages, while resource items remain inside tables (no deep heading nesting).
   - Course cards can route to dedicated detail pages (for example /courses/<slug>/) to provide blog-like reading flow with TOC and richer narrative.
   - On the courses overview page, cards render a compact preview (first 3 resources) and expose the rest through an expandable "more resources" block.
   - Course resources in overview must be rendered in fixed type order: review -> exam -> solution -> project -> code -> book.
   - Courses-page TOC column is intentionally wider than before to avoid over-wrapped single-word lines in sidebar navigation.
   - Course cards include an explicit "course details" CTA and detail pages include a top back-arrow link to the courses index.
   - Shared row markup for course resources is centralized in `_includes/course_resource_row.liquid`; overview and detail tables should reuse this include to avoid drift.
   - Course detail pages should enable this link through `back_to_courses: true` in front matter, rendered by `_layouts/page.liquid` above the page title.
   - Every course with `slug` in `_data/course_resources.yml` should have bilingual detail page pair:
     - `_pages/courses/<slug>.md` (lang: en)
     - `_pages/courses/<slug>_zh.md` (lang: zh)
     - Both must share the same `lang-ref` and include `course_detail_resources.liquid` with matching `course_id`.
   - Asset links should prefer stable externally hosted URLs (for example jsDelivr over `course-assets`) to keep the blog repository lightweight.
8. Blog post pages and series child pages expose a top back-arrow link to their index pages (localized labels in i18n).
9. Series section heading uses global heading font, while series card internals use series card font token.
10. Series identity uses stable key-based matching.
   - Required field: series_key (for both series pages and posts).
11. Ctrl+K search behavior is language-aware at runtime.
   - Search items are filtered by current page language.
   - Search section labels and placeholder are localized through _data/i18n.yml.
12. Locale resolution in templates should prefer page.lang, then fall back to site.active_lang and site.default_lang.
13. Navbar page entries are filtered by resolved current locale (English pages default to en if lang is omitted).
14. Language switching follows deterministic bilingual routing:
   - Prefer lang-ref pair mapping.
   - Fallback by same permalink language pair.
   - Normalize target URL into target language space (zh uses /zh/...; default language uses root path without /zh prefix).
15. Footer legal/runtime copy is shared in English via site.footer_text for both languages.
16. Footer baseline mode is flow layout (non-fixed).
   - Keep `_config.yml` `footer_fixed: false` unless a deliberate product decision requires viewport-fixed footer.
   - Footer structure/markup still stays centralized in `_includes/footer.liquid`.
17. Language-toggle label is localized/contextual through _data/i18n.yml (for example zh page shows EN, en page shows 中文).
18. Include .well-known in Jekyll output to avoid local browser probe 404 noise.
19. Do not add post-specific static placeholder files as a long-term fix for browser probe or source-map 404 noise; prefer routing/config-level fixes and documented troubleshooting.

## 6. Change Boundaries

When changing a concern, edit these files first.

1. Typography tokens and visual tuning:
   - _sass/_custom.scss
2. Blog list behavior (series cards, featured cards, taxonomy strip):
   - _includes/blog_index_content.liquid
3. Post metadata and taxonomy block:
   - _layouts/post.liquid
4. Language switch target behavior:
   - _includes/lang_switch_url.liquid
5. TOC width/columns/content split:
   - _layouts/default.liquid
6. Heatmap labels/locale logic:
   - _includes/blog_heatmap.liquid
7. Series page and series post matching rules:
   - _layouts/series.liquid
   - _series/*.md and _posts/*.md front matter fields (series_key/series/series_order)
8. Search index and modal behavior:
   - _scripts/search.liquid.js
   - _includes/scripts.liquid
   - _includes/distill_scripts.liquid
   - _data/i18n.yml (search labels and placeholder)
9. CV content and bilingual CV data updates:
   - _data/cv.yml and _data/cv_zh.yml
   - Keep both files aligned to the RenderCV structure expected by _layouts/cv.liquid (cv.sections.*)

## 7. Governance Rules (Anti-Drift)

1. Do not duplicate business logic between language pages.
2. Do not spread typography rules across many Sass partials.
3. Use semantic classes before broad selectors.
4. Update both post and book-review taxonomy rules together.
5. Keep language-dependent copy in _data/i18n.yml unless explicitly fixed-language by product decision.
6. Update docs when architecture decisions change.

## 8. Operational Playbooks

Use detailed playbooks here:

1. Decision tree by change type:
   - docs/CHANGE_DECISION_TREE.md
2. Validation, release checks, troubleshooting:
   - docs/MAINTENANCE_RUNBOOK.md

## 9. Minimal Verification Standard

Before merge/deploy, run:

1. scripts/validate_structure.ps1
2. docker compose run --rm jekyll bash -c "bundle exec jekyll build --config _config.yml"

Then spot-check:

1. About/home page in en and zh
2. Blog index in en and zh
3. One post page with TOC sidebar
4. Repositories page
5. CV page

## 10. Onboarding Order For New Contributors (Human or AI)

Read in this order:

1. _config.yml
2. _data/i18n.yml
3. _layouts/default.liquid
4. _includes/blog_index_content.liquid
5. _layouts/post.liquid
6. _sass/_custom.scss
7. docs/CHANGE_DECISION_TREE.md
8. docs/MAINTENANCE_RUNBOOK.md

This sequence provides enough context to make coherent, low-risk changes quickly.
