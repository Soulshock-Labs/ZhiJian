import { AppShell } from "@/components/AppShell";
import { HeroSection } from "@/components/HeroSection";
import { TaskCards } from "@/components/TaskCards";
import { QuickActions } from "@/components/QuickActions";
import { RecentList } from "@/components/RecentList";
import { StatusStrip } from "@/components/StatusStrip";

// Switch to 'empty' | 'quota' to preview those states.
const state: "default" | "empty" | "quota" = "default";

export default function Page() {
  return (
    <AppShell>
      <HeroSection state={state} />
      <TaskCards />
      <QuickActions />
      <RecentList />
      <StatusStrip />
    </AppShell>
  );
}
