"use client";

import { useAuth } from "@/lib/useAuth";

export type SideNavPanel = "workbench" | "weekly" | "knowledge" | null;

function emit(panel: SideNavPanel) {
  window.dispatchEvent(new CustomEvent("sidenav:open", { detail: panel }));
}

interface Item {
  label: string;
  badge?: string;
  active?: boolean;
  panel?: SideNavPanel;
  disabled?: boolean;
  href?: string;
}

export function SideNav() {
  const { user } = useAuth();
  const isPlatformAdmin = user?.role === "platform_admin";
  const knowledgeLabel =
    user?.role === "platform_admin" ? "纸笺知识库"
    : user?.role === "org_admin" ? "园本知识库"
    : "我的知识库";

  const groups: { title: string; items: Item[] }[] = [
    {
      title: "今天",
      items: [
        { label: "工作台", badge: "3", active: true, panel: "workbench" },
        { label: "日教案", disabled: true },
        { label: "观察记录", disabled: true },
      ],
    },
    {
      title: "本周",
      items: [
        { label: "周计划", panel: "weekly" },
        { label: "主题库", disabled: true },
      ],
    },
    {
      title: "资源",
      items: [
        { label: "模板中心", badge: "114", disabled: true },
        { label: knowledgeLabel, panel: "knowledge" },
        { label: "我的班级", disabled: true },
      ],
    },
    {
      title: "纸笺集",
      items: [
        ...(isPlatformAdmin ? [{ label: "管理后台", href: "#admin-console" } satisfies Item] : []),
        { label: "小纸笺", disabled: true },
        { label: "会员权益", disabled: true },
      ],
    },
  ];

  return (
    <aside
      className="flex flex-col gap-0.5 px-2.5 py-4 overflow-y-auto"
      style={{
        width: "220px",
        flexShrink: 0,
        background: "var(--color-paper-hi)",
        borderRight: "1px solid var(--color-rule-soft)",
      }}
    >
      {groups.map((g) => (
        <div key={g.title}>
          {/* Section label */}
          <div
            className="px-3 pt-3 pb-1.5"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--color-ink-4)",
            }}
          >
            {g.title}
          </div>

          {g.items.map((it) => (
            <button
              key={it.label}
              disabled={it.disabled}
              onClick={() => {
                if (it.href) { window.location.hash = it.href.replace(/^#/, ""); return; }
                if (it.panel) emit(it.panel);
              }}
              className="w-full flex items-center gap-2.5 h-9 px-3 rounded-sm text-body-sm transition-all text-left border"
              style={
                it.active
                  ? { background: "oklch(0.94 0.05 55 / 0.8)", color: "var(--color-brand)", fontWeight: 500, borderColor: "oklch(0.62 0.14 40 / 0.15)" }
                  : it.disabled
                  ? { color: "var(--color-ink-4)", cursor: "not-allowed", opacity: 0.6, background: "transparent", borderColor: "transparent" }
                  : { color: "var(--color-ink-3)", background: "transparent", borderColor: "transparent" }
              }
              onMouseEnter={e => { if (!it.disabled && !it.active) { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-paper-sunk)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--color-ink-2)"; } }}
              onMouseLeave={e => { if (!it.disabled && !it.active) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--color-ink-3)"; } }}
            >
              {/* dot */}
              <span
                className="flex-shrink-0 rounded-full opacity-50"
                style={{ width: "6px", height: "6px", background: "currentColor" }}
              />
              <span>{it.label}</span>
              {it.badge && (
                <span className="ml-auto font-num text-meta" style={{ color: "var(--color-ink-4)" }}>
                  {it.badge}
                </span>
              )}
              {it.disabled && !it.badge && (
                <span
                  className="ml-auto text-[9px] px-1.5 py-0.5 rounded-[10px]"
                  style={{ background: "var(--color-paper-sunk)", color: "var(--color-ink-4)" }}
                >
                  即将上线
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
