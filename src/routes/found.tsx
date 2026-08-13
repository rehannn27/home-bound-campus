import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { ItemsBrowser } from "@/components/ItemsBrowser";

export const Route = createFileRoute("/found")({
  head: () => ({
    meta: [
      { title: "Found items — Campus Lost & Found Portal" },
      {
        name: "description",
        content: "Browse items found across campus and claim what belongs to you with proof.",
      },
      { property: "og:title", content: "Found items on campus" },
      { property: "og:description", content: "Browse everything handed in or found on campus." },
    ],
  }),
  component: FoundPage,
});

function FoundPage() {
  return (
    <PublicLayout>
      <div className="mb-6 animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold">Found items</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Items handed in by students. Recognise yours? Send a claim with proof.
        </p>
      </div>
      <ItemsBrowser kind="found" />
    </PublicLayout>
  );
}