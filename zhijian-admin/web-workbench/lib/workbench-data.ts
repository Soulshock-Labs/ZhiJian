export type Tone = "brand" | "info" | "neutral" | "success" | "warn" | "danger";

export const workbenchData = {
  greeting: { weekday: "星期三", time: "上午 9:04", weekNo: "第 16 周" },
  hero: {
    title: "今天，从一份更轻松的周计划开始",
    body: "你上周停在「春天来了」主题的周四教案。可以继续补完，也可以直接开始下一周。",
    ctaPrimary: "继续上次任务",
    ctaSecondary: "开始本周周计划",
  },
  tasks: [
    { id: "weekly", tag: "进行中", tone: "brand" as Tone,
      title: "本周周计划", body: "春天来了 · 中班", meta: "周二已补完" },
    { id: "lesson", tag: "推荐",   tone: "info" as Tone,
      title: "日教案 · 周三", body: "从周计划延续生成", meta: "约 2 分钟" },
    { id: "obs",    tag: "空",     tone: "neutral" as Tone,
      title: "今日观察", body: "拍一张或说一句都行", meta: "随手记录" },
  ],
  quick: [
    { id: "new-obs", label: "新建观察" },
    { id: "templates", label: "打开模板" },
    { id: "theme", label: "本周主题" },
  ],
  recent: [
    { type: "lesson", typeLabel: "日教案", title: "周二·户外游戏活动",  cls: "中班", at: "2 天前" },
    { type: "weekly", typeLabel: "周计划", title: "第 15 周 · 植物朋友", cls: "中班", at: "5 天前" },
    { type: "obs",    typeLabel: "观察",   title: "小远搭积木的专注时刻", cls: "中班", at: "6 天前" },
  ],
  status: {
    kb:     "已同步 · 114 份文件",
    member: "剩余 128 次 · 5月23日到期",
    streak: "已连续使用 7 天",
  },
};

export type WorkbenchData = typeof workbenchData;
