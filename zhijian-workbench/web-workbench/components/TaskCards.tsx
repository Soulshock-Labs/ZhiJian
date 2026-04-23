"use client";

import { useState } from "react";
import { Card, CardTitle, CardBody, CardFooter } from "./ui/Card";
import { Tag } from "./ui/Tag";
import { workbenchData } from "@/lib/workbench-data";
import { WeeklyPlanPanel } from "./WeeklyPlanPanel";

export function TaskCards() {
  const [weeklyOpen, setWeeklyOpen] = useState(false);

  const handleCardClick = (id: string) => {
    if (id === "weekly") setWeeklyOpen(true);
    // TODO: id === "lesson" → DailyPlanPanel; id === "obs" → ObsPanel
  };

  return (
    <>
      <section className="pb-9">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workbenchData.tasks.map((t) => (
            <Card
              key={t.id}
              hover
              onClick={() => handleCardClick(t.id)}
            >
              <Tag tone={t.tone} dot>{t.tag}</Tag>
              <div className="mt-3">
                <CardTitle>{t.title}</CardTitle>
                <CardBody>{t.body}</CardBody>
              </div>
              <CardFooter>
                <span>{t.meta}</span>
                <span className="text-brand font-medium">→</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <WeeklyPlanPanel
        open={weeklyOpen}
        onClose={() => setWeeklyOpen(false)}
      />
    </>
  );
}
