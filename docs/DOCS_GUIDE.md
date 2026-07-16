# YOUR_GITHUB_USERNAME's Blog - 博客使用指南

## 关键文档

- [架构与改动指南](ARCHITECTURE_CHANGE_GUIDE.md)
- [改动决策树](CHANGE_DECISION_TREE.md)
- [维护运行手册](MAINTENANCE_RUNBOOK.md)
- [文档治理规范](DOCUMENTATION_GOVERNANCE.md)
- [样式自定义指南](../customize.md)
- [Prompt 文档说明](prompt/PROMPT_GUIDE.md)
- [博客文章模板（标准）](templates/BLOG_POST_FRONTMATTER_TEMPLATE.md)
- [博客文章模板（双语版）](templates/BLOG_FRONTMATTER_GUIDE.md)
- [系列页模板（英文）](templates/SERIES_PAGE_TEMPLATE_EN.md)
- [系列页模板（中文）](templates/SERIES_PAGE_TEMPLATE_ZH.md)
- [系列文章 Front Matter 模板](templates/POST_IN_SERIES_FRONTMATTER_TEMPLATE.md)
- [图床使用指南](IMAGE_HOSTING.md)

## 推荐阅读顺序

### 如果你是内容作者

1. 本文档（docs/DOCS_GUIDE.md）
2. 图床使用指南（IMAGE_HOSTING.md）

### 如果你是开发者或维护者

1. 架构与改动指南（ARCHITECTURE_CHANGE_GUIDE.md）
2. 改动决策树（CHANGE_DECISION_TREE.md）
3. 维护运行手册（MAINTENANCE_RUNBOOK.md）
4. 文档治理规范（DOCUMENTATION_GOVERNANCE.md）
5. AI 改动提示词模板（prompt/AI_CHANGE_PROMPT.md）
6. 本文档（docs/DOCS_GUIDE.md）中的日常命令

## 目录职责说明

1. `docs/prompt/`
  - 存放 AI 行为规范和协作说明（规则级输入）。
2. `docs/prompt/templates/`
  - 存放 AI 任务请求表单（任务级输入）。
3. `docs/templates/`
  - 存放博客内容创作模板（内容级输入）。

## 快速开始

### 1. 启动本地开发服务器

```powershell
# Windows PowerShell
.\scripts\serve.ps1
```

```bash
# Linux/Mac
./scripts/build.sh --serve
```

访问 http://localhost:8040 查看网站。

### 2. 一键发布到 GitHub Pages

```powershell
# Windows PowerShell
.\scripts\deploy.ps1 -Message "更新博客内容"
```

```bash
# Linux/Mac
./scripts/deploy.sh "更新博客内容"
```

网站将发布到: https://your-github-username.github.io

---

## 项目结构（精简）

最常用目录与职责：

1. `_posts/`：博客文章正文。
2. `_series/`：系列落地页（按 `series_key` 聚合）。
3. `_includes/`：可复用模板片段。
4. `_layouts/`：页面布局骨架。
5. `_sass/`：样式与视觉 token。
6. `scripts/`：构建、预览、发布、结构校验脚本。
7. `docs/prompt/`：AI 协作规范与任务请求模板。
8. `docs/templates/`：内容创作模板（博客/系列 front matter）。

高频入口：

1. 架构说明：[ARCHITECTURE_CHANGE_GUIDE.md](ARCHITECTURE_CHANGE_GUIDE.md)
2. 改动决策：[CHANGE_DECISION_TREE.md](CHANGE_DECISION_TREE.md)
3. 运维校验：[MAINTENANCE_RUNBOOK.md](MAINTENANCE_RUNBOOK.md)
4. Prompt 协作说明：[prompt/PROMPT_GUIDE.md](prompt/PROMPT_GUIDE.md)

---

## 写博客

### 创建新文章

在 `_posts/` 目录下创建文件，文件名格式：

```
YYYY-MM-DD-文章标题.md
```

例如：`2025-01-31-my-first-post.md`

### 文章模板

- 标准文章模板: [templates/BLOG_POST_FRONTMATTER_TEMPLATE.md](templates/BLOG_POST_FRONTMATTER_TEMPLATE.md)
- 双语文章模板: [templates/BLOG_FRONTMATTER_GUIDE.md](templates/BLOG_FRONTMATTER_GUIDE.md)
- 系列文章模板: [templates/POST_IN_SERIES_FRONTMATTER_TEMPLATE.md](templates/POST_IN_SERIES_FRONTMATTER_TEMPLATE.md)

