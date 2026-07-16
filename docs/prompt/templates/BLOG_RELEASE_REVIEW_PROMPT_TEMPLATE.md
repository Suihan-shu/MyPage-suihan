# 博客发布审查 Prompt 模板（双语草稿专用）

用途：
用于“将 _drafts 中一组中英文文章发布到 _posts 前”的一次性审查与落库执行。

使用方式：
1. 先在同一会话提供 docs/prompt/AI_CHANGE_PROMPT.md。
2. 再粘贴本模板并填写变量。
3. 让 AI 直接执行，不只给建议。

---

## 模板（可直接复制）

```text
你是一名资深 Prompt 工程师 + Jekyll 博客维护工程师。
请按“先审查、后修复、再校验、最后汇报”的流程，处理我本次博客发布任务。

【仓库信息】
- 仓库根目录：<仓库根路径>
- 当前分支：<分支名>
- 默认分支：<默认分支名>

【本次发布对象】
- 英文草稿：_drafts/<EN_DRAFT_FILENAME>.md
- 中文草稿：_drafts/<ZH_DRAFT_FILENAME>.md

【发布目标】
1) 判断两篇草稿是否符合本仓库发布规范。
2) 若不符合，直接修复到“可发布态”。
3) 将草稿迁移到 _posts（文件名遵循现有 en/zh 命名风格）。
4) 确保双语切换、系列聚合、front matter 合规。

【必须遵守的架构边界（YOUR_GITHUB_USERNAME Blog）】
- 博客索引逻辑：_includes/blog_index_content.liquid
- 语言切换逻辑：_includes/lang_switch_url.liquid
- 文章 taxonomy：_layouts/post.liquid 与 _layouts/book-review.liquid
- 样式 token 与覆盖：_sass/_custom.scss
- TOC 与栏宽骨架：_layouts/default.liquid
- 双语文案源：_data/i18n.yml（热力图固定英文除外）

【审查规则】
请逐项检查并修复：
1. front matter 必填字段是否完整：
   - layout: post
   - title
   - date
   - categories
   - tags
   - description
   - lang（en/zh）
   - lang-ref（中英文一致）
   - toc.sidebar（如标题结构足够）
    - YAML 安全写法：
       - title / description 若包含冒号、特殊符号或中英文混排，统一使用双引号
       - categories / tags 的列表项统一使用双引号
       - 避免未转义字符导致 mapping values are not allowed in this context
2. 双语配对规范：
   - 中英文文章 lang-ref 必须完全一致
   - 语言切换目标路径必须正确（zh -> /zh/...，en -> 默认语言路径）
3. 系列规范（如存在 series_key）：
   - series_key 在中英文文章一致
   - series_order 为数字
   - 若 _series 下不存在对应系列页，自动补齐中英文系列落地页
4. 命名与目录规范：
   - 草稿应迁移至 _posts
   - 文件名遵循仓库既有风格（建议以 -en / -zh 区分）
5. 最小改动原则：
   - 仅改动发布所需内容，不做无关重构
6. 发布前 YAML 自检：
   - front matter 必须可被 Jekyll 正常解析
   - 若出现 YAML Exception，先修复 YAML 再继续后续步骤

【执行步骤】
1. 读取并对照：README.md、docs/DOCS_GUIDE.md、docs/templates/*frontmatter*、docs/templates/*series*。
2. 审查两篇草稿并列出问题。
3. 直接修改并迁移文件到 _posts。
4. 若需要，新增 _series/<series_key>.md 与 _series/<series_key>_zh.md。
5. 对新增/修改的文章先做 front matter YAML 自检（重点检查 title、description、categories、tags 的引号与列表格式）。
6. 运行 scripts/validate_structure.ps1。
7. 若改动了 layout/include/template/script 行为，再执行完整 Jekyll 构建。

【输出格式（必须按此顺序）】
1. 审查结论：通过/不通过 + 问题列表
2. 修改文件清单（逐项说明“改了什么、为什么”）
3. 规范符合性说明：
   - 双语配对
   - 系列聚合
   - 路由切换
4. 校验结果：
   - scripts/validate_structure.ps1 结果
   - Jekyll build 结果（如执行）
5. 发布建议：是否可直接 deploy

【硬性约束】
- 不要只给建议，必须落地改文件。
- 不要回滚用户已有的无关改动。
- 不要使用一次性占位文件绕过双语路由问题。
- 若遇到阻塞（例如缺失关键元数据无法推断），先给出最小问题清单再提问。
```

---

## 快速填写示例

```text
<仓库根路径> = d:\Desktop\Blog\YOUR_GITHUB_USERNAME's Blog
<分支名> = gh-pages
<默认分支名> = main
<EN_DRAFT_FILENAME> = 2026-04-08-From-Single-Commands-to-Agent-Manuals-My-Prompt-Engineering-Practices
<ZH_DRAFT_FILENAME> = 2026-04-08-从单句指令到Agent操作手册：我的Prompt工程实践记录
```