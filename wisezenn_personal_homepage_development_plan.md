# 个人主页开发方案（基于 WiseZenn）

> 面向 Codex 的实施说明  
> 参考项目：[`WiseZenn/wisezenn.github.io`](https://github.com/WiseZenn/wisezenn.github.io)  
> 技术栈：Jekyll + al-folio + jekyll-polyglot + Sass + GitHub Pages  
> 方案日期：2026-07-15

---

## 1. 项目目标

基于 WiseZenn 的个人主页进行二次开发，保留其学术型、简洁、内容导向的整体结构，完成以下定制：

1. 网站主色调调整为浅蓝色。
2. About/关于页面中，头像与姓名区域并列展示。
3. About/关于页面底部只保留以下联系图标，并按此顺序排列：
   - 邮箱
   - GitHub
   - 微信
   - QQ
4. 暂时隐藏 Blog/博客和 Courses/课程，不删除相关代码，便于以后恢复。
5. Repositories/代码库继续使用 WiseZenn 当前的 GitHub 仓库卡片样式。
6. CV/简历页面结构保持不变，只替换个人数据和 PDF。
7. Bookshelf/书架改为：
   - English：`Books & Movies`
   - 中文：`书籍与电影`
8. “书籍与电影”页面分成两个独立区域：
   - Books / 书籍
   - Movies / 电影
9. 完整保留中英文切换功能。
10. 保留响应式布局、深色模式和 GitHub Pages 部署能力。

---

## 2. 最终信息架构

### 英文导航

```text
About | Repositories | CV | Books & Movies | 中文 | Search | Theme
```

### 中文导航

```text
关于 | 代码库 | 简历 | 书籍与电影 | EN | 搜索 | 主题
```

### 暂时隐藏

```text
Blog / 博客
Courses / 课程
```

“隐藏”采用软关闭方式：

- 不在导航栏显示；
- 不在首页显示最新博客；
- 不在搜索中展示博客文章；
- 保留 `_posts`、`_series`、课程页面和课程数据；
- 后续只需恢复配置即可重新启用。

---

## 3. 开发原则

### 3.1 不直接在 WiseZenn 原仓库开发

创建自己的仓库：

```text
<YOUR_GITHUB_USERNAME>/<YOUR_GITHUB_USERNAME>.github.io
```

推荐做法：

1. Fork `WiseZenn/wisezenn.github.io`；
2. 将 Fork 后的仓库命名为 `<YOUR_GITHUB_USERNAME>.github.io`；
3. 在自己的仓库中开发；
4. 保留原项目的 MIT License；
5. 页脚保留对 Jekyll、al-folio 和原始模板的合理署名。

### 3.2 优先使用定制层

WiseZenn 已将 `_sass/_custom.scss` 作为最后加载的样式文件。新增样式优先写入：

```text
_sass/_custom.scss
```

避免无必要地直接修改大量 al-folio 基础样式，以降低未来升级和维护成本。

### 3.3 双语页面必须成对修改

每个导航页面都应有英文和中文版本，并满足：

```yaml
lang: en / zh
lang-ref: 相同值
permalink: 相同值
```

例如：

```yaml
# English
lang: en
lang-ref: media
permalink: /media/
```

```yaml
# 中文
lang: zh
lang-ref: media
permalink: /media/
```

---

## 4. 建议的分支和提交方式

建议创建开发分支：

```bash
git checkout -b feat/personal-homepage
```

按功能拆分提交：

```text
chore: personalize global site configuration
feat: add light blue visual theme
feat: redesign bilingual about hero
feat: add reusable contact QR modals
chore: hide blog and courses
feat: add bilingual books and movies page
chore: update repositories and cv data
test: validate bilingual routes and responsive layout
```

不要将所有修改压成一个超大提交。

---

## 5. 开发环境

### 5.1 推荐环境

- Git
- Docker Desktop
- VS Code 或 Codex
- GitHub 账号

### 5.2 本地运行

仓库当前的 Docker Compose 服务名为 `jekyll`，本地端口为 `8040`。

```bash
docker compose up
```

访问：

```text
http://localhost:8040
```

### 5.3 完整构建测试

```bash
docker compose run --rm jekyll bundle exec jekyll build
```

如果仓库中的结构验证脚本可在当前系统运行，再执行：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate_structure.ps1
```

Codex 在修改前应先完成一次基线构建，确认原项目可正常运行。

---

## 6. 第一阶段：全局个人信息替换

### 6.1 修改 `_config.yml`

替换以下字段：

```yaml
title: "<YOUR_SITE_TITLE>"
first_name: "<YOUR_FIRST_NAME>"
middle_name:
last_name: "<YOUR_LAST_NAME>"

description: >
  <YOUR_SITE_DESCRIPTION>

url: "https://<YOUR_GITHUB_USERNAME>.github.io"
baseurl: ""

icon: "<YOUR_FAVICON_OR_EMOJI>"
```

同步替换：

```yaml
giscus:
  repo:
  repo_id:
  category:
  category_id:
```

由于当前不使用博客，可以先清空 Giscus 配置或保持功能关闭，避免仍指向 WiseZenn 的仓库。

检查并替换所有包含以下字符串的内容：

```text
WiseZenn
wisezenn
wisezenn.github.io
wisezenn.me@gmail.com
```

推荐执行：

```bash
git grep -n -i "wisezenn"
```

### 6.2 替换个人资源

建议文件：

```text
assets/img/prof_pic.jpg
assets/img/wechat-qr.png
assets/img/qq-qr.png
assets/pdf/CV.pdf
```

图片建议：

- 头像使用接近正方形的图片；
- 建议尺寸不小于 600 × 600；
- 文件体积控制在 500 KB 左右；
- 微信和 QQ 二维码使用清晰 PNG；
- 不要提交身份证、住址、学号等隐私信息。

---

## 7. 第二阶段：浅蓝色视觉主题

## 7.1 色彩方案

推荐使用低饱和浅蓝背景和较深蓝色链接，避免浅蓝文字与白色背景对比度不足。

```text
页面背景：      #F4FAFF
卡片背景：      #FFFFFF
浅蓝强调背景：  #EAF6FF
主链接/强调色： #1F6FAE
Hover：         #155886
正文文字：      #1F2D3D
次级文字：      #5E7184
边框：          #D7EAF7
深色模式强调：  #64B5F6
```

## 7.2 修改 `_sass/_custom.scss`

在文件顶部的 `:root` 中增加或覆盖视觉变量：

```scss
:root {
  --global-bg-color: #f4faff;
  --global-card-bg-color: #ffffff;
  --global-theme-color: #1f6fae;
  --global-hover-color: #155886;
  --global-hover-text-color: #ffffff;
  --global-text-color: #1f2d3d;
  --global-text-color-light: #5e7184;
  --global-divider-color: #d7eaf7;
  --global-code-bg-color: rgba(31, 111, 174, 0.08);
  --global-newsletter-bg-color: #eaf6ff;
}
```

为深色模式保留蓝色体系：

```scss
html[data-theme="dark"] {
  --global-theme-color: #64b5f6;
  --global-hover-color: #90caf9;
}
```

补充页面层次：

```scss
body {
  background:
    radial-gradient(circle at 85% 10%, rgba(144, 202, 249, 0.14), transparent 28rem),
    var(--global-bg-color);
}

.navbar {
  background-color: color-mix(in srgb, var(--global-bg-color) 92%, transparent);
  backdrop-filter: blur(10px);
}

.card,
.repo-card,
.media-card {
  border-color: var(--global-divider-color);
}
```

如 Sass/浏览器兼容性验证发现 `color-mix()` 不适合当前构建环境，改成固定颜色：

```scss
.navbar {
  background-color: rgba(244, 250, 255, 0.94);
}
```

## 7.3 不建议的做法

不要仅把 `_sass/_variables.scss` 中的 `$purple-color` 改成蓝色，因为：

- 会影响上游组件的语义；
- 后续升级时更容易产生冲突；
- WiseZenn 已明确将 `_custom.scss` 作为集中定制入口。

---

## 8. 第三阶段：About/关于页面重构

## 8.1 修改页面配置

修改：

```text
_pages/about.md
_pages/about_zh.md
```

启用头像配置：

```yaml
profile:
  image: prof_pic.jpg
  image_circular: true
```

关闭首页博客列表：

```yaml
latest_posts:
  enabled: false
```

保留：

```yaml
social: true
selected_papers: false
announcements:
  enabled: false
```

英文示例：

```yaml
---
layout: about
title: About
lang: en
lang-ref: about
permalink: /

profile:
  image: prof_pic.jpg
  image_circular: true

selected_papers: false
social: true

announcements:
  enabled: false

latest_posts:
  enabled: false
---
```

中文页面使用相同结构。

## 8.2 头像与姓名并列

模板默认会把头像作为正文区域中的浮动块，不能严格实现“头像在名字旁边”。

因此修改：

```text
_layouts/about.liquid
```

将原来的标题 Header 重构为：

```liquid
<header class="post-header about-hero">
  <div class="about-hero__text">
    <h1 class="post-title">
      {% if site.title == 'blank' %}
        <span class="font-weight-bold">{{ site.first_name }}</span>
        {{ site.middle_name }}
        {{ site.last_name }}
      {% else %}
        {{ site.title }}
      {% endif %}
    </h1>

    {% if page.subtitle %}
      <p class="desc">{{ page.subtitle }}</p>
    {% endif %}
  </div>

  {% if page.profile and page.profile.image %}
    <div class="about-hero__avatar">
      {% assign profile_image_path = page.profile.image | prepend: 'assets/img/' %}
      {% assign profile_image_class = 'img-fluid z-depth-1 rounded-circle' %}
      {% include figure.liquid
        loading="eager"
        path=profile_image_path
        class=profile_image_class
        alt=page.profile.image
        cache_bust=true
      %}
    </div>
  {% endif %}
</header>
```

随后删除或跳过 `<article>` 中旧的 `page.profile` 渲染块，避免头像重复出现。

推荐做法是加入一个兼容开关：

```yaml
profile:
  position: header
```

Liquid 中判断：

```liquid
{% if page.profile.position == 'header' %}
  ...
{% endif %}
```

这样以后仍可恢复默认浮动头像布局。

## 8.3 About Hero 样式

在 `_sass/_custom.scss` 中加入：

```scss
.about-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 1.25rem 0 1.75rem;
}

