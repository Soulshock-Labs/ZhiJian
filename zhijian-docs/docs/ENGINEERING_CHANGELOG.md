# 纸笺 · 工程修改记录

> 目的：每次代码修改后，留下可追溯的工程记录。这里不替代 Git 提交，而是补充“为什么改、怎么验证、是否上线”的上下文。

---

## 使用规则

- 每次有实际代码、文档、配置改动，都追加一条，不覆盖旧记录。
- 先完成代码修改，再写记录。
- 记录尽量简短，但必须能让后来的人看懂。
- 如果只是临时探索、没有形成有效改动，可以不记。

---

## 记录模板

```md
### [YYYY-MM-DD HH:mm] 标题
- 类型：feat / fix / docs / chore
- 目标：
  - ...
- 修改文件：
  - `index.html`
  - `main.py`
- 完成检查：
  - [x] 已做本地验证
  - [x] 已看 git diff
  - [x] 已评估跨平台影响
  - [x] 已同步文档
- 结果：
  - ...
- 是否上线：
  - 已上线 / 未上线
- 备注：
  - ...
```

---

## 修改记录

### [2026-04-12 21:40] 手机端统一改走云端 `/generate`
- 类型：fix
- 目标：
  - 让小程序手机端不再依赖未发布的 `/generate-mini`，统一调用云端已存在的 `/generate`。
  - 降低手机端“生成成功但前端拿不到文件”的概率，改为后端返回 `file_base64` 供小程序本地写文件。
- 修改文件：
  - `main.py`
  - `mini-program/pages/workbench/workbench.js`
  - `mini-program/utils/request.js`
  - `docs/ENGINEERING_CHANGELOG.md`
  - `MEMORY.md`
- 完成检查：
  - [x] 已做本地验证
  - [x] 已看 git diff
  - [x] 已评估跨平台影响
  - [x] 已同步文档
- 结果：
  - `POST /generate` 新增 `client=mini` 分支，手机端返回 JSON 文件内容。
  - 小程序优先把 `file_base64` 写成本地 `.docx`，避免再走二次下载。
  - 生成失败时保留更明确的弹窗提示，便于区分云端 404 与模板/内容错误。
- 是否上线：
  - 未上线
- 备注：
  - 当前手机端仍需要云端重新部署后才能真正生效；本次代码已对齐，但线上 revision 还需更新。

### [2026-04-12 13:58] 修复小程序开发态连接超时与诊断缺失
- 类型：fix
- 目标：
  - 避免微信开发者工具里默认直连 Google Cloud Run 导致首页/工作台频繁超时。
  - 给小程序请求链路补上更快的失败反馈和更清楚的连通性提示。
- 修改文件：
  - `mini-program/app.json`
  - `mini-program/utils/config.js`
  - `mini-program/utils/request.js`
  - `mini-program/pages/workbench/workbench.js`
  - `mini-program/pages/workbench/workbench.wxml`
  - `mini-program/pages/workbench/workbench.wxss`
  - `docs/ENGINEERING_CHANGELOG.md`
  - `MEMORY.md`
- 完成检查：
  - [x] 已做本地验证
  - [x] 已看 git diff
  - [x] 已评估跨平台影响
  - [x] 已同步文档
- 结果：
  - 小程序开发态会优先尝试本机 `127.0.0.1:8000`，失败后再回退云端 `run.app`。
  - `request` / `uploadFile` / `downloadFile` 增加了超时与重试顺序，失败提示更接近真实原因。
  - 工作台页会直接显示当前连接的是本机还是云端，并保留后端不可达提示。
  - 恢复了 `scope.record` 权限说明，避免语音输入链路退化。
- 是否上线：
  - 未上线
- 备注：
  - 本次没有改后端生成逻辑，重点是先把开发态和排障体验拉回可控状态。

### [2026-04-09 11:15] 建立工程修改记录制度
- 类型：docs
- 目标：
  - 给项目补齐“每次代码修改后的完成提交检查”。
  - 建立一份单独的工程修改记录，避免改动只有 Git 没有上下文。
- 修改文件：
  - `docs/ENGINEERING_PREFLIGHT_CHECKLIST.md`
  - `docs/ENGINEERING_CHANGELOG.md`
  - `README.md`
  - `MEMORY.md`
- 完成检查：
  - [x] 已做本地验证
  - [x] 已看 git diff
  - [x] 已评估跨平台影响
  - [x] 已同步文档
- 结果：
  - 项目新增“改完代码后必须补检查、补记录”的标准动作。
  - 以后团队可以先看起飞检查单，再看工程修改记录，再决定是否继续开发或部署。
- 是否上线：
  - 未上线
- 备注：
  - 这份记录主要面向团队协作与跨设备恢复上下文。

### [2026-04-09 11:25] 明确“完成后默认提交 GitHub 与 GCloud”规则
- 类型：docs
- 目标：
  - 把“改动完成后即可进入 GitHub 与 GCloud 流程”写成正式规则。
- 修改文件：
  - `docs/ENGINEERING_PREFLIGHT_CHECKLIST.md`
  - `docs/ENGINEERING_CHANGELOG.md`
  - `README.md`
  - `MEMORY.md`
- 完成检查：
  - [x] 已做本地验证
  - [x] 已看 git diff
  - [x] 已评估跨平台影响
  - [x] 已同步文档
- 结果：
  - 项目默认发布顺序更明确：完成检查后，先同步 GitHub，再发布到 GCloud。
  - 只有在半成品、存在风险、或用户明确暂停时，才停止在本地。
- 是否上线：
  - 未上线
- 备注：
  - 这里的 GCloud 指当前项目使用的 Google Cloud / Cloud Run 发布链路。
