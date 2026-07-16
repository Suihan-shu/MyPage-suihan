# 中文博客系列页模板

系列页放在 `_series/`：

```yaml
---
layout: series
title: "系列标题"
description: "一句话系列简介"
lang: zh
permalink: /series/系列标识/
series_key: 系列标识
img: assets/img/1.jpg
importance: 1
---

这里填写系列介绍、学习目标和建议阅读顺序。
```

下方文章列表会自动聚合 `series_key` 相同的中文文章，并按照 `series_order` 排序。
