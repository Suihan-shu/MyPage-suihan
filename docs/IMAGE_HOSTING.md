# YOUR_GITHUB_USERNAME's Blog - 图床使用指南

## 图床仓库

- **仓库地址:** https://github.com/YOUR_GITHUB_USERNAME/Blog-assets
- **CDN 加速:** jsDelivr

---

## 🚀 推荐方案：PicGo 一键上传

手动上传图片到 GitHub 再复制链接太痛苦了，**PicGo** 可以让你截图/拖拽即自动上传并返回 CDN 链接！

### 1. 下载安装 PicGo

- **下载地址**: https://github.com/Molunerfinn/PicGo/releases
- 选择适合你系统的版本（Windows 选 `.exe`）

### 2. 生成 GitHub Token

1. 打开 https://github.com/settings/tokens
2. 点击 **"Generate new token (classic)"**
3. 填写 Note（如 `PicGo`）
4. **勾选 `repo`** 权限（完整仓库访问权限）
5. 点击 **Generate token**
6. **立即复制 Token**（只显示一次！）

### 3. 配置 PicGo

打开 PicGo → 图床设置 → **GitHub**：

| 配置项 | 值 |
|--------|-----|
| 设定仓库名 | `YOUR_GITHUB_USERNAME/Blog-assets` |
| 设定分支名 | `main` |
| 设定 Token | `粘贴你刚才生成的 Token` |
| 指定存储路径 | `images/` |
| 设定自定义域名 | `https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main` |

点击 **确定** → **设为默认图床**。

### 4. 日常使用

- **截图上传**: 截图后点击 PicGo 或使用快捷键
- **拖拽上传**: 直接把图片拖到 PicGo 窗口
- **剪贴板上传**: 复制图片后快捷键上传

上传成功后，PicGo 会自动复制 Markdown 格式的图片链接到剪贴板：

```markdown
![](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/images/xxx.png)
```

### 5. 推荐配置

在 PicGo 设置中：

- ✅ **开机自启**
- ✅ **上传后自动复制 URL**
- ✅ **时间戳重命名**（避免文件名冲突）
- 上传快捷键：`Ctrl+Shift+P`（可自定义）

### 6. 以后迁移怎么办？

如果以后想换图床（如阿里云 OSS），只需在 VS Code 中全局搜索替换：

```
查找: https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/
替换: https://your-new-cdn.com/
```

因为文件名没变，一秒钟搞定！

---

## 目录结构建议

在 `Blog-assets` 仓库中创建以下目录结构：

```
Blog-assets/
├── images/
│   ├── posts/           # 博客文章图片
│   │   ├── 2025/        # 按年份分类
│   │   │   ├── 01/      # 按月份分类
│   │   │   └── ...
│   │   └── ...
│   ├── projects/        # 项目图片
│   ├── profile/         # 个人头像等
│   └── assets/          # 通用素材
├── videos/              # 视频文件（建议不超过20MB）
└── files/               # 其他文件（PDF等）
```

## jsDelivr CDN 链接格式

### 基础格式

```
https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/<文件路径>
```

### 示例

| 文件位置 | CDN 链接 |
|---------|---------|
| `images/posts/2025/01/example.png` | `https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/images/posts/2025/01/example.png` |
| `images/profile/avatar.jpg` | `https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/images/profile/avatar.jpg` |

### 指定版本/Tag（推荐用于生产环境）

```
https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@v1.0.0/images/example.png
```

## 在 Markdown 中使用

### 基本图片

```markdown
![图片描述](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/images/posts/2025/01/example.png)
```

### 带样式的图片（al-folio 支持）

```liquid
{% include figure.liquid 
    path="https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/images/posts/2025/01/example.png" 
    class="img-fluid rounded z-depth-1" 
    alt="图片描述" 
%}
```

### 响应式图片网格

```liquid
<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/images/1.jpg" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/images/2.jpg" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
```

## 图片上传流程

### 方法一：PicGo（推荐 ⭐）

见上方 **"推荐方案：PicGo 一键上传"** 部分。

### 方法二：Git 命令行

```bash
# 1. 克隆图床仓库（仅首次需要）
git clone https://github.com/YOUR_GITHUB_USERNAME/Blog-assets.git

# 2. 添加图片到对应目录
# 例如：将 screenshot.png 添加到 2025年1月的文章图片目录

# 3. 提交并推送
cd Blog-assets
git add .
git commit -m "Add: 添加博客文章图片"
git push origin main
```

### 方法三：GitHub 网页上传

1. 打开 https://github.com/YOUR_GITHUB_USERNAME/Blog-assets
2. 导航到目标目录
3. 点击 "Add file" → "Upload files"
4. 拖拽或选择文件上传
5. 填写提交信息并提交

## 图片优化建议

1. **压缩图片**：上传前使用 [TinyPNG](https://tinypng.com/) 压缩
2. **合适尺寸**：博客正文图片建议宽度不超过 1200px
3. **WebP 格式**：优先使用 WebP 格式（体积更小）
4. **文件命名**：使用英文、小写、短横线分隔，如 `blog-setup-guide.png`

## 缓存说明

jsDelivr 会缓存文件，如果更新了同名文件但看不到变化：

1. **等待缓存刷新**（通常 24 小时内）
2. **使用版本号**：`@v1.0.1` 替代 `@main`
3. **使用文件哈希**：上传新文件时使用不同文件名

## 快速复制模板

```markdown
<!-- 普通图片 -->
![描述](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/images/posts/YYYY/MM/filename.png)

<!-- figure.liquid 组件 -->
{% include figure.liquid path="https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/images/posts/YYYY/MM/filename.png" class="img-fluid rounded z-depth-1" alt="描述" %}
```

---

> 💡 **提示**：将图床仓库也克隆到本地，方便管理和上传图片。
