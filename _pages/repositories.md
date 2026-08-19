---
layout: page
permalink: /repositories/
lang: zh
title: 代码库
description: 这里展示我的个人项目、技术实验和开源仓库。
nav: true
nav_order: 1
---

{% if site.data.repositories.github_users %}

## 个人主页概览

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for user in site.data.repositories.github_users %}
    {% include repository/repo_user.liquid username=user %}
  {% endfor %}
</div>

---
{% endif %}

{% if site.data.repositories.github_repos %}

## 开源项目与仓库

<div class="repositories">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}
