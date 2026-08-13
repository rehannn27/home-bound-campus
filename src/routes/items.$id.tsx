import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { toast } from "sonner";
import { CalendarDays, Download, MapPin, MessageSquare, ShieldCheck, Tag } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { ItemImage } from "@/components/ItemImage";
import { KindBadge, StatusBadge } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchItem, fetchProfile, notify } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/items/$id")({
  head: () => ({
    meta: [
      { title: "Item details — Campus Lost & Found Portal" },
      {
        name: "description",
        content: "View full details of a reported campus item, scan its QR code and send a claim.",
      },
      { property: "og:title", content: "Item details — Campus Lost & Found" },
      { property: "og:description", content: "Reported item details, claims and secure chat." },
    ],
  }),
  component: ItemDetail,
});

function ItemDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qr, setQr] = useState<string | null>(null);
  const [proof, setProof] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: item, isLoading } = useQuery({ queryKey: ["item", id], queryFn: () => fetchItem(id) });
  const { data: poster } = useQuery({
    queryKey: ["profile", item?.user_id],
    enabled: !!item,
    queryFn: () => fetchProfile(item!.user_id),
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    void QRCode.toDataURL(`${window.location.origin}/items/${id}`, {
      width: 320,
      margin: 1,
      color: { dark: "#0b3a8f", light: "#ffffff" },
    }).then(setQr);
  }, [id]);

  const submitClaim = async () => {
    if (!user || !item) return;
    if (proof.trim().length < 15) {
      toast.error("Describe your proof in at least 15 characters");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("claims").insert({
      item_id: item.id,
      claimer_id: user.id,
      owner_id: item.user_id,
      proof: proof.trim().slice(0, 1000),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await notify(item.user_id, `New claim request on "${item.title}"`, "claim", `/items/${item.id}`);
    void queryClient.invalidateQueries({ queryKey: ["claims"] });
    setOpen(false);
    setProof("");
    toast.success("Claim submitted — you can now chat with the poster.");
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <Skeleton className="h-96 rounded-3xl" />
      </PublicLayout>
    );
  }

  if (!item) {
    return (
      <PublicLayout>
        <div className="rounded-3xl border bg-card p-12 text-center">
          <h1 className="text-xl font-semibold">Item not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have been removed by its owner or an admin.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link to="/lost">Browse lost items</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const isOwner = user?.id === item.user_id;

  return (
    <PublicLayout>
      <div className="grid animate-fade-up gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl border bg-card shadow-lift">
            <div className="aspect-[4/3] w-full">
              <ItemImage path={item.images[0] ?? null} alt={item.title} className="h-full w-full object-cover" />
            </div>
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 p-2">
                {item.images.slice(1, 5).map((p) => (
                  <div key={p} className="aspect-square overflow-hidden rounded-xl">
                    <ItemImage path={p} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={item.kind} />
              <StatusBadge status={item.status} />
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold">{item.title}</h1>
            <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{item.description}</p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Detail icon={Tag} label="Category" value={item.category} />
              <Detail icon={MapPin} label={item.kind === "lost" ? "Lost at" : "Found at"} value={item.location} />
              <Detail
                icon={CalendarDays}
                label="Date"
                value={new Date(item.occurred_on).toLocaleDateString()}
              />
              <Detail icon={ShieldCheck} label="Brand / colour" value={[item.brand, item.color].filter(Boolean).join(" · ") || "Not specified"} />
            </dl>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold text-muted-foreground">Posted by</h2>
            <p className="mt-1 text-lg font-semibold">{poster?.name ?? "Student"}</p>
            {poster?.department && (
              <p className="text-sm text-muted-foreground">
                {poster.department}
                {poster.year ? ` · Year ${poster.year}` : ""}
              </p>
            )}
            {item.contact && <p className="mt-2 text-sm">Contact: {item.contact}</p>}

            <div className="mt-5 space-y-2">
              {!user && (
                <Button asChild className="w-full rounded-xl">
                  <Link to="/auth">Sign in to claim or chat</Link>
                </Button>
              )}
              {user && !isOwner && item.status !== "returned" && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full rounded-xl">Send claim request</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Claim this item</DialogTitle>
                      <DialogDescription>
                        Describe details only the real owner would know — marks, contents, serial
                        numbers or purchase details.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      value={proof}
                      onChange={(e) => setProof(e.target.value)}
                      maxLength={1000}
                      rows={5}
                      placeholder="e.g. Navy backpack with a physics sticker on the front pocket and my ID card inside."
                    />
                    <DialogFooter>
                      <Button onClick={() => void submitClaim()} disabled={busy} className="rounded-xl">
                        Submit claim
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {user && !isOwner && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => void navigate({ to: "/chat/$peerId", params: { peerId: item.user_id } })}
                >
                  <MessageSquare className="h-4 w-4" /> Message poster
                </Button>
              )}
              {isOwner && (
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link to="/my-posts">Manage this post</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 text-center shadow-soft">
            <h2 className="text-sm font-semibold text-muted-foreground">Item QR code</h2>
            {qr ? (
              <img src={qr} alt="QR code linking to this item" width={200} height={200} className="mx-auto mt-3 rounded-xl" />
            ) : (
              <Skeleton className="mx-auto mt-3 h-[200px] w-[200px] rounded-xl" />
            )}
            <p className="mt-2 text-xs text-muted-foreground">Scanning opens this item page.</p>
            {qr && (
              <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
                <a href={qr} download={`item-${item.id}.png`}>
                  <Download className="h-4 w-4" /> Download
                </a>
              </Button>
            )}
          </div>
        </aside>
      </div>
    </PublicLayout>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}