import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BellRing,
  MessagesSquare,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import heroImage from "@/assets/hero-campus.jpg";
import { PublicLayout } from "@/components/PublicLayout";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchItems } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Lost & Found Portal — Report and recover items" },
      {
        name: "description",
        content:
          "Report lost or found items on campus, get smart match alerts, chat securely and claim your belongings with QR-verified handover.",
      },
      { property: "og:title", content: "Campus Lost & Found Portal" },
      {
        property: "og:description",
        content: "Report lost or found items on campus and recover them fast.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Sparkles,
    title: "Smart matching",
    body: "Every new report is compared against the opposite pool by category, brand, colour and description keywords.",
  },
  {
    icon: QrCode,
    title: "QR tagging",
    body: "Each item gets a unique QR code. Download it, stick it on your gear, and finders land straight on its page.",
  },
  {
    icon: MessagesSquare,
    title: "Private chat",
    body: "Talk to the finder or owner in real time — only after a claim request or a confirmed match.",
  },
  {
    icon: ShieldCheck,
    title: "Verified claims",
    body: "Claimers submit proof, the poster approves or rejects, and the item is marked returned.",
  },
  {
    icon: BellRing,
    title: "Live notifications",
    body: "Instant alerts for matches, claim requests, messages and status changes.",
  },
];

function Landing() {
  const { user } = useAuth();
  const { data: items, isLoading } = useQuery({ queryKey: ["items"], queryFn: () => fetchItems() });
  const recent = (items ?? []).slice(0, 6);
  const returned = (items ?? []).filter((i) => i.status === "returned").length;

  return (
    <PublicLayout>
      <section className="animate-fade-up overflow-hidden rounded-3xl border bg-card shadow-lift">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="space-y-6 p-8 sm:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Built for campus communities
            </span>
            <h1 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl">
              Lost something on campus? Get it back.
            </h1>
            <p className="max-w-prose text-base text-muted-foreground">
              Post lost and found items in seconds. Our matching engine links reports automatically,
              alerts both students, and walks you through a verified handover.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link to={user ? "/report/lost" : "/auth"}>
                  Report a lost item <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/found">Browse found items</Link>
              </Button>
            </div>
            <dl className="grid max-w-md grid-cols-3 gap-4 pt-4">
              {[
                { label: "Reports", value: items?.length ?? 0 },
                { label: "Found posts", value: (items ?? []).filter((i) => i.kind === "found").length },
                { label: "Returned", value: returned },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border bg-background p-3">
                  <dt className="text-xs text-muted-foreground">{s.label}</dt>
                  <dd className="font-display text-2xl font-bold">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative h-64 lg:h-full">
            <img
              src={heroImage}
              alt="Students walking through a campus corridor past a forgotten backpack and keys"
              width={1600}
              height={1008}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="animate-fade-up rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Latest reports</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/lost">View all</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          {!isLoading && recent.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No reports yet — be the first to post one.
            </p>
          )}
          {recent.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
