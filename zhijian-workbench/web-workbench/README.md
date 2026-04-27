# 小纸笺 · 工作台 · Next.js 落地包

```bash
cd workbench-next
pnpm i   # or npm i / yarn
pnpm dev # open http://localhost:3000
```

## 结构

```
app/
  layout.tsx            # 载入字体 + globals.css
  page.tsx              # 工作台（组装所有区块）
  globals.css           # 引入 design tokens（镜像自 tokens.css）
components/
  AppShell.tsx          # 桌面 shell：TopNav + SideNav + Main；移动：TopNavMobile + Main + TabBar
  TopNav.tsx            # 桌面顶部导航
  SideNav.tsx           # 桌面左侧导航
  TopNavMobile.tsx      # 移动端顶栏
  TabBar.tsx            # 移动端底部 tab
  HeroSection.tsx       # 区块 1
  TaskCards.tsx         # 区块 2
  QuickActions.tsx      # 区块 3
  RecentList.tsx        # 区块 4
  StatusStrip.tsx       # 区块 5
  ui/
    Button.tsx          # btn / btn--primary / ...
    Card.tsx            # card / card--hover / ...
    Tag.tsx             # tag--brand / tag--info / ...
lib/
  workbench-data.ts     # 文案/数据 fixture（spec 文档里那份 JSON）
tailwind.config.ts      # 把 tokens 映射到 Tailwind theme
```

## 设计系统

- 所有颜色/字号/间距/圆角/阴影从 `app/globals.css` 里的 CSS variables 读取
- Tailwind 里可以用 `bg-paper / text-ink / rounded-md / shadow-md` 等，值由 tokens 驱动
- 字体：`--font-sans`（Noto Sans SC）· `--font-wenkai`（霞鹜文楷）· `--font-num`（Inter）
- 不接接口，所有数据来自 `lib/workbench-data.ts`

## 状态示例

`app/page.tsx` 顶部 `const state = 'default'`，改成 `'empty' | 'error' | 'quota' | 'success'` 可切换演示。
