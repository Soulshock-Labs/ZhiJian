# Smart Teacher Assistant Memory

> 目的：持续记录重要对话决策，保证跨设备、跨时间都能快速恢复上下文。

---

## 记忆系统结构

- `MEMORY.md`
  记录项目的重要决策、方向、版本变化、待办优先级。
- [docs/ENGINEERING_PREFLIGHT_CHECKLIST.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_PREFLIGHT_CHECKLIST.md)
  记录“先过检查单、后开发”的行为标准与跨平台守则。
- [docs/ENGINEERING_CHANGELOG.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_CHANGELOG.md)
  记录每次代码修改后的完成检查、改动范围与验证结果。
- `README.md`
  记录外部使用方式、接口、部署方法与项目说明。

建议顺序：

1. 先读 `MEMORY.md`
2. 再读 [docs/ENGINEERING_PREFLIGHT_CHECKLIST.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_PREFLIGHT_CHECKLIST.md)
3. 再读 [docs/ENGINEERING_CHANGELOG.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_CHANGELOG.md)
4. 再看当前代码与任务

---

## 使用规则

- 仅记录重要信息：架构决策、产品方向、接口变更、版本策略、待办优先级。
- 每次重要聊天后，新增一条记录，不覆盖旧记录。
- 记录采用统一模板，保持可检索、可追踪。
- 每周可做一次归档总结，但不删除原始条目。

---

## 记录模板（复制使用）

```md
### [YYYY-MM-DD HH:mm] 标题
- 来源：Cursor 对话 / 会议 / 需求讨论
- 结论：
  - ...
- 影响范围：
  - 前端：...
  - 后端：...
  - 文档：...
- 决策原因：
  - ...
- 下一步动作：
  - [ ] ...
  - [ ] ...
- 负责人：Ethan
```

---

## 对话记忆日志

### [2026-04-07 16:00] smart-teacher 架构拆分初版
- 来源：Cursor 对话
- 结论：
  - 产品拆分为两部分：`幼师日常`（现有主体）和 `园区工作台`（待开发）。
  - 入口策略不做重型双入口首页，采用页面内轻量切换更合适。
  - 默认落点保持在幼师日常，园区先做建设中占位。
- 影响范围：
  - 前端：新增模块切换 UI（幼师/园区）。
  - 后端：后续建议为园区能力预留独立路由前缀。
  - 文档：README 需补充架构分层与版本记录。
- 决策原因：
  - 降低当前改造成本，减少一线老师学习成本，保留后续扩展空间。
- 下一步动作：
  - [ ] 设计顶部轻量切换交互（不打断现有流程）。
  - [ ] 建立园区占位页与功能路线图。
  - [ ] 启动版本号策略（建议从 `v0.1.0` 开始）。
- 负责人：Ethan

### [2026-04-07 17:40] To B / To C 双端框架落地 v1.1.0
- 来源：Cursor 对话
- 结论：
  - P0 已补齐接口：`/generate-term-plan`（园部学期/月/周骨架）、`/apply-daily-feedback`（日计划反馈回流周计划）。
  - 新增 `/roadmap` 统一输出模块分期，前端结果页加入 To B / To C 切换看板。
  - 周日联动中加入“执行反馈回流周计划”表单，形成周→日→反馈→周闭环。
- 影响范围：
  - 前端：`index.html` 新增双端框架卡片、反馈回流交互与状态显示。
  - 后端：`main.py` 版本升级至 `1.1.0`，新增 3 个分层接口。
  - 文档：`README.md` 更新接口清单与 P0/P1/P2 路线图。
- 决策原因：
  - 先完成可演示且可迭代的 P0 闭环，同时让 P1/P2 具备明确入口和数据契约，降低后续扩展成本。
- 下一步动作：
  - [ ] 增加模块3“拍照观察”真实上传与结构化观察输出接口。
  - [ ] 落地模块4幼儿成长档案的字段模型与报告模板。
  - [ ] 将模块5场景引擎做成可配置场景库（园内/户外/节日）。
- 负责人：Ethan

