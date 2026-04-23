import { type ReactNode } from "react";
import { TopNav } from "./TopNav";
import { SideNav } from "./SideNav";
import { TopNavMobile, TabBar } from "./TopNavMobile";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Desktop shell */}
      <div id="top" className="hidden md:block min-h-screen">
        <TopNav />
        <div className="flex" style={{ minHeight: "calc(100vh - var(--nav-h-desktop))" }}>
          <SideNav />
          <main className="flex-1 max-w-[var(--container-max)] px-7 py-9">{children}</main>
        </div>
      </div>

      {/* Mobile shell */}
      <div id="top-mobile" className="md:hidden min-h-screen pb-[var(--tabbar-h-mobile)]">
        <TopNavMobile />
        <main className="px-4 py-5">{children}</main>
        <TabBar />
      </div>
    </>
  );
}
