import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { ItemsBrowser } from "@/components/ItemsBrowser";

export const Route = createFileRoute("/lost")({
  head: () => ({
    meta: [
      { title: "Lost items — Campus Lost & Found Portal" },
      {
        name: "description",
        content: "Browse every lost item reported on campus and filter by category, location and date.",
      },
      { property: "og:title", content: "Lost items on campus" },
      { property: "og:description", content: "Browse and search all reported lost items." },
    ],
  }),
  component: LostPage,
});

function LostPage() {
  return (
    <PublicLayout>
      <div className="mb-6 animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold">Lost items</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Something here looks familiar? Open it and send a claim request.
        </p>
      </div>
      <ItemsBrowser kind="lost" />
    </PublicLayout>
  );
}