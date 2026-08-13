import { supabase } from "@/integrations/supabase/client";
import type { Item, ItemKind } from "./types";

export async function fetchItems(kind?: ItemKind) {
  let q = supabase.from("items").select("*").order("created_at", { ascending: false });
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Item[];
}

export async function fetchItem(id: string) {
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown as Item) ?? null;
}

export async function fetchProfile(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,email,student_id,profile_image,department,year,banned,created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function notify(
  userId: string,
  message: string,
  type: string,
  link?: string,
) {
  await supabase.from("notifications").insert({ user_id: userId, message, type, link: link ?? null });
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","of","in","on","at","my","with","for","to","is","it","was","near","from","this","that","i",
]);

function keywords(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );
}

export function matchScore(a: Item, b: Item) {
  let score = 0;
  if (a.category && a.category === b.category) score += 35;
  if (a.brand && b.brand && a.brand.toLowerCase().trim() === b.brand.toLowerCase().trim()) score += 25;
  if (a.color && b.color && a.color.toLowerCase().trim() === b.color.toLowerCase().trim()) score += 15;
  const ka = keywords(`${a.title} ${a.description}`);
  const kb = keywords(`${b.title} ${b.description}`);
  let overlap = 0;
  ka.forEach((w) => {
    if (kb.has(w)) overlap += 1;
  });
  score += Math.min(25, overlap * 8);
  return Math.min(100, score);
}

/** Compare a freshly created item against the opposite pool and notify both sides. */
export async function runSmartMatching(item: Item) {
  const opposite: ItemKind = item.kind === "lost" ? "found" : "lost";
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("kind", opposite)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(100);

  const candidates = ((data ?? []) as unknown as Item[])
    .map((other) => ({ other, score: matchScore(item, other) }))
    .filter((m) => m.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  for (const { other, score } of candidates) {
    await notify(
      item.user_id,
      `Possible match (${score}%): "${other.title}" was reported ${other.kind}.`,
      "match",
      `/items/${other.id}`,
    );
    if (other.user_id !== item.user_id) {
      await notify(
        other.user_id,
        `Possible match (${score}%): "${item.title}" was reported ${item.kind}.`,
        "match",
        `/items/${item.id}`,
      );
    }
  }
  return candidates;
}