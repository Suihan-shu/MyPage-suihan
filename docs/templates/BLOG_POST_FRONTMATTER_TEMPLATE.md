# 中文博客文章模板

普通文章文件名使用 `YYYY-MM-DD-文章标题.md`，放入 `_posts/`：

```yaml
---
layout: post
title: "文章标题"
date: YYYY-MM-DD HH:MM:SS +0800
categories: [分类]
tags: [标签一, 标签二]
lang: zh
description: "一句话摘要"
giscus_comments: true
related_posts: true
toc:
  sidebar: left
# thumbnail: /assets/img/缩略图.jpg
---
```

如果文章属于系列，再增加：

```yaml
series_key: 系列标识
series_order: 10
```

`series_key` 必须与系列页一致，`series_order` 使用数字控制阅读顺序。