.about-hero__text {
  min-width: 0;
  flex: 1;
}

.about-hero__avatar {
  flex: 0 0 auto;
  width: clamp(140px, 18vw, 190px);
}

.about-hero__avatar img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 4px solid #ffffff;
  box-shadow: 0 12px 32px rgba(31, 111, 174, 0.18);
}

@media (max-width: 575.98px) {
  .about-hero {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 1rem;
  }

  .about-hero__avatar {
    width: 128px;
  }
}
```

如希望手机端头像居中，将 `align-items` 改为 `center`，并让文本 `text-align: center`。

---

## 9. 第四阶段：联系图标

## 9.1 修改 `_data/socials.yml`

只保留并按以下顺序定义：

```yaml
email: "<YOUR_EMAIL>"
github_username: "<YOUR_GITHUB_USERNAME>"

wechat_qr:
  logo: fa-brands fa-weixin
  url: "#contact-qr-wechat"
  title: WeChat
  qr_img: wechat-qr.png
  alt_en: "WeChat QR code"
  alt_zh: "微信二维码"

qq_qr:
  logo: fa-brands fa-qq
  url: "#contact-qr-qq"
  title: QQ
  qr_img: qq-qr.png
  alt_en: "QQ QR code"
  alt_zh: "QQ 二维码"
