import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchItems } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Campus Lost & Found" },
      { name: "description", content: "Moderate users, reports and claims across the portal." },
      { property: "og:title", content: "Admin dashboard" },
      { property: "og:description", content: "Moderation and analytics for campus lost and found." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["items"], queryFn: () => fetchItems() });
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return (data ?? []) as unknown as Profile[];
    },
  });

  if (!isAdmin) {
    return (
      <div className="rounded-3xl border bg-card p-10 text-center">
        <h1 className="text-xl font-semibold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">You don't have access to this area.</p>
      </div>
    );
  }

  const toggleBan = async (p: Profile) => {
    const { error } = await supabase.from("profiles").update({ banned: !p.banned }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(p.banned ? "User unbanned" : "User banned");
    void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Report removed");
    void queryClient.invalidateQueries({ queryKey: ["items"] });
  };

  const all = items ?? [];

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Moderate users and reports.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Users", value: users?.length ?? 0 },
          { label: "Reports", value: all.length },
          { label: "Open", value: all.filter((i) => i.status === "open").length },
          { label: "Returned", value: all.filter((i) => i.status === "returned").length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-soft">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="font-display text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Users</h2>
        {(users ?? []).map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex-1">
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
            <Button size="sm" variant={u.banned ? "outline" : "ghost"} className="rounded-xl" onClick={() => void toggleBan(u)}>
              {u.banned ? "Unban" : "Ban"}
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Reports</h2>
        {all.map((i) => (
          <div key={i.id} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex-1">
              <p className="font-semibold">{i.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{i.kind} · {i.category} · {i.status}</p>
            </div>
            <Button size="sm" variant="ghost" className="rounded-xl text-destructive" onClick={() => void removeItem(i.id)}>
              Delete
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
