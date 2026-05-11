# 纸笺前端重构 · Claude Code Handoff 包

> 目标：把已确认的新设计（Option 02 · 朱砂 · 文楷点睛）替换到 `index.html` 的视觉层。
> **不改变** FastAPI 后端接口、不改变现有 fetch 逻辑、不新建 Next.js 工程。
> 只替换 CSS、HTML 结构、文案。

---

## 0 · 背景上下文（给 Claude Code 的一次性说明）

项目：`smart-teacher-assistant`（FastAPI + 单页 index.html）
仓库：`https://github.com/Ethan7586/smart-teacher-assistant`
后端接口保持不变：`/generate` `/generate-weekly` `/generate-daily` `/preview` 等。
前端目前：`index.html` 单文件 + 内联/外链 CSS + 内联 JS，同域部署。

**约束**：
- 不新增构建工具（不要 Vite/Next/Webpack）
- 不动 `main.py` 和任何 API 路径
- 不动 `android-app/`、`mini-program/`
- 只动 `index.html` 以及新增 `static/tokens.css` `static/components.css`

---

## 1 · 工作分成 5 个 PATCH，一次只做一个

每个 PATCH 独立、可验收、可回滚。建议顺序执行。

### PATCH 1 · 引入设计 tokens（纯新增，风险 0）

- **新增** `static/tokens.css`（内容见附件 A）
- **新增** `static/components.css`（内容见附件 B）
- **修改** `index.html` 的 `<head>`：
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.7.0/style.css"/>
  <link rel="stylesheet" href="/static/tokens.css"/>
  <link rel="stylesheet" href="/static/components.css"/>
  ```
- **修改** `main.py`（如 FastAPI 还没挂载 static）：
  ```python
  from fastapi.staticfiles import StaticFiles
  app.mount("/static", StaticFiles(directory="static"), name="static")
  ```
- **验收**：页面外观不变，DevTools 能看到 `--color-brand` 等 CSS 变量已加载。

### PATCH 2 · 首屏 Hero + 品牌头部替换

**只替换** `index.html` 里第一屏的 banner / 标题区，HTML 结构套 `components.css` 的 class：
- 顶栏改为 `.topbar` + `.topbar__brand`（"纸笺" + 方章笺字）+ `.topbar__nav`
- 首屏大标题改用 `.display` / `<h1>` 加 `font-family: var(--font-wenkai)`
- Primary CTA 用 `.btn.btn--primary`，secondary 用 `.btn.btn--secondary`

**文案**（来自已定稿文案 JSON，不要再创作）：
- eyebrow: `星期三 · 上午 9:04 · 第 16 周`（或后端下发的当前时间）
- h1: `今天，从一份更轻松的周计划开始`
- body: `你上周停在「春天来了」主题的周四教案。可以继续补完，也可以直接开始下一周。`
- CTA1: `继续上次任务`  CTA2: `开始本周周计划`

**验收**：首屏颜色变米纸色、大标题是文楷字、按钮是朱砂胶囊。既有的表单功能（"老师，今天的主题是什么"那个框）保留在下方。

### PATCH 3 · 任务卡 + 快捷入口区

把原先零散的按钮/区块重组为：
- **TaskCards**：3 张 `.card.card--hover`（本周周计划 / 日教案 · 周三 / 今日观察）
- **QuickActions**：一行 `.btn--secondary` pill（新建观察 / 打开模板 / 本周主题）

每张 TaskCard 点击要触发已有的现网行为（例如 "本周周计划" → 触发原本周计划入口；"日教案" → 滚到 / 打开日教案模块）。**不要新增路由**，只做 anchor 或现有函数调用。

**验收**：卡片点击能跳到原模块，文案/tag 完全匹配 spec。

### PATCH 4 · 最近编辑列表 + 底部状态带

- RecentList：读取 `localStorage` 里已有的"最近上传记录"（v1.1.4 已存本地 6 条），用 `.recent__row` 渲染，`.tag--outline` 展示类型。
- StatusStrip：读取
  - 知识库：静态或 `/health` 里的文件数（如无接口，先写死 `已同步 · 114 份文件`）
  - 会员：调用已有的额度接口（如无，先写死 `剩余 128 次`）
  - 连续天数：`localStorage` 累计

**验收**：至少"最近"区能显示本地的 1-6 条真实记录；状态带三段对齐。

### PATCH 5 · 移动端适配 + 清理旧样式

- 原有的 `<style>` 里所有写死颜色 / 字号 / 圆角，逐条替换为 `var(--...)`
- 移动端在 `max-width: 900px` 断点：
  - topbar 收成 `.topbar-m`（汉堡 + 页面标题 + 通知）
  - 底部固定 `.tabbar`（工作台 / 周计划 / 记录 / 模板 / 我的）
  - TaskCards 单列、CTA 堆叠 100% 宽
- 删除不再使用的旧 class（留好 git diff 便于回滚）

**验收**：手机尺寸（≤640）所有交互区域 ≥44px；Chrome DevTools 设备切换验证三档（360 / 768 / 1280）。

---

## 2 · 给 Claude Code 的启动提示词（直接贴给它）

```
我要重构 smart-teacher-assistant 的前端视觉层，不改后端、不改接口、不改小程序和 Android。

