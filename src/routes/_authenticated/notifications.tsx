import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppNotification } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Campus Lost & Found" },
      { name: "description", content: "Match alerts, claim requests and message updates." },
      { property: "og:title", content: "Notifications" },
      { property: "og:description", content: "Your campus lost and found alerts." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as AppNotification[];
    },
  });

  const markAll = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Matches, claims and messages.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void markAll()}>
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        )}
        {(data ?? []).map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-soft ${n.is_read ? "bg-card" : "bg-accent"}`}
          >
            <Bell className="mt-0.5 h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            {n.link && (
              <a href={n.link} className="text-xs font-semibold text-primary underline">
                Open
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
