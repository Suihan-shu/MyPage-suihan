---
layout: page
title: 博客
lang: zh
permalink: /blog/
nav: true
nav_order: 2
description: 记录深入的学习心得、技术总结与长篇思考。
---

<div class="blog-posts-list mt-4">
  {% assign posts = site.posts %}
  {% if posts and posts.size > 0 %}
    <div class="row">
      {% for post in posts %}
        <div class="col-12 mb-4">
          <div class="card p-3 shadow-sm border-0" style="background: var(--global-card-bg-color); border: 1px solid var(--global-divider-color) !important; border-radius: 12px;">
            <div class="card-body">
              <div class="text-muted small mb-2">
                <i class="fa-regular fa-calendar mr-1"></i> {{ post.date | date: "%Y年%m月%d日" }}
                {% if post.categories and post.categories.size > 0 %}
                  &bull; <i class="fa-solid fa-folder-open ml-1 mr-1"></i> {{ post.categories | join: ', ' }}
                {% endif %}
              </div>
              <h3 class="card-title h4 mb-2">
                <a href="{{ post.url | relative_url }}" class="text-decoration-none" style="color: var(--global-theme-color);">{{ post.title }}</a>
              </h3>
              {% if post.description %}
                <p class="card-text text-muted mb-3">{{ post.description }}</p>
              {% endif %}
              {% if post.tags and post.tags.size > 0 %}
                <div>
                  {% for tag in post.tags %}
                    <span class="badge badge-light mr-1" style="background: var(--global-code-bg-color); color: var(--global-theme-color);">#{{ tag }}</span>
                  {% endfor %}
                </div>
              {% endif %}
            </div>
          </div>
        </div>
      {% endfor %}
    </div>
  {% else %}
    <div class="text-center py-5 text-muted">
      <i class="fa-solid fa-pen-nib fa-3x mb-3 text-primary" style="opacity: 0.6;"></i>
      <p class="h5">暂未发布博客文章</p>
      <p class="small">站长可通过专属发布台随时在线撰写并发布文章。</p>
    </div>
  {% endif %}
</div>