```

删除或注释：

```yaml
cv_pdf:
rss_icon:
instagram:
bilibili:
scholar:
```

CV 下载入口保留在 CV 页面，不再出现在 About 联系图标中。

## 9.2 将微信专用弹窗改成通用二维码弹窗

当前实现只支持微信：

```text
assets/js/wechat.js
_includes/footer.liquid
_sass/_components.scss
_includes/scripts.liquid
```

建议重构为可同时支持微信和 QQ 的通用组件。

### 新建 JavaScript

将：

```text
assets/js/wechat.js
```

替换或重命名为：

```text
assets/js/contact-qr.js
```

功能要求：

- 点击微信图标打开微信二维码；
- 点击 QQ 图标打开 QQ 二维码；
- 点击遮罩关闭；
- 按 `Escape` 关闭；
- 打开后阻止页面背景滚动；
- 关闭后恢复焦点；
- 不能覆盖 `window.onclick`，应使用 `addEventListener`；
- 链接点击时执行 `preventDefault()`。

建议使用 `data-modal-target` 或 URL hash 匹配对应弹窗。

### 修改 Footer

修改：

```text
_includes/footer.liquid
```

渲染两个弹窗：

```liquid
{% assign current_lang = page.lang | default: site.active_lang | default: site.default_lang %}

