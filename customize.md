# Customize Guide

This project now supports centralized style customization from one file:

- Main customization file: `_sass/_custom.scss`

Related docs:

- Architecture: `docs/ARCHITECTURE_CHANGE_GUIDE.md`
- Decision tree: `docs/CHANGE_DECISION_TREE.md`
- Maintenance checks: `docs/MAINTENANCE_RUNBOOK.md`

## Scope and Boundaries

Use `_sass/_custom.scss` as the single source of truth for global visual tuning:

1. Typography tokens and section-level font policy.
2. TOC typography sizing (`--custom-size-toc-level-*`).
3. CV, repository, media and travel-journal presentation.

Do not spread one-off typography overrides into multiple Sass partials. If a change is purely visual, start in `_sass/_custom.scss` first.

If your request is not style-only (for example layout structure, TOC generation logic, routing, or script behavior), use `docs/CHANGE_DECISION_TREE.md` to select the correct source-of-truth file instead of forcing the change into `_sass/_custom.scss`.

## Quick Start

1. Open `_sass/_custom.scss`.
2. Edit the CSS variables under `:root`.
3. Restart local preview if needed (`docker compose up`) and hard refresh browser (`Ctrl+F5`).

## Validation Workflow

After customization changes, run:

```powershell
scripts/validate_structure.ps1
docker compose run --rm jekyll bash -c "bundle exec jekyll build --config _config.yml"
```

Then spot-check:

1. Repositories page typography.
2. CV, media and travel-journal sections.

## Global Typography Matrix

In `_sass/_custom.scss`, update these variables:

- `--custom-font-body`: paragraphs, list text, metadata, general content.
- `--custom-font-heading`: h1-h6, post titles, card titles, section headings.
- `--custom-font-card`: base font for all cards.
- `--custom-font-card-title`: card title font.
- `--custom-font-card-body`: card body and badge font.
- `--custom-font-nav`: top navigation and dropdown menu typography.
- `--custom-font-ui`: generic interface text.
- `--custom-font-button`: button and pager typography.
- `--custom-font-form`: input/select/textarea/label typography.
- `--custom-font-table`: table text typography.
- `--custom-font-quote`: blockquote typography.
- `--custom-font-code`: code/pre/monospace typography.
- `--custom-font-footer`: footer typography.
- `--custom-font-toc`: left sidebar table-of-contents typography.
- `--custom-font-repo`: repositories section typography.

Weight tokens:

- `--custom-weight-heading`
- `--custom-weight-card-title`
- `--custom-weight-card-body`
- `--custom-weight-nav`
- `--custom-weight-button`
- `--custom-weight-repo-title`
- `--custom-size-toc-level-1`
- `--custom-size-toc-level-2`
- `--custom-size-toc-level-3`

## Examples

### Make the full site serif-heavy

```css
:root {
  --custom-font-body: "Source Serif Pro", Georgia, "Times New Roman", serif;
  --custom-font-heading: "New York", "Times New Roman", serif;
  --custom-font-nav: "New York", "Times New Roman", serif;
  --custom-font-footer: "Source Serif Pro", Georgia, serif;
}
```

### Keep global fonts, but change only code font

```css
:root {
  --custom-font-code: "JetBrains Mono", "Cascadia Code", Consolas, monospace;
}
```

### Make all cards sans-serif (optional)

```css
:root {
  --custom-font-card: "Aptos", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --custom-font-card-title: var(--custom-font-card);
  --custom-font-card-body: var(--custom-font-card);
  --custom-weight-card-title: 530;
  --custom-weight-card-body: 500;
}
```

### Change only repository card typography

```css
:root {
  --custom-font-repo: "New York", "Times New Roman", serif;
  --custom-weight-repo-title: 800;
}
```

## Notes

- On Windows, `New York` may be unavailable. In that case, browser falls back to the next font in stack.
- `_sass/_custom.scss` is loaded last in `assets/css/main.scss`, so your edits override earlier partials.
- Avoid adding typography overrides to multiple partial files. Keep all typography customization in `_sass/_custom.scss`.
