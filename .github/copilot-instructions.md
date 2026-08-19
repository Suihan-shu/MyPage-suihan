# Copilot Repository Instructions

## Mission

Keep this repository coherent, centralized, and documentation-synchronized.

## Mandatory Change Contract

When making any non-trivial change, you MUST do all of the following:

1. Update source-of-truth files only (avoid duplicated logic).
2. Run `scripts/validate_structure.ps1` before finishing.
3. If architecture-impacting files changed, update at least one of:
   - `docs/ARCHITECTURE_CHANGE_GUIDE.md`
   - `docs/CHANGE_DECISION_TREE.md`
   - `docs/MAINTENANCE_RUNBOOK.md`
   - `docs/DOCS_GUIDE.md`
4. In your final summary, list:
   - what changed
   - why it changed
   - which docs were updated
   - what was validated

## Source-of-Truth Rules

1. Blog index behavior: `_includes/blog_index_content.liquid`
2. Language switch routing: `_includes/lang_switch_url.liquid`
3. Post taxonomy rendering: `_layouts/post.liquid` and `_layouts/book-review.liquid`
4. Global style tokens and scoped overrides: `_sass/_custom.scss`
5. Layout column split and TOC shell: `_layouts/default.liquid`
6. Bilingual strings (except fixed English heatmap): `_data/i18n.yml`
7. Bilingual pairing contract (`lang` and `lang-ref`): `docs/DOCS_GUIDE.md`

## Anti-Drift Rules

1. Do not reintroduce duplicated blog logic in `_pages/blog.md` and `_pages/blog_zh.md`.
2. Do not spread typography patches across multiple Sass partials.
3. Prefer semantic classes before broad selectors.
4. Keep taxonomy strategy consistent across post and book-review layouts.
5. Do not use one-off placeholder assets to patch bilingual routing issues; fix routing/template logic instead.

## Validation

Always run:

1. `scripts/validate_structure.ps1`
2. If layout/template changed: full build via Docker Jekyll command.

## Output Quality

1. Explain trade-offs and risks.
2. Prefer minimal, scoped changes.
3. Keep docs aligned with behavior changes.
