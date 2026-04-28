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
}

export function SideNav() {
  const { user } = useAuth();
  const knowledgeLabel =
    user?.role === "platform_admin"
      ? "纸笺知识库"
      : user?.role === "org_admin"
        ? "园本知识库"
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
  ];

  return (
    <aside className="w-[var(--sidenav-w)] bg-paper border-r border-rule px-3 py-5 flex flex-col gap-1">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="eyebrow px-3 pt-4 pb-2">{g.title}</div>
          {g.items.map((it) => (
            <button
              key={it.label}
              disabled={it.disabled}
              onClick={() => it.panel && emit(it.panel)}
              className={[
                "w-full flex items-center gap-3 h-10 px-3 rounded-sm text-body-sm transition-colors text-left",
                it.active
                  ? "bg-brand-tint text-brand font-medium"
                  : it.disabled
                    ? "text-ink-4 cursor-not-allowed"
                    : "text-ink-2 hover:bg-paper-sunk hover:text-ink cursor-pointer",
              ].join(" ")}
            >
              <span className="w-[18px] h-[18px] flex-none rounded-xs bg-current opacity-40" />
              <span>{it.label}</span>
              {it.badge && (
                <span className="ml-auto font-num text-meta text-ink-3">{it.badge}</span>
              )}
              {it.disabled && !it.badge && (
                <span className="ml-auto text-[10px] text-ink-4">即将上线</span>
              )}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
