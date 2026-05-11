# 纸笺 · 工作台页面 · 前端规格

> 风格冻结：Option 02（黑体 + 文楷点睛）· 朱砂主色。
> 本文件为前端开发直接可交付的结构规格。所有样式走 `tokens.css` + `components.css`，Tailwind 端等价为 `theme.extend` 映射同名 token。

---

## 0. 页面目标

一句话：**打开就知道今天要做什么，1 秒内能继续上次任务。**

用户：一线幼师。高频诉求：
1. 继续上次没做完的周计划 / 日教案
2. 快速开新一周周计划
3. 随手记录一条今日观察
4. 看到本月剩余生成额度

所以工作台是「一个明确的下一步 + 三张任务卡 + 一条状态带」，不是 dashboard。

---

## 1. 页面结构（自上而下）

```
<AppShell>                        // 整页框架（桌面：topbar + sidenav + main；移动：topbar-m + main + tabbar）
├── <TopNav />                    // 桌面顶部导航
├── <SideNav />                   // 桌面左侧导航（mobile 隐藏）
└── <Main>
    ├── <HeroSection />           // 区块 1：问候 + 大标题 + 首要 CTA
    ├── <TaskCards />             // 区块 2：三张任务卡（继续 / 推荐 / 新建）
    ├── <QuickActions />          // 区块 3：三个轻量入口（拍一张观察 / 打开模板 / 本周主题）
    ├── <RecentList />            // 区块 4：最近编辑列表（最多 5 行）
    └── <StatusStrip />           // 区块 5：底部状态带（知识库 / 会员 / 连续使用）
```

移动端把 `SideNav` 换成底部 `<TabBar/>`，顶部换 `<TopNavMobile/>`。其余区块顺序不变，全部一列。

---

## 2. 区块规格

### 2.1 HeroSection · 今日引导

| 项 | 值 |
|---|---|
| **作用** | 告诉用户"今天在哪，下一步点什么" |
| **组件** | eyebrow(meta) · h1 · body · 两颗按钮(primary + secondary) |
| **文案骨架** | eyebrow: `星期三 · 上午 9:04 · 第 16 周`<br/>h1: `今天，从一份更轻松的周计划开始`<br/>body: `你上周停在「春天来了」主题的周四教案。可以继续补完，也可以直接开始下一周。` |
| **CTA** | Primary: `继续上次任务` → 跳 `/lesson/:id`<br/>Secondary: `开始本周周计划` → 跳 `/weekly/new` |
| **字体** | h1 用 `--font-wenkai`，其余 `--font-sans` |
| **间距** | 上 `--sp-9` / 下 `--sp-8`；h1 与 body 之间 `--sp-3` |

### 2.2 TaskCards · 三张任务卡

三列网格(桌面 3/1，移动 1 列)。每张卡用 `.card.card--hover`。

| 卡片 | tag | 标题 | 描述 | meta | 点击 |
|---|---|---|---|---|---|
| 继续中 | `tag--brand · 进行中` | 本周周计划 | 春天来了 · 中班 | 周二已补完 | → 周计划详情 |
| 推荐 | `tag--info · 推荐` | 日教案 · 周三 | 从周计划延续生成 | 约 2 分钟 | → 开始生成 |
| 新建 | `tag--neutral · 空` | 今日观察 | 拍一张或说一句都行 | 随手记录 | → 新建观察 |

### 2.3 QuickActions · 快捷入口

一行三个 pill 按钮 `.btn.btn--secondary`，icon 用占位圆点或线条 SVG（无 emoji）：
`+ 新建观察` · `📄 打开模板` · `# 本周主题`

### 2.4 RecentList · 最近编辑

标题 `h3: 最近` + `btn--link: 查看全部`。
列表最多 5 行，每行：
`[类型 tag] 标题 · 中班 · 2 天前` + 右侧 ghost icon button `⋯`。
类型 tag：周计划/日教案/观察。

### 2.5 StatusStrip · 底部状态带

横排三段信息，移动端堆叠：
- `知识库` 已同步 · 114 份文件
- `会员` 剩余 128 次 · 5月23日到期
- `连续` 已连续使用 7 天

用 `.meta` + mono 前缀标签，分隔符 `· ·`，底部 `--sp-10` 呼吸。

---

## 3. 状态规范

### 3.1 空状态（首次登录 / 未用过）

- **HeroSection**：h1 改 `第一次来，从一个周计划开始吧`；body 改 `不需要复杂设置，选一个主题 2 分钟就能完成`；primary 改 `创建第一份周计划`，隐藏 secondary。
- **TaskCards**：三张卡变「引导卡」——
  - 1: `还没有进行中的计划` · CTA `开始一个`
  - 2: `做完周计划，我帮你写日教案` · 置灰
  - 3: `日常观察可以拍照或语音` · CTA `试一下`
- **RecentList**：整块替换为一个 `.card--inset` 空状态——
  中央：illustration 占位（灰色线稿）→ 文案 `这里会显示你最近编辑的内容` → link button `先看看模板`。

