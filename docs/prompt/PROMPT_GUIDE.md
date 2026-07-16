# Prompt 文档说明

本目录仅用于 AI 协作输入，不用于业务内容存放。

## 职责边界

1. `AI_CHANGE_PROMPT.md`
   - 用途：定义 AI 代理的全局行为规则。
   - 包含：流程规范、边界约束、校验与汇报要求。
   - 不包含：某一次具体改动的任务细节。
2. `templates/TASK_REQUEST_TEMPLATE_*.md`
   - 用途：描述某一次具体任务的需求表单。
   - 包含：范围、约束、验收标准、输出要求。
   - 不包含：应放在 `AI_CHANGE_PROMPT.md` 中的全局行为规则。

## 推荐使用顺序

1. 先提供 `AI_CHANGE_PROMPT.md`。
2. 再填写 `templates/` 下的一份任务模板。
3. 在同一会话中同时提交给 AI 助手。