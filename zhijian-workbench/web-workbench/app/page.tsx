"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { HeroSection } from "@/components/HeroSection";
import { TaskCards } from "@/components/TaskCards";
import { QuickActions } from "@/components/QuickActions";
import { RecentList } from "@/components/RecentList";
import { StatusStrip } from "@/components/StatusStrip";
import { HealthBadge } from "@/components/HealthBadge";
import { AdminConsolePanel } from "@/components/AdminConsolePanel";
import { KnowledgeVaultPanel } from "@/components/KnowledgeVaultPanel";
import { WeeklyPlanPanel } from "@/components/WeeklyPlanPanel";
import type { SideNavPanel } from "@/components/SideNav";

const state: "default" | "empty" | "quota" = "default";

export default function Page() {
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const knowledgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onSideNav(e: Event) {
      const panel = (e as CustomEvent<SideNavPanel>).detail;
      if (panel === "weekly") {
        setWeeklyOpen(true);
      } else if (panel === "knowledge") {
        knowledgeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    window.addEventListener("sidenav:open", onSideNav);
    return () => window.removeEventListener("sidenav:open", onSideNav);
  }, []);

  return (
    <AppShell>
      <HeroSection state={state} />
      <TaskCards />
      <QuickActions />
      <div ref={knowledgeRef}>
        <KnowledgeVaultPanel />
      </div>
      <AdminConsolePanel />
      <RecentList />
      <StatusStrip />
      <HealthBadge />
      <WeeklyPlanPanel open={weeklyOpen} onClose={() => setWeeklyOpen(false)} />
    </AppShell>
  );
}
