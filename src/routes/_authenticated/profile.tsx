import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Campus Lost & Found" },
      { name: "description", content: "Update your student profile details." },
      { property: "og:title", content: "My profile" },
      { property: "og:description", content: "Manage your campus lost and found profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: "", student_id: "", department: "", year: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        student_id: profile.student_id ?? "",
        department: profile.department ?? "",
        year: profile.year ?? "",
      });
    }
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name.trim().slice(0, 80),
        student_id: form.student_id.trim().slice(0, 40) || null,
        department: form.department.trim().slice(0, 80) || null,
        year: form.year.trim().slice(0, 20) || null,
      })
      .eq("id", profile.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profile updated");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
      </div>
      <form onSubmit={save} className="space-y-4 rounded-3xl border bg-card p-6 shadow-soft">
        <div className="space-y-2">
          <Label htmlFor="p-name">Full name</Label>
          <Input id="p-name" maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="p-sid">Student ID</Label>
            <Input id="p-sid" maxLength={40} value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-dep">Department</Label>
            <Input id="p-dep" maxLength={80} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-year">Year</Label>
            <Input id="p-year" maxLength={20} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </div>
        </div>
        <Button type="submit" className="rounded-xl" disabled={busy}>Save changes</Button>
      </form>
    </div>
  );
}
