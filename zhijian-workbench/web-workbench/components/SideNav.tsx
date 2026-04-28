"use client";

import { useAuth } from "@/lib/useAuth";

interface Item { label: string; badge?: string; active?: boolean; }

export function SideNav() {
  const { user } = useAuth();
  const knowledgeLabel =
    user?.role === "platform_admin"
      ? "纸笺知识库"
      : user?.role === "org_admin"
        ? "园本知识库"
        : "我的知识库";

  const groups: { title: string; items: Item[] }[] = [
    { title: "今天",  items: [{ label:"工作台", badge:"3", active:true }, { label:"日教案" }, { label:"观察记录" }] },
    { title: "本周",  items: [{ label:"周计划" }, { label:"主题库" }] },
    { title: "资源",  items: [{ label:"模板中心", badge:"114" }, { label: knowledgeLabel }, { label:"我的班级" }] },
  ];

  return (
    <aside className="w-[var(--sidenav-w)] bg-paper border-r border-rule px-3 py-5 flex flex-col gap-1">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="eyebrow px-3 pt-4 pb-2">{g.title}</div>
          {g.items.map((it) => (
            <a
              key={it.label}
              className={[
                "flex items-center gap-3 h-10 px-3 rounded-sm text-body-sm cursor-pointer transition-colors",
                it.active
                  ? "bg-brand-tint text-brand font-medium"
                  : "text-ink-2 hover:bg-paper-sunk hover:text-ink",
              ].join(" ")}
            >
              <span className="w-[18px] h-[18px] flex-none rounded-xs bg-current opacity-40" />
              <span>{it.label}</span>
              {it.badge && (
                <span className="ml-auto font-num text-meta text-ink-3">{it.badge}</span>
              )}
            </a>
          ))}
        </div>
      ))}
    </aside>
  );
}
