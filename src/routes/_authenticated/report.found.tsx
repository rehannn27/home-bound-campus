import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";

export const Route = createFileRoute("/_authenticated/report/found")({
  head: () => ({
    meta: [
      { title: "Report a found item — Campus Lost & Found" },
      { name: "description", content: "Hand in an item you found on campus and help it get home." },
      { property: "og:title", content: "Report a found item" },
      { property: "og:description", content: "Post a found item so its owner can claim it." },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold">Report a found item</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Thanks for helping out — the owner will be notified if we find a match.
        </p>
      </div>
      <ReportForm kind="found" />
    </div>
  ),
});
