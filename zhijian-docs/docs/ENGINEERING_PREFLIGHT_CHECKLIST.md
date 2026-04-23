# 纸笺 · 工程起飞检查单

> 目的：像飞机起飞前先过检查单一样，让项目在任何设备、任何成员、任何平台下，先按统一守则检查，再开始写代码、部署、排查 Bug。

---

## 核心原则

- 先读检查单，再读代码，再改代码。
- 先确认当前目标，再确认影响范围，再开始实现。
- 先做最小验证，再做线上发布。
- 先保留证据，再处理异常。
- 先记录决策，再进入下一轮开发。

---

## 每日开工顺序

### 1. 开工前 5 分钟

- 先读 [MEMORY.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/MEMORY.md)
- 再读本文件 [ENGINEERING_PREFLIGHT_CHECKLIST.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_PREFLIGHT_CHECKLIST.md)
- 查看 `git status`
- 确认当前线上域名、Cloud Run 服务、GitHub 分支状态
- 确认今天的优先级：产品问题、Bug 修复、功能开发、部署发布，哪一个优先

### 2. 开发前 3 个确认

- 这次改动的目标是什么
- 会影响前端、后端、部署、文档中的哪几块
- 有没有现成接口、旧逻辑、冲突副本、临时文件需要先识别

---

## 写代码前检查

### 功能开发

- 先找现有代码入口：页面、状态、接口、导出链路
- 先列出“最小闭环”：输入 -> 处理 -> 预览 -> 导出 / 提交
- 先判断是否要兼容移动端、Windows、Mac、Cloud Run、GitHub、Dropbox
- 优先保留旧链路可用，不用“大替换”破坏现有演示

### Bug 修复

- 先复现：现象、页面、接口、平台、时间
- 再定位：前端展示问题 / 后端接口问题 / 浏览器缓存 / 域名路由 / 部署版本
- 再修复：只动必要范围
- 修完后至少验证 1 次主流程

### 模板 / 导出相关

- 先确认：是模板问题、内容问题，还是导出问题
- 模板相关优先走“标准模板 + 净空自检 + 草稿编辑”链路
- 导出问题必须保留报错上下文：接口名、模板名、浏览器、返回内容

---

## 跨平台检查

### Web / 移动端

- 先看移动端高度是否挤压内容
- 检查弹窗、输入框、按钮是否被遮挡
- 检查中文输入法候选框是否影响交互
- 检查 Safari / Firefox / Chrome 是否存在下载差异

### Windows

- 检查字体回退是否导致布局错位
- 检查登录、网络、浏览器缓存是否与 Mac 表现不同
- 检查下载路径和 Word 打开方式是否不同

### Cloud Run / 域名

- 确认部署 revision 是否更新
- 确认自定义域名与 `run.app` 返回的是同一版本
- 优先排查缓存、Cloudflare、DNS，而不是先怀疑代码丢失

### Dropbox

- 发现 `conflicted copy` 先隔离，不直接合并
- 主开发只认当前主线文件
- 冲突副本单独归档，再做差异阅读

---

## 部署前检查

- 检查 `git status`
- 检查语法：至少做一次基础校验
- 确认本次改动是否需要更新文档
- 确认本次改动是否需要线上数据兼容
- 确认 `gcloud auth` 正常

部署顺序：

- 本地验证
- GitHub 提交与同步
- Cloud Build
- Cloud Run deploy
- 域名刷新验证
- 如需，补充回写文档与记录

---

## GitHub 提交前检查

- 只提交本次有意义的代码和文档
- 不提交本地统计文件、日志文件、冲突副本
- 提交前看一遍是否混入测试数据
- 提交信息必须说明“做了什么”

---

## 每次代码修改后的完成提交检查

每次功能开发、Bug 修复、文档更新完成后，都要补做下面这组检查：

- 确认改动目标已经完成，不留“半改状态”
- 确认主流程至少手动验证 1 次
- 确认是否影响移动端、Windows、部署、导出、域名
- 确认是否需要同步修改文档、版本号、提示文案
- 确认 `git diff` 中没有混入无关文件
- 确认提交信息能说清“为什么改、改了什么”
- 确认本次改动已追加到 [docs/ENGINEERING_CHANGELOG.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_CHANGELOG.md)
- 确认检查通过后，默认进入 `GitHub 同步 + GCloud 发布` 流程

推荐顺序：

1. 改完代码
2. 本地验证
3. 看 `git diff`
4. 补工程修改记录
5. 提交 GitHub
6. 发布 GCloud

默认动作说明：

- 只要本次改动已经完成、验证通过、没有阻塞项，就默认允许继续执行 GitHub 提交与 GCloud 发布。
- 如果改动仍在半成品状态、存在未确认风险、或用户明确要求先不要上线，则暂停在本地，不进入发布流程。

推荐结构：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `chore:` 杂项整理

---

## 出现异常时的处理顺序

### 页面不对

- 先确认源码是否已上线
- 再确认域名是否缓存
- 再确认前端触发逻辑

### 导出失败

- 先看 `/generate` 或相关接口返回
- 再分辨是模板、内容、还是浏览器下载问题
- 保留 Bug 报告，不盲改

### 登录失败 / 外部服务超时

- 先分清是不是项目问题
- 如果是 OpenAI、Google、浏览器登录链路问题，不要误判为项目故障

---

## 每次收工前

- 把今天的关键决策写入 [MEMORY.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/MEMORY.md)
- 把本次代码改动写入 [docs/ENGINEERING_CHANGELOG.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_CHANGELOG.md)
- 记录：
  - 今天改了什么
  - 为什么这么改
  - 线上是否已发布
  - 还有什么未完成

---

## 快速口令

可以把下面这句话当成以后每次开工的固定口令：

> 先读记忆，后读检查单；先看计划，再写代码；先做验证，再上生产。
