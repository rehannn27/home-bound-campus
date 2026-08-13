import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Claim, Item } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/my-claims")({
  head: () => ({
    meta: [
      { title: "My claims — Campus Lost & Found" },
      { name: "description", content: "Track claim requests you sent and review claims on your posts." },
      { property: "og:title", content: "My claims" },
      { property: "og:description", content: "Review and approve campus item claims." },
    ],
  }),
  component: MyClaims,
});

function MyClaims() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["claims", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: claims } = await supabase
        .from("claims")
        .select("*")
        .order("created_at", { ascending: false });
      const list = (claims ?? []) as unknown as Claim[];
      const ids = [...new Set(list.map((c) => c.item_id))];
      const { data: items } = ids.length
        ? await supabase.from("items").select("*").in("id", ids)
        : { data: [] };
      const map = new Map(((items ?? []) as unknown as Item[]).map((i) => [i.id, i]));
      return list.map((c) => ({ claim: c, item: map.get(c.item_id) ?? null }));
    },
  });

  const decide = async (claim: Claim, status: "approved" | "rejected") => {
    const { error } = await supabase.from("claims").update({ status }).eq("id", claim.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (status === "approved") {
      await supabase.from("items").update({ status: "returned" }).eq("id", claim.item_id);
    }
    await notify(
      claim.claimer_id,
      status === "approved" ? "Your claim was approved — arrange the handover." : "Your claim was rejected.",
      "claim",
      `/items/${claim.item_id}`,
    );
    toast.success(`Claim ${status}`);
    void queryClient.invalidateQueries({ queryKey: ["claims"] });
    void queryClient.invalidateQueries({ queryKey: ["items"] });
  };

  const rows = data ?? [];
  const incoming = rows.filter((r) => r.claim.owner_id === user?.id);
  const outgoing = rows.filter((r) => r.claim.claimer_id === user?.id);

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold">Claims</h1>
        <p className="mt-1 text-sm text-muted-foreground">Requests on your posts and claims you sent.</p>
      </div>

      {isLoading && <Skeleton className="h-32 rounded-2xl" />}

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Requests to review</h2>
        {!isLoading && incoming.length === 0 && <p className="text-sm text-muted-foreground">No incoming claims.</p>}
        {incoming.map(({ claim, item }) => (
          <div key={claim.id} className="rounded-2xl border bg-card p-5 shadow-soft">
            <p className="font-semibold">{item?.title ?? "Item"}</p>
            <p className="mt-2 text-sm text-muted-foreground">{claim.proof}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {claim.status === "pending" ? (
                <>
                  <Button size="sm" className="rounded-xl" onClick={() => void decide(claim, "approved")}>Approve</Button>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => void decide(claim, "rejected")}>Reject</Button>
                </>
              ) : (
                <span className="text-sm font-semibold capitalize">{claim.status}</span>
              )}
              <Button asChild size="sm" variant="ghost" className="rounded-xl">
                <Link to="/chat/$peerId" params={{ peerId: claim.claimer_id }}>Message claimer</Link>
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Claims you sent</h2>
        {!isLoading && outgoing.length === 0 && <p className="text-sm text-muted-foreground">No claims sent yet.</p>}
        {outgoing.map(({ claim, item }) => (
          <div key={claim.id} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex-1">
              <p className="font-semibold">{item?.title ?? "Item"}</p>
              <p className="text-sm text-muted-foreground capitalize">Status: {claim.status}</p>
            </div>
            <Button asChild size="sm" variant="ghost" className="rounded-xl">
              <Link to="/chat/$peerId" params={{ peerId: claim.owner_id }}>Message poster</Link>
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
