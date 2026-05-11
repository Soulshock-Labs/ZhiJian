import { Card, CardTitle, CardBody, CardFooter } from "./ui/Card";
import { Tag } from "./ui/Tag";
import { workbenchData } from "@/lib/workbench-data";

export function TaskCards() {
  return (
    <section className="pb-9">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workbenchData.tasks.map((t) => (
          <Card key={t.id} hover>
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
  );
}
