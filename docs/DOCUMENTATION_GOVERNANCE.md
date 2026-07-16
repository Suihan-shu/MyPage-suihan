# Documentation Governance

This file defines when and how documentation must be updated.

## 1. Why This Exists

Without explicit rules, code changes and documentation drift apart. This governance ensures long-term maintainability for both humans and AI agents.

## 2. Required Docs for Architecture-Impacting Changes

If any of these areas change, at least one architecture doc must be updated:

1. Layouts and includes (`_layouts/`, `_includes/`)
2. Global styles and tokens (`_sass/_custom.scss`)
3. Client logic that affects rendering (`assets/js/`)
4. Core scripts and workflows (`scripts/build*`, `scripts/deploy*`, `scripts/serve.ps1`)
5. Core configuration (`_config.yml`)

Required docs set:

1. `docs/ARCHITECTURE_CHANGE_GUIDE.md`
2. `docs/CHANGE_DECISION_TREE.md`
3. `docs/MAINTENANCE_RUNBOOK.md`
4. `docs/DOCS_GUIDE.md`
5. `README.md` (if top-level navigation or workflows changed)

## 3. Update Triggers

Update documentation when any of the following changes:

1. Source-of-truth file mapping
2. Change boundary decisions
3. Validation commands
4. TOC strategy or taxonomy strategy
5. Localization strategy
6. Build/deploy workflow

## 4. Documentation Quality Standard

Each documentation update should include:

1. What changed
2. Why it changed
3. Which files own the behavior now
4. How to validate
5. Any known limitations

## 5. Automation

- `scripts/validate_structure.ps1` includes a docs-sync check for architecture-impacting changes.
- If docs are missing for relevant code changes, validation fails.

## 6. Human and AI Workflow

1. Make code changes in source-of-truth files.
2. Update relevant docs immediately in the same change.
3. Run validation.
4. Summarize both code and docs changes in review/PR notes.
