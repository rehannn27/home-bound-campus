import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchItems } from "@/lib/api";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/my-posts")({
  head: () => ({
    meta: [
      { title: "My posts — Campus Lost & Found" },
      { name: "description", content: "Manage the lost and found reports you published." },
      { property: "og:title", content: "My posts" },
      { property: "og:description", content: "Manage your campus item reports." },
    ],
  }),
  component: MyPosts,
});

function MyPosts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["items"], queryFn: () => fetchItems() });
  const mine = (data ?? []).filter((i) => i.user_id === user?.id);

  const remove = async (id: string) => {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Post deleted");
    void queryClient.invalidateQueries({ queryKey: ["items"] });
  };

  const markReturned = async (id: string) => {
    const { error } = await supabase.from("items").update({ status: "returned" }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Marked as returned");
    void queryClient.invalidateQueries({ queryKey: ["items"] });
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold">My posts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything you have reported.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        {!isLoading && mine.length === 0 && (
          <p className="text-sm text-muted-foreground">You haven't posted anything yet.</p>
        )}
        {mine.map((item) => (
          <div key={item.id} className="space-y-2">
            <ItemCard item={item} />
            <div className="flex gap-2">
              {item.status !== "returned" && (
                <Button size="sm" variant="outline" className="flex-1 rounded-xl" onClick={() => void markReturned(item.id)}>
                  Mark returned
                </Button>
              )}
              <Button size="sm" variant="ghost" className="rounded-xl text-destructive" onClick={() => void remove(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
