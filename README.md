# Suihan-shu

Suihan-shu（何岁寒）的中文个人主页，使用 Jekyll、al-folio 和 Sass 构建。

## 本地预览

```bash
docker compose up
```

浏览器打开 <http://localhost:8040>。

正式构建：

```bash
docker compose run --rm jekyll bundle exec jekyll build
```

Windows 结构检查：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate_structure.ps1
```

## 当前导航

- 关于
- 代码库
- 简历
- 书籍与电影
- 旅行日志（密码保护）

书籍与电影暂时为空，后续可在 `_books/`、`_movies/` 和 `assets/img/media/` 中添加条目及合法使用的封面。

## 旅行日志

旅行日志使用轻量的前端密码校验。在 `_data/travel.yml` 中设置密码并添加记录，照片放在 `assets/img/travel/`。字段格式见 [旅行日志说明](docs/TRAVEL_LOG.md)。前端密码只能阻止普通访问，不能替代服务器端访问控制。

## 致谢与许可

本项目基于 [al-folio](https://github.com/alshedivat/al-folio) 主题，并参考 [WiseZenn/wisezenn.github.io](https://github.com/WiseZenn/wisezenn.github.io) 进行定制，通过 GitHub Pages 发布。

项目保留原始 [MIT 许可证](LICENSE)。
