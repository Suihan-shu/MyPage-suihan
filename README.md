# Suihan-shu

Suihan-shu（何岁寒）的中文个人主页，使用 Jekyll、al-folio、jekyll-polyglot 和 Sass 构建。

## Local development

```bash
docker compose up
```

Open <http://localhost:8040>.

Production build:

```bash
docker compose run --rm jekyll bundle exec jekyll build
```

Structure audit on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate_structure.ps1
```

## Active navigation

- 关于
- 代码库
- 简历
- 书籍与电影
- 旅行日志（密码保护）

Blog and Courses remain in the source tree but are soft-hidden from navigation, the home page, and search.

Books and Movies are intentionally empty until entries and legally usable covers are added under `_books/`, `_movies/`, and `assets/img/media/`.

## Travel journal

The Travel Journal uses a lightweight front-end password gate. Set the password and add entries in [_data/travel.yml](_data/travel.yml), then place photos under `assets/img/travel/`. See [docs/TRAVEL_LOG.md](docs/TRAVEL_LOG.md) for the entry format. This is only a casual privacy gate; it is not server-side access control.

## Credits and license

This project uses the [al-folio](https://github.com/alshedivat/al-folio) theme and was customized with reference to [WiseZenn/wisezenn.github.io](https://github.com/WiseZenn/wisezenn.github.io). Powered by Jekyll and designed for GitHub Pages.

The original MIT License is retained in [LICENSE](LICENSE).