请严格按 docs/CLAUDE_HANDOFF.md 里的 5 个 PATCH 顺序执行，一次只做一个 PATCH。

规则：
1. 每个 PATCH 完成后停下来让我确认，不要连着做下一个。
2. 不要重新设计视觉，只套用 tokens.css + components.css 里已有的 class。
3. 不要新增依赖，不要引入构建工具。
4. 所有写死的颜色/字号/圆角必须用 CSS variables。
5. 文案照抄 docs/CLAUDE_HANDOFF.md 的 JSON，不要自己创作。
6. 改完每个 PATCH 给我一份 "改了哪些文件 + 风险点 + 回滚方法" 的一句话总结。

现在请开始 PATCH 1。
```

---

## 3 · 命名、目录、PR 规范（一次说清，避免来回）

- 分支：`feat/frontend-redesign-paperjian`
- Commit 前缀：`feat(ui):` / `style(tokens):` / `refactor(index):`
- 每个 PATCH 一个 commit，PR 描述必含：改了什么 / 没改什么 / 回滚命令

---

## 4 · 工程审查清单（Claude Code 在 PATCH 1 前先回答一遍）

让它在动手前确认：

```
请在开始 PATCH 1 前，先回答以下 7 个问题（不用改代码，只答）：

1. index.html 当前 <head> 里有几个 <link rel="stylesheet">？分别是什么？
2. index.html 里 <style> 标签共多少行？是否有重复定义的 class？
3. main.py 是否已经挂载 /static？
4. 现有按钮的 class 命名规范是什么？（btn / button / primary-btn ...）
5. 现有 JS 里 fetch 的请求入口函数名是什么？（generateWeekly / doGenerate ...）
6. 现有"最近上传记录"在 localStorage 用的 key 是什么？
7. Android / 小程序端是否会引用 /static/tokens.css？（确认边界）

答完我确认无误后，再开始 PATCH 1。
```

这一步会省掉大量往返。

---

## 5 · 附件

### 附件 A · tokens.css

从本项目根目录 `tokens.css` 原样拷贝（已验证，167 行）。

### 附件 B · components.css

从本项目根目录 `components.css` 原样拷贝（已验证，380 行）。

### 附件 C · 文案 JSON

见 `Workbench Spec.md` 末尾的 JSON 块，直接作为数据源。

### 附件 D · 视觉参考

- `Design System.html` —— 所有组件 live 预览
- `Workbench.html` —— 目标工作台排版

---

## 6 · 给您自己的 3 条提醒

1. **先开分支**：`git checkout -b feat/frontend-redesign-paperjian`，不要直接在 main 上让 Claude Code 改。
2. **每个 PATCH 完了立刻 commit + push**，即使它说"我再顺手修一下 X"——拒绝，让它下一个 PATCH 再做。
3. **token 省不省在于分段**：一次让它做一个 PATCH，600 行以内，比一次性让它重写整个 `index.html`（2000+ 行）省 5-10 倍 token。