### 3.2 错误状态

- **加载失败**(网络 / 500)：整个 Main 顶部一条 `.card--outline` 带 `tag--danger`：
  `加载失败 · 点击重试`，右侧 `btn--secondary btn--sm: 重试`。
  下方内容保持骨架屏（见 3.4）。
- **局部失败**(单张卡数据取不到)：卡内容换成 `.card--inset`，文案 `这块暂时看不到，点一下再试`，底部 `btn--link: 重试`。
- **额度耗尽**(生成次数=0)：HeroSection primary 置灰并显示 `本月额度已用完`，其下方出现一条 `.card--accent` 软提示：`升级会员继续使用` + primary `查看会员`。

### 3.3 成功状态

- **刚完成一张日教案**：HeroSection 顶部短暂插入一条 toast-like 横条(`.card--accent` + `tag--success`)：
  `周三日教案已生成 · 查看`（3 秒后淡出，或用户关闭）。
- **连续使用达里程碑**(如 7 天)：StatusStrip 里 `连续` 段落加 `tag--success · 新徽章`。
- **周计划全部完成**：TaskCards 第一张卡变 `tag--success · 本周已完成`，CTA 换 `回看本周` + secondary `开始下一周`。

### 3.4 骨架屏（Loading）

全部使用同色系 shimmer：
- 文本条：`height: 1em; background: var(--color-paper-sunk); border-radius: var(--radius-xs);`
- 卡片：保持原卡的 border / radius / padding，内部 3 条 text shimmer。
- 避免用转圈 spinner，除非是按钮内的 inline loading（按钮文案变 `生成中…` + 圆点动画）。

---

## 4. 移动端适配

断点：`sm ≤ 640`（手机 / 小程序）。

| 改动 | 细节 |
|---|---|
| 导航 | `TopNav` → `TopNavMobile`（汉堡 + 页面标题 + 通知 icon）；`SideNav` → `TabBar`（5 项：工作台 / 周计划 / 记录 / 模板 / 我的） |
| HeroSection | h1 降到 `--fs-h1`(26px)；两颗按钮变 `width:100%` 堆叠，primary 在上 |
| TaskCards | 单列；保持 `.card--hover`，点击整卡可导航 |
| QuickActions | 横向滚动条（`overflow-x:auto; scroll-snap-type:x mandatory`），每个 pill `scroll-snap-align:start` |
| RecentList | 保持列表，每行高 ≥ 60px；右侧 `⋯` 换为左滑删除（在落地时实现） |
| StatusStrip | 三段堆叠为一列，每段自左至右 `[meta-label] value`；字号 12px |
| 间距 | 容器 padding `--sp-4`；分区间距 `--sp-7` |
| 底部安全区 | TabBar 用 `env(safe-area-inset-bottom)`（已在 components.css 处理） |

---

## 5. 文案总表（直接交开发）

```json
{
  "greeting": { "weekday": "星期三", "time": "上午 9:04", "weekNo": "第 16 周" },
  "hero": {
    "title": "今天，从一份更轻松的周计划开始",
    "body": "你上周停在「春天来了」主题的周四教案。可以继续补完，也可以直接开始下一周。",
    "ctaPrimary": "继续上次任务",
    "ctaSecondary": "开始本周周计划"
  },
  "tasks": [
    { "id":"weekly",  "tag":"进行中", "tone":"brand",   "title":"本周周计划", "body":"春天来了 · 中班", "meta":"周二已补完" },
    { "id":"lesson",  "tag":"推荐",   "tone":"info",    "title":"日教案 · 周三", "body":"从周计划延续生成", "meta":"约 2 分钟" },
    { "id":"obs",     "tag":"空",     "tone":"neutral", "title":"今日观察", "body":"拍一张或说一句都行", "meta":"随手记录" }
  ],
  "quick": ["新建观察", "打开模板", "本周主题"],
  "recent": [
    { "type":"lesson",  "title":"周二·户外游戏活动",  "class":"中班", "at":"2 天前" },
    { "type":"weekly",  "title":"第 15 周 · 植物朋友", "class":"中班", "at":"5 天前" },
    { "type":"obs",     "title":"小远搭积木的专注时刻", "class":"中班", "at":"6 天前" }
  ],
  "status": {
    "kb":     "已同步 · 114 份文件",
    "member": "剩余 128 次 · 5月23日到期",
    "streak": "已连续使用 7 天"
  },
  "empty": {
    "heroTitle": "第一次来，从一个周计划开始吧",
    "heroBody":  "不需要复杂设置，选一个主题 2 分钟就能完成",
    "heroCta":   "创建第一份周计划"
  },
  "errors": {
    "load":  "加载失败 · 点击重试",
    "quota": "本月额度已用完"
  },
  "success": {
    "lessonDone": "周三日教案已生成",
    "streak7":    "连续 7 天 · 新徽章"
  }
}
```
