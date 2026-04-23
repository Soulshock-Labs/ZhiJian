import { Tag } from "./ui/Tag";
import { Button } from "./ui/Button";
import { workbenchData, type Tone } from "@/lib/workbench-data";

const toneMap: Record<string, Tone> = { lesson: "info", weekly: "brand", obs: "neutral" };

export function RecentList() {
  return (
    <section className="pb-9">
      <div className="flex items-end justify-between mb-4">
        <h3 className="text-h3 font-semibold text-ink">最近</h3>
        <Button variant="link" size="sm">查看全部</Button>
      </div>
      <div className="rounded-md border border-rule bg-paper-hi overflow-hidden">
        {workbenchData.recent.map((r, i) => (
          <div
            key={r.title}
            className={[
              "flex items-center gap-4 px-5 h-[60px] hover:bg-paper-sunk cursor-pointer transition-colors",
              i ? "border-t border-rule-soft" : "",
            ].join(" ")}
          >
            <Tag tone={toneMap[r.type]} variant="outline">{r.typeLabel}</Tag>
            <div className="flex-1 min-w-0 truncate text-body-sm text-ink">{r.title}</div>
            <div className="hidden sm:block text-meta text-ink-3">{r.cls}</div>
            <div className="text-meta text-ink-3">{r.at}</div>
            <button className="w-8 h-8 rounded-full text-ink-3 hover:bg-paper-sunk">⋯</button>
          </div>
        ))}
      </div>
    </section>
  );
}