{% for social_pair in site.data.socials %}
  {% assign social_key = social_pair[0] %}
  {% assign social = social_pair[1] %}

  {% if social.qr_img %}
    {% assign alt_key = 'alt_' | append: current_lang %}

    <div
      id="contact-qr-{{ social_key | replace: '_qr', '' }}"
      class="contact-qr-modal"
      role="dialog"
      aria-modal="true"
      aria-hidden="true"
      aria-label="{{ social.title }}"
    >
      <button class="contact-qr-modal__close" type="button" aria-label="Close">&times;</button>
      <img
        src="{{ social.qr_img | prepend: 'assets/img/' | relative_url }}"
        alt="{{ social[alt_key] | default: social.title }}"
      >
    </div>
  {% endif %}
{% endfor %}
```

Codex 应根据 Liquid 对 Hash 遍历的实际行为验证上述代码，并在必要时改成显式渲染微信和 QQ，优先保证可靠性。

### 修改脚本加载

修改：

```text
_includes/scripts.liquid
```

将微信专用判断改为：

```liquid
{% if site.data.socials.wechat_qr or site.data.socials.qq_qr %}
  <script defer src="{{ '/assets/js/contact-qr.js' | relative_url | bust_file_cache }}"></script>
{% endif %}
```

### 修改样式

将 `_sass/_components.scss` 中：

```scss
.wechat-modal
```

重构为：

```scss
.contact-qr-modal
```

并建议将新增覆盖样式集中放入 `_sass/_custom.scss`：

```scss
.contact-qr-modal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1050;
  place-items: center;
  padding: 1.5rem;
  background: rgba(10, 26, 40, 0.78);
  backdrop-filter: blur(5px);
}

.contact-qr-modal.is-open {
  display: grid;
}

.contact-qr-modal img {
  width: min(82vw, 380px);
  max-height: 82vh;
  object-fit: contain;
  padding: 0.75rem;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.32);
}

.contact-qr-modal__close {
  position: fixed;
  top: 1rem;
  right: 1.25rem;
  border: 0;
  color: #ffffff;
  background: transparent;
  font-size: 2rem;
  cursor: pointer;
}
```

不要对二维码图片应用暗色模式反色滤镜，否则可能影响扫码识别。

---

## 10. 第五阶段：隐藏博客和课程

## 10.1 导航隐藏

修改：

```text
_pages/blog.md
_pages/blog_zh.md
_pages/courses.md
_pages/courses_zh.md
```

将：

```yaml
nav: true
```

改为：

```yaml
nav: false
```

不要删除页面文件。

## 10.2 首页隐藏博客

在：

```text
_pages/about.md
_pages/about_zh.md
```

设置：

```yaml
latest_posts:
  enabled: false
```

## 10.3 搜索隐藏博客文章

在 `_config.yml` 中修改：

```yaml
posts_in_search: false
```

保留：

```yaml
search_enabled: true
socials_in_search: true
```

Codex 还应检查 `_scripts/search.liquid.js`，确认：

- `nav: false` 页面不会作为导航项进入搜索；
- Blog/Courses 不会以其他分类残留；
- 搜索结果中不再出现博客文章和课程页面。

## 10.4 不删除的目录

保留：

```text
_posts/
_series/
_pages/blog.md
_pages/blog_zh.md
_pages/courses.md
_pages/courses_zh.md
_pages/courses/
_data/course_resources.yml
_sass/_blog.scss
_sass/_courses.scss
```

未来恢复时只需重新设置 `nav`、`latest_posts` 和 `posts_in_search`。

---

## 11. 第六阶段：Repositories/代码库

现有实现可直接保留。

### 11.1 修改 `_data/repositories.yml`

示例：

```yaml
repo_description_lines_max: 2

github_users:
  - <YOUR_GITHUB_USERNAME>

github_repos:
  - name: <YOUR_GITHUB_USERNAME>/<REPOSITORY_1>
    platform: github
    tags:
      - Python
      - Data Analysis

  - name: <YOUR_GITHUB_USERNAME>/<REPOSITORY_2>
    platform: github
    tags:
      - JavaScript
      - Web
