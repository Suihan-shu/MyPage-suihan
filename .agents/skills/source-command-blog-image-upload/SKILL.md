---
name: "source-command-blog-image-upload"
description: "处理 Blog 图片——从 draft 文件夹提取图片、按 Blog 名称重命名、复制到 _cdn-assets 暂存区，并将 Blog .md 文件中的本地路径替换为 jsDelivr CDN URL。"
---

# source-command-blog-image-upload

Use this skill when the user asks to run the migrated source command `blog-image-upload`.

## Command Template

# Blog 图片处理与 CDN 化

## 任务目标

将用户在草稿中引用的本地图片：
1. 复制到 `_cdn-assets/<blog-slug>/` 文件夹
2. 重命名为 `<blog-slug>-<描述>.png` 格式
3. 将 `_posts/` 中对应 Blog 的图片引用全部替换为 jsDelivr CDN URL

## 执行步骤

### 1. 收集信息

向用户确认以下信息（如果用户已经提供了则直接使用）：
- **Blog slug**：用于命名和 CDN 路径，如 `github-student-pack`
- **源图片文件夹**：原始截图所在的目录，如 `D:\Desktop\Blog\计算机使用技巧\assets\`
- **Blog 文件**：`_posts/` 下对应的 `.md` 文件列表

### 2. 提取图片引用

读取 Blog 的 `.md` 文件，找出所有本地图片引用：
- `![alt](path/to/image.png)` 格式
- 路径含 `./assets/` 或本地绝对路径的
- 文件名形如 `image-2026XXXX.png` 或 `屏幕截图 XXXX.png`

提取出原始文件名的列表。

### 3. 生成重命名映射

对照源图片文件夹中的实际文件，为每张图片根据上下文（图片前后的文字、alt 文本）生成描述性英文名：

**命名规则：**
```
<blog-slug>-<2-4个词描述，小写连字符>.png
```

**参考例子：**
- 出现在"添加学生邮箱"附近 → `github-student-pack-email-settings.png`
- 出现在"学信档案"标题下 → `github-student-pack-chsi-archive.png`
- 出现在账单信息段落 → `github-student-pack-billing-info.png`

### 4. 复制并重命名

```powershell
$dst = "D:\Desktop\Blog\WiseZenn's Blog\_cdn-assets\<blog-slug>\"
New-Item -ItemType Directory -Force -Path $dst

# 逐张复制改名
Copy-Item -Path "<源文件夹>\<原始名>" -Destination "$dst\<新名>"
```

### 5. 替换 Blog 中的图片 URL

使用 Edit 工具，将所有本地图片引用替换为 jsDelivr CDN 格式：

```
https://cdn.jsdelivr.net/gh/WiseZenn/Blog-assets@main/<blog-slug>/<新文件名>.png
```

即 Markdown 中变为：
```markdown
![有意义的alt文本](https://cdn.jsdelivr.net/gh/WiseZenn/Blog-assets@main/<blog-slug>/<新文件名>.png)
```

**注意**：中英双语 Blog 需要同时处理 `-zh.md` 和 `-en.md`。

### 6. 输出汇总

用表格列出所有处理结果，并提醒用户：

> 图片已暂存到 `_cdn-assets/<blog-slug>/`。用 PicGo 将整个文件夹上传到 `WiseZenn/Blog-assets` 仓库（存储路径设为 `<blog-slug>/`），上传后 CDN URL 即生效。

## CDN 配置速查

| 配置项 | 值 |
|--------|-----|
| GitHub 仓库 | `WiseZenn/Blog-assets` |
| 分支 | `main` |
| jsDelivr URL 格式 | `https://cdn.jsdelivr.net/gh/WiseZenn/Blog-assets@main/<文件夹>/<文件名>` |
| PicGo 仓库名 | `WiseZenn/Blog-assets` |
| PicGo 自定义域名 | `https://cdn.jsdelivr.net/gh/WiseZenn/Blog-assets@main` |