### 课程资料维护（预览 + 下载）

课程页支持数据驱动渲染，建议按课程聚合资料，而不是把大量文件直接散落在页面内容中。

1. 维护文件: `_data/course_resources.yml`
2. 每条资料建议包含:
  - `name` / `name_zh`（标题）
  - `type`（exam/review/notes/slides/...）
  - `year`
  - `format`（pdf/docx/md/zip）
  - `preview_url`（在线预览）
  - `download_url`（下载链接）
  - `backup_url`（可选备用链接，如 OneDrive）
  - `backup_links`（可选备用链接列表，用于三点菜单）
  - `updated_at`
3. 页面会自动渲染“预览”和“下载”按钮；可用相对路径或外链。
4. 建议策略:
  - 高频资料（复习重点、讲义）优先提供预览。
  - 同时保留下载入口，便于离线学习。
  - Word 建议转 PDF 后再公开。

#### 预览与下载如何填写

1. 按钮显示规则：
  - 仅填写 `preview_url` -> 只显示“预览”按钮。
  - 仅填写 `download_url` -> 只显示“下载”按钮。
  - 两者都填 -> 同时显示两个按钮。
2. `download_url`：
  - 直接填写可访问的文件链接（站内相对路径或外部 HTTPS 链接）。
  - 若使用对象存储，建议填 CDN 或公开下载 URL。
3. `preview_url`：
  - PDF: 可直接使用文件 URL（浏览器原生预览）。
  - Office 文件（doc/docx/pptx）建议填在线预览链接（如 Office Online/Google Viewer），或先转 PDF。
4. 不建议把 Word 作为主要预览格式，跨平台稳定性较差。

#### GitHub 双链接推荐（已采用）

建议优先使用以下组合，以兼顾可用性和国内访问稳定性：

1. `preview_url` 使用 jsDelivr CDN 链接（GitHub 仓库文件）
2. `download_url` 使用 GitHub Releases 资产链接（或 jsDelivr 作为简化方案）
3. `backup_url` 使用 OneDrive/网盘链接作为故障回退

示例：

```yaml
preview_url: "https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/<path/file.pdf>"
download_url: "https://github.com/<owner>/<repo>/releases/download/<tag>/<asset-name>"
backup_url: "https://1drv.ms/b/..."
```

页面按钮映射：

1. `preview_url` -> 预览
2. `download_url` -> 下载
3. `backup_links`（或 `backup_url`）-> 三点菜单中的备用链接

建议将主按钮保持为“预览 + 下载”同排，备用源（OneDrive/网盘）放入三点菜单，减少视觉噪声。

#### 新增一门课程（总览 + 详情）

新增课程时，请同时更新数据和双语详情页，避免出现“总览可见但详情缺失”的半完成状态。

1. 在 `_data/course_resources.yml` 新增课程条目：
  - 必填：`id`、`slug`、`title`、`title_zh`、`resources`
  - 建议：`term`、`summary`、`summary_zh`
2. 按固定类型填充资源（可缺省某些类型，但顺序策略不变）：
  - `review -> exam -> solution -> project -> code -> book`
3. 新增英文详情页：`_pages/courses/<slug>.md`
4. 新增中文详情页：`_pages/courses/<slug>_zh.md`
5. 双语详情页 front matter 必须满足：
  - `lang` 分别为 `en` / `zh`
  - `lang-ref` 相同（建议与 slug 一致）
  - `back_to_courses: true`
6. 详情页正文统一通过 include 渲染：
  - `{% include course_detail_resources.liquid course_id='<id>' %}`

#### course-assets 仓库同步注意事项

1. GitHub 单文件上限是 100MB；超出会被 pre-receive hook 拒绝。
2. 即使已删除大文件，只要该文件仍在提交历史中，推送仍会失败。
3. 建议流程：
  - 在 `course-assets` 仓库增量提交并推送（先 `pull --rebase` 再 `push`）
  - 使用 jsDelivr `@main` 或版本标签链接回填到 `course_resources.yml`
4. 若误提交超大文件，优先清理历史后再推送，不要直接反复 force push。

### 课程资料外部托管（非 GitHub）

若不希望文件主体托管在 GitHub，可将下载/预览链接指向对象存储。

推荐选项:

1. Cloudflare R2（低成本 + CDN 友好）
2. AWS S3 + CloudFront（稳定成熟）
3. Backblaze B2（性价比高）
4. 阿里云 OSS / 腾讯云 COS（国内访问友好）