```

如果不希望显示 GitHub 用户统计卡片，可保持：

```yaml
# github_users:
```

仅使用精选仓库列表。

### 11.2 修改双语描述

修改：

```text
_pages/repositories.md
_pages/repositories_zh.md
```

英文：

```yaml
description: Selected projects, coursework, and personal experiments.
```

中文：

```yaml
description: 这里展示我的课程项目、个人项目和技术实验。
```

### 11.3 验收要求

- 仓库卡片能正常显示；
- 仓库名称、描述、语言、Star 等信息无报错；
- 卡片在桌面端两列、移动端一列；
- Hover 使用浅蓝主题色；
- 不再引用 WiseZenn 的仓库。

---

## 12. 第七阶段：CV/简历

保持现有页面结构：

```text
_pages/cv.md
_pages/cv_zh.md
_layouts/cv.liquid
_data/cv.yml
_data/cv_zh.yml
```

只做内容替换：

1. 更新 `_data/cv.yml`；
2. 更新 `_data/cv_zh.yml`；
3. 确保中英文板块顺序一致；
4. 替换 PDF；
5. 修改页面描述；
6. 修改 PDF 路径。

示例：

```yaml
cv_pdf: /assets/pdf/CV.pdf
cv_format: rendercv
```

不要重构 `_layouts/cv.liquid`，除非出现明确的兼容问题。

---

## 13. 第八阶段：书籍与电影

## 13.1 页面命名

建议将：

```text
_pages/books.md
_pages/books_zh.md
```

重命名为：

```text
_pages/media.md
_pages/media_zh.md
```

英文：

```yaml
---
layout: media-shelf
title: Books & Movies
lang: en
lang-ref: media
permalink: /media/
nav: true
nav_order: 4
---
```

中文：

```yaml
---
layout: media-shelf
title: 书籍与电影
lang: zh
lang-ref: media
permalink: /media/
nav: true
nav_order: 4
---
```

如果不想重命名文件，也可以保留 `books.md` 文件名，只修改 Front Matter；但从长期维护角度，推荐重命名。

## 13.2 新增 Movies 集合

在 `_config.yml` 中增加：

```yaml
collections:
  series:
    output: true
  books:
    output: true
  movies:
    output: false
  news:
    output: true
  projects:
    output: true
  courses:
    output: true
```

第一版建议 `movies.output: false`，电影卡片不进入详情页，只展示信息和外部链接。

如以后需要写影评，再改为：

```yaml
movies:
  output: true
```

并增加 movie review layout。

## 13.3 目录结构

```text
_books/
  example-book.md

_movies/
  example-movie.md

_layouts/
  media-shelf.liquid

_includes/
  media-shelf-section.liquid

assets/img/media/books/
assets/img/media/movies/
```

如果原仓库暂时没有 `_books/`，Codex 应新建该目录。

## 13.4 书籍数据格式

`_books/example-book.md`：

```yaml
---
title: "The Little Prince"
title_zh: "小王子"
creator: "Antoine de Saint-Exupéry"
creator_zh: "安托万·德·圣-埃克苏佩里"
year: 1943
cover: "/assets/img/media/books/the-little-prince.jpg"
status: finished
rating: 5
started: 2026-01-10
finished: 2026-01-20
tags:
  - Fiction
external_url: ""
---

Optional personal note.
```

## 13.5 电影数据格式

`_movies/example-movie.md`：

```yaml
---
title: "Interstellar"
title_zh: "星际穿越"
creator: "Christopher Nolan"
creator_zh: "克里斯托弗·诺兰"
year: 2014
cover: "/assets/img/media/movies/interstellar.jpg"
status: watched
rating: 5
watched_on: 2026-02-01
tags:
  - Science Fiction
external_url: ""
---

Optional personal note.
```

## 13.6 状态枚举

书籍：

```text
reading
finished
queued
paused
abandoned
```

电影：

```text
watching
watched
watchlist
paused
abandoned
```

## 13.7 新增 i18n 文案

在 `_data/i18n.yml` 中增加：

```yaml
en:
  media:
    books_title: "Books"
    movies_title: "Movies"
    empty_books: "No books added yet."
    empty_movies: "No movies added yet."
    author: "Author"
    director: "Director"
    year: "Year"
    rating: "Rating"
    status:
      reading: "Reading"
      finished: "Finished"
      queued: "Want to Read"
      watching: "Watching"
      watched: "Watched"
      watchlist: "Watchlist"
      paused: "Paused"
      abandoned: "Abandoned"

zh:
  media:
    books_title: "书籍"
    movies_title: "电影"
    empty_books: "暂时还没有添加书籍。"
    empty_movies: "暂时还没有添加电影。"
    author: "作者"
    director: "导演"
    year: "年份"
    rating: "评分"
    status:
      reading: "正在阅读"
      finished: "已读"
      queued: "想读"
      watching: "正在观看"
      watched: "已看"
      watchlist: "想看"
      paused: "暂停"
      abandoned: "已放弃"
```

注意：`i18n.yml` 的 `en` 和 `zh` 顶级键不能重复定义。应将上述 `media` 节点合并到现有语言节点中。

## 13.8 新建 `_layouts/media-shelf.liquid`

建议结构：

```liquid
---
layout: page
---

