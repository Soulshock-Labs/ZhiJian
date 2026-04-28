# 小纸笺 Web Workbench UI / CSS 对应说明

这份文档只说明当前 `zhijian-workbench/web-workbench` 的界面实现与设计系统之间的对应关系。

## 1. 设计系统来源

本地参考包：

- `_ Design System(1)/colors_and_type.css`
- `_ Design System(1)/preview/components-nav.html`
- `_ Design System(1)/preview/components-buttons.html`
- `_ Design System(1)/preview/components-cards.html`
- `_ Design System(1)/preview/components-badges.html`
- `_ Design System(1)/preview/typography-*.html`
- `_ Design System(1)/ui_kits/workbench/index.html`

这些文件当前作为设计参考存在，不直接参与 Next.js 运行时构建。

## 2. 运行时样式入口

运行时真正生效的全局样式入口：

- `zhijian-workbench/web-workbench/app/globals.css`

这里承接了设计系统里的核心 token，并映射为站点统一样式基线。

### 2.1 颜色 token

对应 `colors_and_type.css` / `preview/colors-*.html`：

- `--color-paper / --color-paper-hi / --color-paper-sunk`
  用于纸张底色、浮层、下沉面
- `--color-ink / --color-ink-2 / --color-ink-3 / --color-ink-4`
  用于正文、次级文字、提示文字、弱化文字
- `--color-brand`
  用于主按钮、主强调条、头像底色、选中态
- `--color-success-*`
  用于兑换中心、成功标签、状态点
- `--color-info-* / --color-warn-* / --color-danger-*`
  用于语义状态和后续扩展

### 2.2 字体 token

对应 `preview/typography-*.html`：

- `--font-sans`
  主体 UI 文本
- `--font-wenkai`
  品牌字和少量带温度的标题
- `--font-num`
  数字、统计、百分比
- `--font-mono`
  eyebrow / 辅助标识

### 2.3 尺寸 token

对应 `preview/spacing-tokens.html`：

- 字号：`--fs-h1 / --fs-h3 / --fs-h4 / --fs-body / --fs-body-sm / --fs-meta / --fs-micro`
- 间距：`--sp-1` 到 `--sp-12`
- 圆角：`--radius-xs` 到 `--radius-pill`
- 按钮高度：`--h-btn-sm / --h-btn-md / --h-btn-lg`

## 3. 组件映射

### 3.1 顶部导航

文件：

- `zhijian-workbench/web-workbench/components/TopNav.tsx`

对应设计参考：

- `_ Design System(1)/preview/components-nav.html`
- `_ Design System(1)/preview/components-buttons.html`

当前承接内容：

- 顶部主导航 pill
- 右侧兑换中心绿色语义按钮
- 搜索框胶囊形态
- 本月用量胶囊卡
- 头像/角色入口胶囊卡

当前约束：

- 右侧所有控件统一为 `h-9`
- 顶部统一使用 `rounded-pill + border-rule + paper/paper-hi`
- 兑换中心保留绿色语义，不再另起一套按钮语言

### 3.2 左侧导航

文件：

- `zhijian-workbench/web-workbench/components/SideNav.tsx`

对应设计参考：

- `_ Design System(1)/preview/components-nav.html`
- `_ Design System(1)/ui_kits/workbench/index.html`

当前承接内容：

- 四组信息架构：
  - 今天
  - 本周
  - 资源
  - 纸笺集
- 角色化文案：
  - 幼师：我的知识库
  - 园长：园本知识库
  - 平台：admin：纸笺知识库
- `纸笺集` 分组承接：
  - 管理后台
  - 小纸笺
  - 会员权益

### 3.3 后台控制台

文件：

- `zhijian-workbench/web-workbench/components/AdminConsolePanel.tsx`

对应设计参考：

- `_ Design System(1)/preview/components-cards.html`
- `_ Design System(1)/preview/components-badges.html`
- `_ Design System(1)/preview/components-buttons.html`

当前承接内容：

- 大卡容器
- 顶部状态 badge
- 四个统计卡
- 表格容器
- 授权表单

这次已做的收敛：

- 后台标题字号降回前台体系
- 原始角色值 `platform_admin` 改为中文 `管理员`
- 统计卡数字收回一档
- 表单输入和下拉改回 `text-body-sm`

### 3.4 知识库面板

文件：

- `zhijian-workbench/web-workbench/components/KnowledgeVaultPanel.tsx`

对应设计参考：

- `_ Design System(1)/preview/components-cards.html`
- `_ Design System(1)/ui_kits/workbench/index.html`

当前承接内容：

- 白色卡片主体
- 说明条
- 上传按钮
- 文档列表与操作区

## 4. 当前提交范围

这次只建议提交运行时相关的前端界面文件：

- `zhijian-workbench/web-workbench/components/TopNav.tsx`
- `zhijian-workbench/web-workbench/components/SideNav.tsx`
- `zhijian-workbench/web-workbench/components/AdminConsolePanel.tsx`
- `zhijian-workbench/web-workbench/UI_CSS_MAPPING.md`

不建议混进这次提交的内容：

- `zhijian-api/account_index.json`
- `zhijian-api/member_no_counter.json`
- `temp/`
- `_ Design System(1)/uploads/`
- 其他本地数据或临时文件

## 5. 后续建议

- 如果 `_ Design System(1)` 要进入仓库，建议先拆成真正需要的部分：
  - tokens
  - preview
  - assets
- `uploads/`、截图草稿、临时素材不要直接入主仓库
- 后续所有 UI 调整尽量先改 token，再改组件，避免局部越修越散