建议将站点保留为索引与导航层，文件本体放对象存储，便于后续扩展权限和流量控制。

### 双语路由与切换规范

请将下面规则视为发布前必查项：

1. 双语文章必须同时设置 `lang` 和 `lang-ref`。
2. `lang-ref` 必须在中英文配对文章中完全一致。
3. 双语页面（如 blog/books/courses/cv/repositories）建议显式设置 `lang` 和 `lang-ref`。
4. 语言切换后的目标 URL 必须进入目标语言空间：
  - 中文目标 URL 使用 `/zh/...`
  - 默认语言目标 URL 不使用 `/zh` 前缀
5. 不要用“单篇占位文件”规避路由问题；优先修复模板或路由逻辑。

### 使用图片

参考 [IMAGE_HOSTING.md](IMAGE_HOSTING.md) 了解如何使用图床。

---

## 配置修改

### 个人信息

编辑 `_config.yml`:

```yaml
title: "YOUR_GITHUB_USERNAME's Blog"
first_name: Wise
last_name: Zenn
description: >
  你的个人简介...
```

### 社交链接

编辑 `_data/socials.yml`:

```yaml
email: your@email.com
github_username: YOUR_GITHUB_USERNAME
# 更多选项...
```

### 导航菜单

编辑 `_pages/` 中的各个页面文件的 `nav` 和 `nav_order` 属性。

---

## Git 工作流

### 分支说明

- **main**: 源代码分支
- **gh-pages**: 构建产物分支（通过 Git Worktree 挂载到 `_gh-pages/`）

### 日常工作流

```bash
# 1. 编辑内容
# 2. 本地预览
.\scripts\serve.ps1

# 3. 满意后发布
.\scripts\deploy.ps1 -Message "你的提交信息"

# 4. 推送源代码（可选，备份用）
git add .
git commit -m "feat: 添加新文章"
git push origin main
```

---

## 图床架构

| 仓库 | 用途 |
|------|------|
| your-github-username.github.io | 博客源代码 + gh-pages 部署 |
| Blog-assets | 图片/视频等静态资源 |

**CDN 地址格式:**
```
https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/<路径>
```

---

## 常见问题

### Q: 构建失败怎么办？

1. 确保 Docker Desktop 正在运行
2. 检查 `_config.yml` 语法（特别是冒号后需要空格）
3. 运行 `docker compose down` 后重试

### Q: 网站没有样式？

检查 `_config.yml` 中的 `url` 和 `baseurl`:
```yaml
url: https://your-github-username.github.io
baseurl:  # 留空
```

### Q: 图片不显示？

1. 确认图片已上传到 Blog-assets 仓库
2. 确认 CDN 链接格式正确
3. 等待 jsDelivr 缓存更新（通常几分钟）

### Q: Ctrl+K 可以打开，但搜索不到内容？

1. 确认 `_config.yml` 中 `search_enabled: true`。
2. Ctrl+K 搜索现在按页面语言隔离：中文页只显示中文内容，英文页只显示英文内容。
3. 搜索分组标签和 placeholder 也会按当前语言显示（中文页显示中文标签）。
4. 修改了文章或页面后，需要重新构建并发布，`/assets/js/search-data.js` 才会更新。
5. 建议优先使用 `scripts/build.ps1` 或 `scripts/deploy.ps1` 触发完整重建。
6. 如果是 WeChat 条目，搜索结果会触发页面内二维码弹窗（`#wechat`），不是新窗口跳转。

### Q: 为什么看起来只切换了文章正文，导航和页脚没有变化？

1. 先检查该文章是否设置了 `lang` 和 `lang-ref`。
2. 再检查配对文章的 `lang-ref` 是否一致。
3. 确认切换后的目标 URL 是否进入正确语言空间（中文为 `/zh/...`）。
4. 完整重建后再验证：`docker compose run --rm jekyll bash -c "bundle exec jekyll build --config _config.yml"`。

### Q: 日志里出现 `/.well-known/...` 或 `content.css.map` 404，需要马上修吗？

1. 这类请求多数是浏览器或扩展的探测行为。
2. 若页面功能正常、导航正常、语言切换正常，可按“低优先级噪声”处理。
3. 不建议为单个页面添加临时占位文件作为长期方案。

---

## 有用的链接

- [al-folio 官方文档](https://github.com/alshedivat/al-folio)
- [Jekyll 文档](https://jekyllrb.com/docs/)
- [jsDelivr 文档](https://www.jsdelivr.com/documentation)
- [Markdown 指南](https://www.markdownguide.org/)
