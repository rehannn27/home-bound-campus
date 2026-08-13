import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/chat/")({
  head: () => ({
    meta: [
      { title: "Messages — Campus Lost & Found" },
      { name: "description", content: "Your private conversations about campus items." },
      { property: "og:title", content: "Messages" },
      { property: "og:description", content: "Chat securely with finders and owners." },
    ],
  }),
  component: ChatList,
});

function ChatList() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      const list = (msgs ?? []) as unknown as Message[];
      const peers = new Map<string, Message>();
      for (const m of list) {
        const peer = m.sender_id === user!.id ? m.receiver_id : m.sender_id;
        if (!peers.has(peer)) peers.set(peer, m);
      }
      const ids = [...peers.keys()];
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id,name").in("id", ids)
        : { data: [] };
      const names = new Map((profiles ?? []).map((p) => [p.id as string, p.name as string]));
      return ids.map((id) => ({ id, name: names.get(id) ?? "Student", last: peers.get(id)! }));
    },
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Conversations with finders and owners.</p>
      </div>
      <div className="space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No conversations yet.</p>
        )}
        {(data ?? []).map((c) => (
          <Link
            key={c.id}
            to="/chat/$peerId"
            params={{ peerId: c.id }}
            className="block rounded-2xl border bg-card p-4 shadow-soft transition hover:shadow-lift"
          >
            <p className="font-semibold">{c.name}</p>
            <p className="truncate text-sm text-muted-foreground">{c.last.content}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
