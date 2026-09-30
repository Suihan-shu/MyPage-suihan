# 电影管理工具

推荐从网站 `/admin/` 登录原有后台，点击“电影管理”。选片、个人记录、卡片预览、海报上传和历史恢复都已集成，保存会直接同步至 GitHub 并触发网站部署。

首次在后台连接 TMDB：在电影资料连接区粘贴 API 读访问令牌，或选择本目录的 `.env` 文件导入，再点击“连接 TMDB”。默认仅在当前页面会话中使用；勾选“在当前浏览器记住令牌”后，刷新或下次打开仍可使用。退出后台会清除 TMDB 和 GitHub 凭据。这里需要 TMDB 读取令牌，GitHub Token 仍在原有后台登录处填写。

本机工具继续保留，适合离线维护项目文件。后台与本机工具共用编辑器和数据校验。后台保存不会自动改动电脑上的仓库文件；重新使用本机工具或推送本地修改前先同步远端，避免覆盖在线编辑。已有未提交本地修改时先保留它们再同步，不要直接覆盖。

公开电影页面位于 `/movies/`，本机管理工具只监听 `127.0.0.1`。需要 Node.js 24；本项目已有 Puppeteer，上传及缓存海报时使用本机 Chrome / Edge（或 Puppeteer 浏览器）实际解码图片。

## 启动

在项目根目录执行 `npm.cmd install`（首次安装依赖时），然后执行：

```powershell
npm.cmd run movies
```

也可双击本目录的 `启动电影管理.cmd`。在浏览器打开终端显示的 `http://127.0.0.1:4317`，保持终端运行；按 Ctrl+C 关闭。请使用这个地址，不能换为 localhost。端口被占用时在配置中更改。

## 配置 TMDB

从 [TMDB 账号的 API 设置](https://www.themoviedb.org/settings/api) 申请凭据。复制 `.env.example` 为本目录 `.env`，填写 `TMDB_READ_ACCESS_TOKEN`（API Read Access Token）或 `TMDB_API_KEY`，任选一种。也可使用同名环境变量。配置只由本机服务读取，变更后重启工具。

`.env` 已被 Git 忽略；整个 `tools/` 不进入网站产物。不要把凭据填进电影表单或分享截图。未配置时手动添加、编辑、删除和恢复仍可用。

## 添加、编辑与换图

1. 搜索中文或英文片名，可填写上映年份；从候选中选择正确版本。也支持直接输入 TMDB ID。
2. 填写观影日期、个人评分、短评和标签。评分留空表示未评分，支持 0–10 分、0.5 分步长，0 分也是真实评分。
3. 检查卡片预览并保存。已有 TMDB ID 会打开原记录；服务端也会阻止重复。
4. 自动资料的手工修改保存在 `overrides`；点击“清除人工修订”恢复源资料。“预览资料更新”先显示差异，采用后保留个人记录和人工修订，需再次保存。
5. 可选择其他 TMDB 海报，或上传 JPG / PNG / WebP（最大 8 MB、4000 万像素）。海报缓存默认关闭，启用后下载失败会阻止本次保存并保留表单，可关闭缓存重试。上传图片会提前保存至海报目录；未提交表单的图片不会自动删除。

源数据缺失时留空，不会自动编造简介或人物中文名。公开 TMDB 分数为获取时的快照，手动记录不伪造 TMDB 分数。

## 保存、恢复与发布

记录保存至 `_data/movies.json`，本地海报保存至 `assets/img/movies/`。每次保存、删除、恢复前，将上一份有效 JSON 保存在本目录 `backups/`。可直接在工具中选择备份恢复整份列表；恢复前同样会备份当前数据。不要删除备份引用的海报。

服务按顺序写入，并使用临时文件替换正式数据；发现其他窗口或外部编辑修改数据时会拒绝覆盖。保留表单后自行复制需要的内容，再重新读取并编辑。服务进程使用 `.lock` 避免同时运行两个实例，异常退出后下次启动会检查并清理失效的锁。

本地保存不会上线。预览：启动 Docker Desktop，再执行 `./scripts/build.ps1 -Serve`，打开 `http://localhost:8040/MyPage-suihan/movies/`。发布沿用原有 Git 提交、推送与 GitHub Pages 工作流；需要提交数据、海报和代码，不能提交 `.env`、备份或 `.lock`。

若 Docker 无法启动，本次开发已在项目内准备了被 Git 忽略的 Ruby 依赖与便携 ImageMagick。当前电脑可在项目根目录的 PowerShell 中使用以下备用方式（仅设置当前终端环境，不改变系统配置）：

```powershell
$env:BUNDLE_PATH = Join-Path $PWD 'vendor/bundle'
$env:PATH = (Join-Path $PWD 'vendor/imagemagick') + ';' + $env:PATH
bundle exec jekyll serve --host 127.0.0.1 --port 8041 --destination _site/movie-review
```

打开 `http://127.0.0.1:8041/MyPage-suihan/movies/`。Jekyll 会监听数据变更并重新构建；GitHub Pages 发布继续使用原有工作流。其他电脑需要自行准备 Ruby 依赖与 ImageMagick，不能假定 vendor 目录随仓库分发。

## 故障排查

- 搜索失败：检查凭据和实际网络，换原名、年份或 ID；失败后表单仍保留。
- 图片下载失败：取消缓存后保存，或上传本机图片；已有记录继续展示。
- 图片解码失败：确认项目依赖、本机 Chrome / Edge 或 Puppeteer 浏览器可用。
- 启动失败：检查 JSON 是否被手工改坏、端口是否被占用、是否已有管理工具运行。不要通过删除运行中的锁文件强行启动。
- 访问令牌失效：刷新管理页面。每次重启都会生成新的会话令牌。

TMDB 来源标注依据 [官方 FAQ](https://developer.themoviedb.org/docs/faq)。本工具包含官方标志和要求的英文声明。
