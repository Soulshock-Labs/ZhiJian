# 小纸笺 Trello 工作计划

> 日期：2026-05-01
> 用途：复制到 Trello，或按清单建成看板。

## 看板名称

小纸笺 · 两小时冲刺与近期主线

## List 1：今天两小时

- [x] 对齐工作台设计系统：TopNav 56px、SideNav 220px、头像 32px
- [x] 收敛首页未完成入口：主视觉只突出生成本周周计划
- [x] 替换 www.zhijian.me 浏览器 favicon / 收藏夹缩略图
- [x] 部署工作台到 Vercel production
- [x] 部署官网到 Vercel production
- [ ] 修复本地开发环境：用 Node 24 / 非 Dropbox 工作区跑 Next dev
- [ ] 明确个人 AI 工具用量面板的数据来源
- [ ] 对接 Trello API：准备 API Key / Token 后自动建板建卡
- [ ] 休息

## List 2：主闭环

- [ ] 周计划生成结果保存到历史
- [ ] 从周计划选择某一天生成日教案
- [ ] 日教案导出 Word
- [ ] 最近生成支持查看、复制、重新生成、下载

## List 3：数据地基

- [ ] 设计 PostgreSQL / Supabase 初始表
- [ ] 迁移用户、兑换码、生成历史
- [ ] 为每次 AI 生成记录耗时、模型、成功/失败、用户、导出次数

## List 4：质感与内容

- [ ] 完成 10 个高质量模板
- [ ] 梳理模板分类：年龄段、领域、主题
- [ ] 知识库上传后影响生成内容
- [ ] 最终成品阶段交给 Claude Code Design / Open Design 做设计还原度检查
- [ ] 建立规则：Codex 做工程闭环，Claude Design 只在最终 UI polish 阶段介入

## List 5：个人 AI 用量面板

- [ ] Codex / OpenAI：确认是否有可用 Usage API 或账单导出
- [ ] Claude Code：确认 Anthropic Console / Plan 用量来源
- [ ] Gemini CLI：确认 Google AI Studio 或 Cloud Billing 来源
- [ ] Kimi / DeepSeek：确认开放平台余额和调用量 API
- [ ] 设计统一字段：工具、额度、已用、剩余、刷新时间、来源、备注
- [ ] 做第一版网页面板：先支持手动录入 + 后续接 API
