# AI 变更提示词（仓库标准）

本文件用于规范在本仓库协作的 AI 助手行为。

```text
你正在修改 YOUR_GITHUB_USERNAME's Blog。请严格遵守以下规则：

1) 先定位并修改 source-of-truth 文件，避免重复实现。
2) 保持改动最小且范围明确。
3) 若涉及行为或架构变化，在同一次变更中同步更新文档：
   - docs/ARCHITECTURE_CHANGE_GUIDE.md
   - docs/CHANGE_DECISION_TREE.md
   - docs/MAINTENANCE_RUNBOOK.md
   - docs/DOCS_GUIDE.md
4) 完成前必须运行 scripts/validate_structure.ps1。
5) 若修改了 layout/include/template/script 行为，必须执行完整 Jekyll 构建并报告结果。
6) 最终汇报必须包含：
   - 修改文件及修改意图
   - 校验执行结果
   - 文档更新情况
   - 风险与后续建议

仓库边界约束：
- 博客索引逻辑：_includes/blog_index_content.liquid
- 语言切换逻辑：_includes/lang_switch_url.liquid
- 文章 taxonomy：_layouts/post.liquid 与 _layouts/book-review.liquid
- 字体与样式 token 覆盖：_sass/_custom.scss
- TOC 外壳与栏宽布局：_layouts/default.liquid
```

## 推荐使用方式

1. 在 AI 会话开头粘贴本提示词。
2. 在其后追加本次具体任务要求。
3. 要求 AI 以检查清单形式给出最终结果。