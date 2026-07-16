# AI 任务需求提示词（轻量模板）

用途：
本模板用于小型日常改动，尤其适合不新增功能的样式微调。

边界：
本文件只描述本次任务需求。全局 AI 行为规则请放在 `docs/prompt/AI_CHANGE_PROMPT.md`。

适用场景：
1. 调整间距、字体、字重、颜色、悬浮效果或宽度。
2. 不改变架构与核心功能行为。

---

## 模板 - 小型日常改动

任务标题：
- [必填] 一句话概述

变更类型：
- [必填] style-only / copy-only / minor behavior tweak

目标范围：
- [必填] 影响的文件与页面

改动需求：
1. [必填] 要改什么
2. [必填] 预期视觉或行为结果

约束条件：
- [必填] 必须保持不变的内容
- [必填] 回归敏感页面（例如 CV、repositories、blog post）

验收标准：
1. [必填] 视觉或行为检查标准
2. [必填] 指定页面无回归

必做校验：
1. 运行 scripts/validate_structure.ps1
2. 若改动了 layout/include/script，运行完整 Jekyll 构建：
   - docker compose run --rm jekyll bash -c "bundle exec jekyll build --config _config.yml"

AI 最终输出格式：
1. 修改文件
2. 修改原因
3. 校验结果
4. 风险（如有）

---

## 快速示例

任务标题：
- 轻微降低系列卡片标题字重

变更类型：
- style-only

目标范围：
- _sass/_custom.scss
- 仅 blog index 的系列卡片

改动需求：
1. 将系列卡片标题字重从 530 调整为 500。
2. 保持分区标题字重不变。

约束条件：
- 不影响 repository 卡片排版。
- 不影响 navbar 排版。

验收标准：
1. 系列卡片标题视觉上更轻。
2. Repositories 页面与 navbar 观感不变。
