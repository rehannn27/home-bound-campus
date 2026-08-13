import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  HandHeart,
  PackageSearch,
  PlusCircle,
  ScanLine,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchItems } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppNotification } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Campus Lost & Found Portal" },
      { name: "description", content: "Your campus lost and found activity at a glance." },
      { property: "og:title", content: "Dashboard — Campus Lost & Found" },
      { property: "og:description", content: "Track reports, matches and claims in one place." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: items, isLoading } = useQuery({ queryKey: ["items"], queryFn: () => fetchItems() });
  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return (data ?? []) as unknown as AppNotification[];
    },
  });

  const all = items ?? [];
  const stats = [
    { label: "Lost reports", value: all.filter((i) => i.kind === "lost").length, icon: PackageSearch },
    { label: "Found reports", value: all.filter((i) => i.kind === "found").length, icon: HandHeart },
    { label: "Returned", value: all.filter((i) => i.status === "returned").length, icon: CheckCircle2 },
    { label: "My posts", value: all.filter((i) => i.user_id === user?.id).length, icon: PlusCircle },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Campus recovery activity and your latest updates.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="animate-fade-up rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction to="/report/lost" icon={PackageSearch} label="Report lost item" />
        <QuickAction to="/report/found" icon={HandHeart} label="Report found item" />
        <QuickAction to="/scan" icon={ScanLine} label="Scan an item QR" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold">Recent activity</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/lost">See all</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {isLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            {!isLoading && all.length === 0 && (
              <p className="text-sm text-muted-foreground">No reports yet.</p>
            )}
            {all.slice(0, 4).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold">Latest notifications</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/notifications">All</Link>
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {(notifications ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing yet — you're all caught up.</p>
            )}
            {(notifications ?? []).map((n) => (
              <div key={n.id} className="rounded-2xl border bg-card p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: "/report/lost" | "/report/found" | "/scan";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="animate-fade-up flex items-center gap-3 rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-hero-gradient text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-semibold">{label}</span>
    </Link>
  );
}