{% assign current_lang = page.lang | default: site.active_lang | default: site.default_lang %}
{% assign t = site.data.i18n[current_lang] | default: site.data.i18n.en %}

{{ content }}

<section class="media-section" aria-labelledby="books-title">
  <h2 id="books-title">{{ t.media.books_title }}</h2>
  {% include media-shelf-section.liquid
    items=site.books
    type="book"
    empty_text=t.media.empty_books
    current_lang=current_lang
  %}
</section>

<section class="media-section" aria-labelledby="movies-title">
  <h2 id="movies-title">{{ t.media.movies_title }}</h2>
  {% include media-shelf-section.liquid
    items=site.movies
    type="movie"
    empty_text=t.media.empty_movies
    current_lang=current_lang
  %}
</section>
```

## 13.9 新建 `_includes/media-shelf-section.liquid`

渲染要求：

- 使用 CSS Grid；
- 根据 `started`、`finished` 或 `watched_on` 排序；
- 根据当前语言选择 `title` 或 `title_zh`；
- 根据当前语言选择 `creator` 或 `creator_zh`；
- 显示封面、标题、作者/导演、年份、状态和评分；
- 缺少评分时不要显示空星；
- 缺少图片时显示统一占位卡片；
- `external_url` 存在时整张卡片可点击；
- 外链使用 `target="_blank"` 和 `rel="noopener noreferrer"`；
- 图片必须有有效 `alt`；
- 不依赖运行时 API；
- 不使用 TMDB API Key；
- 不在构建时抓取第三方海报。

## 13.10 Media 样式

加入 `_sass/_custom.scss`：

```scss
.media-section {
  margin-top: 2.5rem;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.25rem;
}

.media-card {
  overflow: hidden;
  border: 1px solid var(--global-divider-color);
  border-radius: 0.9rem;
  background: var(--global-card-bg-color);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.media-card:hover {
  transform: translateY(-4px);
  border-color: var(--global-theme-color);
  box-shadow: 0 12px 26px rgba(31, 111, 174, 0.14);
}

.media-card__cover {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  background: #eaf6ff;
}

.media-card__body {
  padding: 0.85rem;
}

.media-card__title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.35;
}

.media-card__meta {
  margin-top: 0.35rem;
  color: var(--global-text-color-light);
  font-size: 0.86rem;
}

.media-card__status {
  display: inline-flex;
  margin-top: 0.65rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  color: var(--global-theme-color);
  background: #eaf6ff;
  font-size: 0.78rem;
}

@media (max-width: 480px) {
  .media-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
  }
}
```

深色模式下应覆盖浅蓝 Badge 背景：

```scss
html[data-theme="dark"] .media-card__status {
  background: rgba(100, 181, 246, 0.14);
}
```

---

## 14. 导航顺序

建议：

```yaml
Repositories: nav_order: 1
CV:           nav_order: 2
Media:        nav_order: 3
```

About 为首页，一般不需要 `nav_order`。

同步更新英文和中文页面，保证顺序一致。

注意：当前 WiseZenn 的 Blog、Repositories、Courses、CV、Bookshelf 使用旧顺序。隐藏 Blog 和 Courses 后应重新编号，避免留下不连续但难以理解的排序。

---

## 15. 中英文功能验收

Codex 必须验证以下路径：

```text
/
 /zh/
 /repositories/
 /zh/repositories/
 /cv/
 /zh/cv/
 /media/
 /zh/media/
