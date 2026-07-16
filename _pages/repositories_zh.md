---
layout: page
permalink: /repositories/
lang: zh
lang-ref: repositories
title: 代码库
description: 这里展示我的课程项目、个人项目和技术实验。
nav: true
nav_order: 1
---

{% if site.data.repositories.github_users %}

## GitHub users

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for user in site.data.repositories.github_users %}
    {% include repository/repo_user.liquid username=user %}
  {% endfor %}
</div>

---
{% endif %}

{% if site.data.repositories.github_repos %}

## GitHub repositories

<div class="repositories">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}
