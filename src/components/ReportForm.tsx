import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ImageUploader } from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAMPUS_LOCATIONS, CATEGORIES } from "@/lib/constants";
import { runSmartMatching } from "@/lib/api";
import type { Item, ItemKind } from "@/lib/types";

export function ReportForm({ kind }: { kind: ItemKind }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    brand: "",
    color: "",
    location: "",
    occurred_on: new Date().toISOString().slice(0, 10),
    contact: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (form.title.trim().length < 3) {
      toast.error("Give the item a clearer title");
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error("Add a short description (10+ characters)");
      return;
    }
    if (!form.category || !form.location) {
      toast.error("Select a category and location");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("items")
      .insert({
        kind,
        title: form.title.trim().slice(0, 120),
        description: form.description.trim().slice(0, 2000),
        category: form.category,
        brand: form.brand.trim().slice(0, 60) || null,
        color: form.color.trim().slice(0, 40) || null,
        location: form.location,
        occurred_on: form.occurred_on,
        contact: form.contact.trim().slice(0, 120) || null,
        images,
        user_id: user.id,
      })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not save the report");
      return;
    }
    toast.success("Report published");
    void queryClient.invalidateQueries({ queryKey: ["items"] });
    void runSmartMatching(data as unknown as Item);
    void navigate({ to: "/items/$id", params: { id: (data as { id: string }).id } });
  };

  return (
    <form onSubmit={submit} className="animate-fade-up space-y-6 rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Item title</Label>
          <Input id="title" maxLength={120} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Navy backpack" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" rows={4} maxLength={2000} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Distinguishing marks, contents, where you last saw it…" required />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{kind === "lost" ? "Where did you lose it?" : "Where did you find it?"}</Label>
          <Select value={form.location} onValueChange={(v) => set("location", v)}>
            <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
            <SelectContent>
              {CAMPUS_LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand (optional)</Label>
          <Input id="brand" maxLength={60} value={form.brand} onChange={(e) => set("brand", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Colour (optional)</Label>
          <Input id="color" maxLength={40} value={form.color} onChange={(e) => set("color", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={form.occurred_on} onChange={(e) => set("occurred_on", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contact (optional)</Label>
          <Input id="contact" maxLength={120} value={form.contact} onChange={(e) => set("contact", e.target.value)} placeholder="Phone or preferred contact" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Photos</Label>
        {user && <ImageUploader userId={user.id} paths={images} onChange={setImages} />}
      </div>

      <Button type="submit" size="lg" className="rounded-xl" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Publish report
      </Button>
    </form>
  );
}