```

验证项目：

1. 英文页面显示“中文”切换；
2. 中文页面显示“EN”切换；
3. 语言切换后进入对应页面，而不是总回到首页；
4. About、Repositories、CV、Media 的 `lang-ref` 成对一致；
5. 英文页面不混入中文导航；
6. 中文页面不混入英文导航；
7. Media 页面标题、空状态和状态标签会翻译；
8. 头像和二维码资源在两个语言路径下均可加载；
9. `/zh/` 下的相对链接没有重复 `/zh/zh/`；
10. 页面刷新后路由仍正常。

---

## 16. SEO 和站点清理

修改：

```text
robots.txt
_config.yml
README.md
```

建议：

- 更新站点标题和描述；
- 更新关键词；
- 更新 favicon；
- 更新 Open Graph 图片；
- 删除 WiseZenn 的个人邮箱和身份描述；
- 删除无关示例论文、项目、News 和课程内容；
- 清理不属于自己的图片和 PDF；
- 保留 LICENSE；
- README 中注明项目源于 al-folio，并参考 WiseZenn 的定制版本。

执行检查：

```bash
git grep -n -i "wisezenn"
git grep -n -i "southern university"
git grep -n -i "sustech"
```

除 LICENSE、README 致谢或历史说明外，不应残留原作者个人信息。

---

## 17. 部署方案

### 17.1 GitHub 仓库设置

仓库名称：

```text
<YOUR_GITHUB_USERNAME>.github.io
```

确认：

```text
Settings → Actions → General → Workflow permissions
```

启用必要的读写权限。

### 17.2 Pages 设置

根据仓库现有部署工作流确认：

```text
Source branch: main
Publish branch/worktree: gh-pages
```

不要直接编辑 `gh-pages` 生成文件。

### 17.3 部署前检查

```bash
docker compose run --rm jekyll bundle exec jekyll build
git status
```

确认：

- 构建无错误；
- 没有提交 `.jekyll-cache`；
- 没有提交 `_site`；
- 没有提交个人隐私文件；
- GitHub Actions 成功；
- Pages URL 能打开；
- 手机端正常。

---

## 18. 验收标准

## 18.1 视觉

- 页面整体呈浅蓝色调；
- 正文与背景对比清晰；
- 所有链接和 Hover 使用统一蓝色；
- 深色模式不出现白底刺眼组件；
- 卡片和导航风格一致；
- 头像不变形；
- 移动端不横向溢出。

## 18.2 About

- 头像在姓名旁边；
- 手机端合理堆叠；
- 首页无 Latest Posts；
- 联系图标只有邮箱、GitHub、微信、QQ；
- 图标顺序正确；
- 微信和 QQ 弹窗都可独立打开、关闭和扫码；
- Escape 可关闭弹窗。

## 18.3 导航

- Blog 和 Courses 不显示；
- Repositories、CV、Books & Movies 显示；
- 中英文顺序一致；
- 语言切换正确。

## 18.4 Repositories

- 展示的是用户自己的仓库；
- 没有 WiseZenn 仓库；
- 卡片数据加载正常；
- 外链可访问。

## 18.5 CV

- 页面布局没有被破坏；
- 中英文数据对应；
- PDF 下载正确；
- 不再使用 `CV_Blog.pdf`。

## 18.6 Books & Movies

- 同一页面包含两个清晰区域；
- 两个区域分别有独立标题；
- 中英文标题和状态正确；
- 封面比例统一；
- 没有数据时有友好空状态；
- 移动端至少保持两列或无严重拥挤。

## 18.7 构建

- Docker 本地运行成功；
- Jekyll build 成功；
- 无 Liquid 错误；
- 无明显 404；
- GitHub Actions 部署成功。

---

## 19. 建议的实施顺序

Codex 应严格按以下顺序执行：

1. 建立基线并运行原项目；
2. 修改全局身份和 URL；
3. 清理原作者内容；
4. 隐藏博客和课程；
5. 添加浅蓝主题；
6. 重构 About Hero；
7. 重构微信/QQ 通用二维码弹窗；
8. 更新 Repositories；
9. 更新 CV；
10. 创建 Books & Movies 页面；
11. 增加 Movies 集合和媒体卡片；
12. 补全中英文文案；
13. 执行构建和结构验证；
14. 检查全部双语路由；
15. 检查移动端；
16. 部署到 GitHub Pages。

不要在第 1 次提交中同时修改所有功能。

---

## 20. 可直接交给 Codex 的任务说明

```text
请基于当前仓库完成个人主页定制，参考根目录中的开发方案文档。

目标：
1. 将网站整体改为低饱和浅蓝色主题，同时保留可用的深色模式。
2. About/关于页面中头像必须和姓名标题处于同一个 Hero 区域；移动端响应式堆叠。
3. About 页面联系图标只保留 Email、GitHub、WeChat、QQ，顺序固定。
4. 将现有微信二维码专用弹窗重构为可复用的二维码弹窗，支持微信和 QQ，支持遮罩、关闭按钮和 Escape 关闭，不覆盖 window.onclick。
5. Blog 和 Courses 采用软隐藏：从导航、首页和搜索移除，但保留源代码。
6. Repositories 页面沿用现有卡片组件，只替换用户和仓库数据。
7. CV 页面结构不重构，只替换双语数据和 PDF 路径。
8. 将 Bookshelf 改成双语 Books & Movies / 书籍与电影页面，并分成 Books 与 Movies 两个区域。
9. 新增 movies 集合和通用媒体卡片组件；所有页面保持中英文 lang-ref 配对。
10. 修改后运行 Docker/Jekyll 构建、结构验证和关键路由检查。

