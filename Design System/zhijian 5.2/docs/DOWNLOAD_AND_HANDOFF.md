# 给 Claude Code 的下载与对接说明

## 一、要给 Claude Code 的话(直接复制)

```
我刚把前端设计系统升级到了第二版,文件已经放在我电脑本地的
~/Downloads/zhijian-design-system/ 目录下,包含以下文件:

  tokens.css          — 设计 tokens(颜色/字体/间距/圆角/阴影/动效/层级)
  components.css      — 组件样式(按钮/卡片/输入/导航/标签/进度网格/空状态)
  Workbench Spec.md   — 工作台页面规格
  CLAUDE.md           — 项目工程约束(放仓库根目录)
  docs/CLAUDE_HANDOFF.md — 5 个 PATCH 的重构计划

请按以下规则把它们整合到 ZhiJian 仓库:

1. 先 git checkout -b feat/frontend-redesign-v2
2. 复制 tokens.css 和 components.css 到 static/ 目录
3. 复制 CLAUDE.md 到仓库根目录
4. 复制 Workbench Spec.md 和 CLAUDE_HANDOFF.md 到 docs/ 目录
5. 在 main.py 里挂载 /static(如果还没挂)
6. 在 index.html <head> 里 <link> 这两个 css

不要重新设计视觉,所有组件用 tokens.css + components.css 里已有的 class。
不要改后端接口,不要新增依赖,不要引入构建工具。

按 docs/CLAUDE_HANDOFF.md 的 5 个 PATCH 顺序执行,一次只做一个 PATCH。
```

## 二、下载步骤(您操作)

1. 下载这 5 个文件:
   - `tokens.css`
   - `components.css`
   - `CLAUDE.md`
   - `Workbench Spec.md`
   - `docs/CLAUDE_HANDOFF.md`

2. 把它们整理到 `~/Downloads/zhijian-design-system/`

3. 终端执行:
   ```
   cd ~/path/to/ZhiJian
   git checkout -b feat/frontend-redesign-v2
   mkdir -p static docs
   cp ~/Downloads/zhijian-design-system/tokens.css static/
   cp ~/Downloads/zhijian-design-system/components.css static/
   cp ~/Downloads/zhijian-design-system/CLAUDE.md ./
   cp ~/Downloads/zhijian-design-system/"Workbench Spec.md" docs/
   cp ~/Downloads/zhijian-design-system/CLAUDE_HANDOFF.md docs/
   git add -A
   git commit -m "feat(ui): import design system v2 (tokens + components)"
   git push -u origin feat/frontend-redesign-v2
   ```

4. 打开 Claude Code,进入 ZhiJian 项目,粘贴第一节那段话。

## 三、本次 v2 都改了什么

- `--color-rule` 拆为 `rule`(淡,卡片用)+ `rule-strong`(深,区域分隔用)
- 阴影色调从冷灰改为暖棕(配朱砂主题)
- 新增 `--fs-body-read: 16px` 长文阅读字号
- 新增 `--color-progress-*` 进度色族(done/current/todo/skip)
- 新增 `--font-display-only` 注释规则(防止文楷被滥用)
- 新增 `--dur-tap: 80ms`(小程序/Android 触控反馈)
- 新增 `--color-focus-fallback`(老 webview 兼容)
- 修 `.card__eyebrow` 的 `composes` 死规则(真 bug)
- 给 `color-mix` / `backdrop-filter` 加 fallback
- 新增 `.empty` 空状态组件
- 新增 `.weekgrid` 进度网格组件(就是您喜欢的那个日教案卡)
