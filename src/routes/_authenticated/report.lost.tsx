import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";

export const Route = createFileRoute("/_authenticated/report/lost")({
  head: () => ({
    meta: [
      { title: "Report a lost item — Campus Lost & Found" },
      { name: "description", content: "Post details and photos of an item you lost on campus." },
      { property: "og:title", content: "Report a lost item" },
      { property: "og:description", content: "Post a lost item report to your campus network." },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold">Report a lost item</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The more detail you add, the better our matching engine works.
        </p>
      </div>
      <ReportForm kind="lost" />
    </div>
  ),
});
