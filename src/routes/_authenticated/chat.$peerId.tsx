import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile, notify } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Message } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/chat/$peerId")({
  head: () => ({
    meta: [
      { title: "Conversation — Campus Lost & Found" },
      { name: "description", content: "Private real-time chat about a campus item." },
      { property: "og:title", content: "Conversation" },
      { property: "og:description", content: "Private chat with a student about an item." },
    ],
  }),
  component: ChatRoom,
});

function ChatRoom() {
  const { peerId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: peer } = useQuery({ queryKey: ["profile", peerId], queryFn: () => fetchProfile(peerId) });
  const { data: messages } = useQuery({
    queryKey: ["messages", peerId],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${user!.id})`)
        .order("created_at", { ascending: true });
      return (data ?? []) as unknown as Message[];
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`chat-${peerId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["messages", peerId] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, peerId, queryClient]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim().slice(0, 1000);
    if (!content || !user) return;
    setText("");
    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: user.id, receiver_id: peerId, content });
    if (error) {
      toast.error(error.message);
      return;
    }
    await notify(peerId, "You have a new message.", "message", "/chat");
    void queryClient.invalidateQueries({ queryKey: ["messages", peerId] });
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col rounded-3xl border bg-card shadow-soft">
      <div className="border-b p-4">
        <p className="font-semibold">{peer?.name ?? "Student"}</p>
        <p className="text-xs text-muted-foreground">Private conversation</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {(messages ?? []).length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Say hello to start the conversation.</p>
        )}
        {(messages ?? []).map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
              m.sender_id === user?.id
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t p-4">
        <Input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Write a message…" />
        <Button type="submit" className="rounded-xl"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