### [2026-04-09 10:50] 建立“先预案、后开发”记忆系统
- 来源：Codex 对话
- 结论：
  - 项目正式建立工程行为预案，新增 [docs/ENGINEERING_PREFLIGHT_CHECKLIST.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_PREFLIGHT_CHECKLIST.md)。
  - 以后所有开发默认先执行：读记忆 -> 读预案 -> 看任务 -> 查代码 -> 开发 -> 验证 -> 记录。
  - 重点覆盖跨平台风险：Mac / Windows / 移动端 / Cloud Run / Dropbox 冲突副本。
- 影响范围：
  - 前端：遇到交互与移动端问题，先按预案排查。
  - 后端：遇到导出、接口、部署问题，先按预案留证据再处理。
  - 文档：README 需显式加入预案入口。
- 决策原因：
  - 最近项目同时涉及 Dropbox、GitHub、Cloud Run、自定义域名、多设备开发，若没有统一行为标准，容易重复踩坑。
- 下一步动作：
  - [ ] 在 README 增加“开发前先读”的入口说明。
  - [ ] 后续把部署清单和产品计划表继续补成标准格式。
  - [ ] 所有重大变更都回写到 MEMORY。
- 负责人：Ethan

### [2026-04-09 11:05] “工程行为预案”更名为“工程起飞检查单”
- 来源：Codex 对话
- 结论：
  - 文档主名从“工程行为预案”升级为“工程起飞检查单”。
  - 主文件路径改为 [docs/ENGINEERING_PREFLIGHT_CHECKLIST.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_PREFLIGHT_CHECKLIST.md)。
  - README 与 MEMORY 的入口命名同步更新，强化“先检查、后开发”的团队习惯。
- 影响范围：
  - 文档：入口名称、文件链接、开工口令统一更新。
  - 团队协作：以后把这份文档视为每天开工前的固定检查单，而不是普通说明文档。
- 决策原因：
  - “起飞检查单”比“预案”更有动作感和执行感，更像真正的工程守则。
- 下一步动作：
  - [ ] 继续补一份“项目计划表”模板。
  - [ ] 继续补一份“部署检查单”模板。
- 负责人：Ethan

### [2026-04-09 11:15] 建立“工程修改记录”与提交完成检查
- 来源：Codex 对话
- 结论：
  - 新增 [docs/ENGINEERING_CHANGELOG.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_CHANGELOG.md)，用于记录每次代码修改后的完成检查与验证结果。
  - [docs/ENGINEERING_PREFLIGHT_CHECKLIST.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_PREFLIGHT_CHECKLIST.md) 新增“每次代码修改后的完成提交检查”。
  - README 与 MEMORY 的阅读顺序同步增加“先读工程修改记录”。
- 影响范围：
  - 文档：形成“记忆 -> 检查单 -> 修改记录 -> 开发”的统一流程。
  - 团队协作：以后每次改代码都要求补记录，不靠口头传递。
- 决策原因：
  - 仅靠 Git 提交不足以还原改动背景、验证过程和上线状态，单独的工程记录更适合团队长期协作。
- 下一步动作：
  - [ ] 后续每次真实代码改动都追加到 `ENGINEERING_CHANGELOG.md`。
  - [ ] 再补一个“部署后回归检查”模板。
- 负责人：Ethan

### [2026-04-09 11:25] 完成检查后默认进入 GitHub 与 GCloud 流程
- 来源：Codex 对话
- 结论：
  - 项目新增一条执行规则：功能完成并通过检查后，默认进入 `GitHub 同步 -> GCloud 发布`。
  - 只有在半成品、存在未确认风险、或用户明确要求暂不发布时，才停止在本地。
- 影响范围：
  - 文档：起飞检查单、README、工程修改记录同步更新。
  - 协作流程：以后“完成”不只代表代码写完，也代表可以继续同步和部署。
- 决策原因：
  - 把“完成后是否提交、是否上线”从口头判断变成显式规则，减少犹豫和遗漏。
- 下一步动作：
  - [ ] 后续把“部署后回归检查”补充成独立模板。
  - [ ] 每次真实上线都在工程修改记录里补是否发布成功。
- 负责人：Ethan

