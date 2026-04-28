"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { workbenchData } from "@/lib/workbench-data";

type State = "default" | "empty" | "quota";

function useWeekProgress() {
  const calc = () => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun,1=Mon...5=Fri,6=Sat
    const weekDay = day === 0 ? 7 : day; // 把周日挪到末尾，周一=1
    const secondsIntoDay =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const totalWeekSeconds = 5 * 24 * 3600; // 周一到周五
    const elapsed = Math.min((weekDay - 1) * 24 * 3600 + secondsIntoDay, totalWeekSeconds);
    return Math.min(elapsed / totalWeekSeconds, 1);
  };
  const [pct, setPct] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setPct(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return pct;
}

export function HeroSection({ state = "default" }: { state?: State }) {
  const { greeting, hero } = workbenchData;
  const weekPct = useWeekProgress();

  const title =
    state === "empty" ? "第一次来，从一个周计划开始吧" : hero.title;
  const body =
    state === "empty" ? "不需要复杂设置，选一个主题 2 分钟就能完成" : hero.body;
  const primary =
    state === "empty" ? "创建第一份周计划"
    : state === "quota" ? "本月额度已用完"
    : hero.ctaPrimary;

  return (
    <section className="pb-8">
      <div className="eyebrow">
        {greeting.weekday} · {greeting.time} · {greeting.weekNo}
      </div>
      <h1 className="font-wenkai font-normal text-h1 md:text-[34px] text-ink tracking-tight leading-tight mt-2 max-w-[620px]">
        {title}
      </h1>
      <p className="text-body text-ink-2 mt-3 max-w-[560px]">{body}</p>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-5">
        {/* 本周进度条（实时秒级） */}
        <div className="relative flex-1 h-10 rounded-pill bg-paper-hi border border-rule overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-brand rounded-pill transition-none"
            style={{ width: `${(weekPct * 100).toFixed(4)}%` }}
          />
          <div className="relative z-10 flex items-center justify-between h-full px-4">
            <span className="text-meta font-semibold text-white mix-blend-difference">本周进度</span>
            <span className="text-meta font-num text-white mix-blend-difference">
              {(weekPct * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        <Button variant="primary" size="md" disabled={state === "quota"} className="hidden sm:inline-flex">
          {primary}
        </Button>
        {state !== "empty" && (
          <Button variant="secondary" size="md" className="hidden sm:inline-flex">
            {hero.ctaSecondary}
          </Button>
        )}
      </div>
    </section>
  );
}