开发要求：
- 优先在 _sass/_custom.scss 中完成样式覆盖；
- 不修改生成后的 _site 或 gh-pages 文件；
- 不删除 Blog/Courses 代码；
- 不残留 WiseZenn 的个人邮箱、学校、简介、仓库或 PDF；
- 保留 MIT License 和合理致谢；
- 使用语义化 HTML；
- 所有图片有 alt；
- 外链使用 rel="noopener noreferrer"；
- 二维码弹窗具备基本可访问性；
- 变更按功能拆分提交；
- 若计划中的示例代码与仓库实际结构冲突，以仓库实际结构为准，并在最终总结中说明调整原因。

完成后输出：
1. 修改文件清单；
2. 每个功能的实现说明；
3. 构建和测试结果；
4. 尚需用户提供的资料清单；
5. 部署前注意事项。
```

---

## 21. 开始开发前需要准备的资料

请提前准备并交给 Codex：

```text
GitHub 用户名：
英文姓名：
中文姓名：
英文个人简介：
中文个人简介：
邮箱：
微信二维码文件：
QQ 二维码文件：
头像文件：
CV 英文数据：
CV 中文数据：
CV PDF：
想展示的 GitHub 仓库列表：
书籍列表：
电影列表：
网站标题：
网站描述：
默认语言偏好：
```

未提供的字段应使用明显占位符，不要让 Codex 自行编造个人经历或联系方式。

---

## 22. 关键参考文件

```text
_config.yml
_pages/about.md
_pages/about_zh.md
_layouts/about.liquid
_data/socials.yml
_includes/footer.liquid
_includes/scripts.liquid
assets/js/wechat.js
_sass/_components.scss
_sass/_themes.scss
_sass/_custom.scss
assets/css/main.scss
_pages/blog.md
_pages/blog_zh.md
_pages/courses.md
_pages/courses_zh.md
_pages/repositories.md
_pages/repositories_zh.md
_data/repositories.yml
_pages/cv.md
_pages/cv_zh.md
_data/cv.yml
_data/cv_zh.yml
_pages/books.md
_pages/books_zh.md
_layouts/book-shelf.liquid
_data/i18n.yml
docker-compose.yml
scripts/validate_structure.ps1
```

---

## 23. 风险与注意事项

1. **不要复制原作者个人数据**  
   模板代码可在 MIT License 下使用，但个人简介、照片、二维码、简历、文章和项目数据必须替换或删除。

2. **二维码弹窗当前是微信专用实现**  
   直接复制一份 QQ 代码会形成重复逻辑，应改成通用组件。

3. **默认头像布局不满足“姓名旁边”**  
   仅取消 `profile` 注释只能让头像浮动在正文旁边，必须修改 `about.liquid`。

4. **浅蓝背景不能配过浅文字**  
   链接和正文要保持足够对比度，浅蓝主要用于背景、边框和装饰。

5. **软隐藏不等于彻底删除 URL**  
   Blog/Courses 页面可能仍能通过直接 URL 访问。若后续要求完全不可访问，再将页面设为 `published: false` 或调整构建排除规则。

6. **电影海报存在图片版权问题**  
   建议使用低分辨率展示图、官方宣传图链接或自己有权使用的图片，不要批量抓取未知来源图片。

7. **Polyglot 路由必须实测**  
   页面文件名、`lang`、`lang-ref` 和 `permalink` 的组合会影响 `/zh/` 路由，不能只检查英文页面。

8. **不要直接修改 gh-pages**  
   所有修改都在 `main` 源码完成，通过构建部署。

---

## 24. 完成定义

满足以下条件才视为完成：

```text
[ ] 页面主色为浅蓝
[ ] About 头像和姓名并列
[ ] 联系图标仅 Email/GitHub/WeChat/QQ
[ ] 微信与 QQ 二维码弹窗可用
[ ] Blog 和 Courses 不出现在导航、首页、搜索
[ ] Repositories 展示用户仓库
[ ] CV 页面保留原结构
[ ] Books & Movies 分为两个区域
[ ] 中英文页面全部配对
[ ] 桌面端与移动端显示正常
[ ] 本地 Jekyll 构建通过
[ ] GitHub Actions 部署通过
[ ] 无 WiseZenn 私人信息残留
[ ] LICENSE 和致谢保留
```
