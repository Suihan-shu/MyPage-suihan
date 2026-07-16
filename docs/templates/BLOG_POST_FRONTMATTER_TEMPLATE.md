# Blog Post Front Matter Template

Use this template for normal (non-series) blog posts.

```yaml
---
layout: post
title: "<Post Title>"
date: YYYY-MM-DD HH:MM:SS +0800
categories: [<Category1>, <Category2>]
tags: [<tag1>, <tag2>]
lang: zh # or en
lang-ref: <paired-post-id>
description: "<One-line description>"
giscus_comments: true
related_posts: true
toc:
  sidebar: left
# thumbnail: https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/images/posts/YYYY/MM/thumbnail.jpg
# featured: true
---
```

Rules:

1. Keep `lang-ref` identical between paired EN/ZH posts.
2. Use concise tags and categories for cleaner archive pages.
3. Enable `toc.sidebar` only when the article has enough heading structure.
