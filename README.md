# Suihan-shu 个人主页与数字空间

> 何岁寒（Suihan-shu）的现代化中文个人主页与专属内容发布系统。基于 Jekyll 与 GitHub Pages 构建，采用响应式布局，支持全自动极速 CI/CD 构建部署。

---

## 🌟 网站核心板块

* **关于我 (`/`)**：个人简介、研究方向（西北工业大学航空工程研究生，电磁加载技术工程应用）及动态展示。
* **个人简历 (`/cv/`)**：简洁美观的结构化履历：
  * **基本信息**：姓名、专业、邮箱、电话、现居地
  * **教育经历**：西北工业大学（硕士）、长安大学（学士，专业排名 2/72）
  * **项目经历**：`HomestayManager-PWA` 离线房态管理等开源项目
  * **获奖经历**：全国大学生数学建模竞赛一等奖、中国大学生物理实验竞赛一等奖等
  * **专业技能**：机械工程与仿真、办公工具、AI 辅助与实用技术
  * **兴趣爱好**：户外运动、电竞与日常爱好
  * **语言能力**：中文母语、英语 CET-4 / CET-6
* **旅行日志 (`/travel/`)**：支持轻量前端密码保护的个人旅行足迹与相册画廊。
* **开源项目 (`/repositories/`)**：精选开源仓库与个人作品展示卡片。
* **专属管理后台 (`/admin/`)**：免代码、免语法的可视化内容管理平台。

---

## 🛠️ 内容管理与日常更新指南

您可以选择以下任意一种方式更新主页内容：

### 方式一：可视化管理后台（推荐，零代码门槛）
访问在线后台：[`https://suihan-shu.github.io/MyPage-suihan/admin/`](https://suihan-shu.github.io/MyPage-suihan/admin/)
1. 输入您的 GitHub Personal Access Token（具备 `repo` 权限即可，仅保存在本地浏览器中）；
2. 在表单中可视化编辑简历、添加/删除获奖经历、新增旅行日志并上传照片；
3. 点击 **保存并更新**，后台将通过 GitHub REST API 自动提交更改，触发自动部署。

### 方式二：直接编辑数据文件
主页核心内容与结构均存放于 `_data/` 目录中：
* `_data/cv.yml`：简历数据（包含联系方式、副标题、教育经历、项目经历、获奖经历、技能、爱好与语言）
* `_data/travel.yml`：旅行日志条目与前端访问密码
* `_data/repositories.yml`：展示的 GitHub 开源仓库列表
* `_pages/about.md`：首页个人简介内容

---

## ⚡ 极速自动化部署

本项目针对 GitHub Actions 部署流程进行了深度优化：
* 移除了卡顿的镜像源更新步骤；
* 代码推送到 `main` 分支后，GitHub Actions 会在 **约 30 秒内** 极速完成构建并上线 GitHub Pages。

---

## 💻 本地预览与开发

### 使用 Docker（推荐）
```bash
# 启动本地预览服务
docker compose up

# 浏览器访问
http://localhost:8040
```

### 正式静态构建
```bash
docker compose run --rm jekyll bundle exec jekyll build
```

---

## 📄 许可证

本项目基于 [al-folio](https://github.com/alshedivat/al-folio) 主题二次定制开发，遵循 [MIT License](LICENSE)。

## 开发检查

修改后运行 `./scripts/validate_structure.ps1` 与 `npm test`。页面或模板修改还应执行 Docker 构建，再运行 `npm run test:browser`。

[项目审查、维护约定与回归验证说明](docs/MAINTENANCE_RUNBOOK.md)。
