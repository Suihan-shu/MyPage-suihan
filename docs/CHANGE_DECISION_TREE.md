# Change Decision Tree

Use this decision tree before touching code. It maps common requests to authoritative files and required follow-up checks.

## 1. Fast Entry Decision Tree

1. Is this request about AI collaboration docs (prompt rules or task forms)?
   - Yes: go to docs/prompt/PROMPT_GUIDE.md.
     - Behavior rules: docs/prompt/AI_CHANGE_PROMPT.md.
     - Task request forms: docs/prompt/templates/TASK_REQUEST_TEMPLATE_*.md.
   - No: continue.
2. Is the request mostly visual (font, spacing, width, hover, color)?
   - Yes: start at _sass/_custom.scss.
   - No: continue.
3. Is the request bilingual text/label/date format?
   - Yes: start at _data/i18n.yml.
   - No: continue.
4. Is the request about language switching links?
   - Yes: start at _includes/lang_switch_url.liquid.
   - No: continue.
5. Is the request about blog index behavior (series cards, list logic, taxonomy strip)?
   - Yes: start at _includes/blog_index_content.liquid.
   - No: continue.
6. Is the request about single post metadata/taxonomy rendering?
   - Yes: start at _layouts/post.liquid and mirror in _layouts/book-review.liquid if taxonomy rules are touched.
   - No: continue.
7. Is the request about TOC sidebar structure/columns/spacing?
   - Yes: start at _layouts/default.liquid, then _sass/_custom.scss for spacing/typography.
   - No: continue.
8. Is the request about heatmap labels or locale?
   - Yes: _includes/blog_heatmap.liquid.
9. Is the request about Ctrl+K search content, language filtering, or placeholder?
   - Yes: start at _scripts/search.liquid.js and _data/i18n.yml.
   - Also verify loading points in _includes/scripts.liquid and _includes/distill_scripts.liquid.

## 2. Scenario-to-File Matrix

1. Change nav language button text or behavior:
   - _includes/header.liquid
   - _includes/lang_switch_url.liquid
   - Verify target URL enters target language space (zh targets must use /zh/...; default language targets must not use /zh prefix)
2. Change page labels per language:
   - _data/i18n.yml
   - include/layout consuming that key
3. Change post taxonomy strategy:
   - _layouts/post.liquid
   - _layouts/book-review.liquid
   - _includes/blog_index_content.liquid
4. Change repository card markup/classes:
   - _includes/repository/repo.liquid
   - _sass/_custom.scss
5. Change TOC depth or generation logic:
   - assets/js/common.js
   - _layouts/default.liquid
   - Keep TOC DOM contract on dedicated classes (`toc-nav-list`, `toc-nav-item`, `toc-nav-link`) instead of Bootstrap generic `.nav` classes.
   - Keep current-section logic unified (desktop active + mobile label) and based on absolute scroll anchor with cached heading positions.
6. Change article width and TOC column split:
   - _layouts/default.liquid
   - _sass/_custom.scss
7. Change global typography policy:
   - _sass/_custom.scss only (unless structural selector changes are required)
8. Change Ctrl+K search content or localization:
   - _scripts/search.liquid.js
   - _data/i18n.yml
   - _includes/scripts.liquid
   - _includes/distill_scripts.liquid

## 3. Required Follow-Up By Change Type

1. Style-only changes:
   - Run scripts/validate_structure.ps1
   - Spot-check en/zh blog post + repositories + CV
2. Template/layout changes:
   - Run scripts/validate_structure.ps1
   - Run one full Jekyll build
   - Verify no empty TOC/sidebar blocks
3. i18n changes:
   - Verify all keys exist for both en and zh
   - Verify fallback behavior in templates
4. Script changes:
   - Ensure approved PowerShell verbs
   - Validate docs examples still match script behavior

## 4. Red Flags (Stop and Re-Evaluate)

1. You are editing both _pages/blog.md and _pages/blog_zh.md logic directly.
2. You are adding many !important rules in multiple Sass partials.
3. You are introducing parallel taxonomy logic in only one layout.
4. You are changing heatmap localization without updating decision docs.
5. You are widening global .container instead of scoping post-specific width behavior.
6. You are adding page-specific placeholder assets (for example one-off *.map files) to suppress browser probe logs instead of fixing routing/config behavior.

## 5. Safe Change Template

For each PR or patch, document:

1. Change intent
2. Source-of-truth file(s) touched
3. Why these files were chosen
4. Validation commands run
5. Pages manually verified

Keeping this template prevents architecture drift and duplicate fixes.
