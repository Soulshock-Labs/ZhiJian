export function TopNav() {
  const links = ["工作台", "周计划", "日教案", "观察记录", "模板"];
  return (
    <header
      className="sticky top-0 z-[200] flex items-center gap-6 h-[var(--nav-h-desktop)] px-7 bg-paper border-b border-rule"
      style={{ backdropFilter: "saturate(1.1)" }}
    >
      <div className="flex items-center gap-2 font-wenkai text-h3 tracking-wider">
        <span className="w-7 h-7 rounded-xs bg-brand text-white grid place-items-center font-wenkai text-[16px]">
          笺
        </span>
        <span>纸笺</span>
      </div>
      <nav className="flex gap-2 ml-7">
        {links.map((l, i) => (
          <a
            key={l}
            className={[
              "h-9 px-4 inline-flex items-center rounded-pill text-body-sm whitespace-nowrap",
              "transition-colors cursor-pointer",
              i === 0
                ? "bg-paper-hi text-ink shadow-xs"
                : "text-ink-2 hover:bg-paper-sunk hover:text-ink",
            ].join(" ")}
          >
            {l}
          </a>
        ))}
      </nav>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <input
          className="h-8 w-[220px] px-3 rounded-sm border border-rule bg-white text-meta text-ink placeholder:text-ink-4 focus:outline-none focus:border-brand focus:shadow-focus"
          placeholder="搜索教案、模板、孩子"
        />
        <button className="h-8 px-4 rounded-pill bg-paper-hi border border-rule text-meta text-ink-2 hover:bg-paper-sunk whitespace-nowrap">
          <span className="font-num">128</span> 次
        </button>
        <div className="w-8 h-8 rounded-full bg-[#e5dcc8] grid place-items-center text-meta font-medium text-ink-2">
          L
        </div>
      </div>
    </header>
  );
}
