import { Button } from "./ui/Button";
import { workbenchData } from "@/lib/workbench-data";

type State = "default" | "empty" | "quota";

export function HeroSection({ state = "default" }: { state?: State }) {
  const { greeting, hero } = workbenchData;

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
        <Button variant="primary" size="md" disabled={state === "quota"} fullWidth>
          <span className="sm:hidden">{primary}</span>
        </Button>
        <Button variant="primary" size="md" disabled={state === "quota"} className="hidden sm:inline-flex">
          {primary}
        </Button>
        {state !== "empty" && (
          <>
            <Button variant="secondary" size="md" fullWidth className="sm:hidden">
              {hero.ctaSecondary}
            </Button>
            <Button variant="secondary" size="md" className="hidden sm:inline-flex">
              {hero.ctaSecondary}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