### [2026-04-10 17:40] AI OS 与智能体普惠成为公司级方向
- 来源：会议讨论 / 录音纪要
- 结论：
  - 公司价值观进一步明确为：`让所有人都能沐浴 AI 智能体。`
  - 对未来形态的判断进一步明确为：`AI OS` 与 `无界面时代` 很快会到来。
  - 当前项目不应只被理解为幼教工具，而应被视为“面向普通人的 AI 入口”，幼教是当前切入场景，不是最终边界。
  - 公司命名与品牌表达后续都应围绕 `AI + 科技 + 时代感 + 历史感 + 普惠智能` 展开，避免过于文艺或过于垂直。
- 影响范围：
  - 产品：继续压缩主流程，强化“打开即用、少输入、快完成”的 AI 入口体验。
  - 品牌：公司名优先服务公司级战略，不只服务单一产品。
  - 记忆系统：会议纪要除长期结论回写 `MEMORY.md` 外，当日细节写入 `memory/2026-04-10.md`。
- 决策原因：
  - 团队已经从“做一个 AI 工具”升级为“搭建人人可进入的智能体入口”这一层认知。
- 下一步动作：
  - [ ] 持续收敛公司名，优先考虑既有科技感又能承接“智能体普惠”的表达。
  - [ ] 后续产品讨论默认参考 `AI OS / 无界面时代 / 普惠智能` 这三条主线。
  - [ ] 会议纪要和命名推导继续沉淀到企业记忆系统中。
- 负责人：Ethan

### [2026-04-12 13:58] 小程序开发态默认先连本机后端
- 来源：Codex 排查微信开发者工具超时
- 结论：
  - 小程序开发态不再只盯着 Google Cloud Run；在 `devtools` 中优先尝试本机 `127.0.0.1:8000`，失败后再回退云端。
  - 请求、上传、下载三条链路统一补了超时和更可读的错误归一化，避免“整个小程序像死掉了，但看不出为什么”。
  - 工作台状态区会直接告诉当前连接的是本机还是云端，方便快速判断问题在网络还是代码。
  - 语音输入仍然保留，因此 `app.json` 里的 `scope.record` 权限说明需要继续保留。
- 影响范围：
  - 小程序前端：开发联调体验明显改善，尤其适合国内网络或 Cloud Run 不稳定的场景。
  - 后端：本地 `python main.py` 仍然是最稳的开发联调入口。
  - 排障：后续先看工作台的连接状态，再决定查本地服务还是云端网络。
- 决策原因：
  - 仓库文档与本次截图都指向同一类问题：云端域名在当前环境容易超时，导致前端表面上像“全坏了”。
- 下一步动作：
  - [ ] 在微信开发者工具里确认“已关闭合法域名校验”或已配置本机可访问地址。
  - [ ] 如需真机调试，再补一套可切换的局域网 / 内网穿透地址方案。
- 负责人：Ethan

### [2026-04-12 21:40] 手机端生成统一回到云端 `/generate`
- 来源：Codex 对话
- 结论：
  - 手机端生成流程不再依赖未发布的 `/generate-mini`，统一改为调用云端主接口 `/generate`。
  - 后端在 `client=mini` 时返回 `file_base64`，小程序本地写文件后直接 `openDocument`，减少二次下载失败。
  - 当前真机报错的根因不是登录授权，而是云端 `run.app` 发布版本和小程序调用接口未同步。
- 影响范围：
  - 小程序：生成链路更稳，但要求云端 revision 必须包含这版 `/generate` 的 `client=mini` 分支。
  - 后端：`/generate` 需要重新部署到 Cloud Run，Swagger 里要能看到最新参数与行为。
  - 排障：优先看云端 Swagger 是否存在 `/generate` 的最新版本，而不是先怀疑手机或模板上传。
- 决策原因：
  - 用户明确要求“不要本地，只走云端”，所以手机端应尽量复用已有正式接口，而不是再引入一条新链路。
- 下一步动作：
  - [ ] 重新部署 Cloud Run，让 `/generate` 的 `client=mini` 分支上线。
  - [ ] 真机重新验证“上传模板 -> 生成 -> 打开 Word”的完整闭环。
  - [ ] 如后续需要登录授权，再单独设计用户身份与权限层。
- 负责人：Ethan
