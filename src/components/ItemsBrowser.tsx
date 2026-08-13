import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ItemCard } from "@/components/ItemCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAMPUS_LOCATIONS, CATEGORIES } from "@/lib/constants";
import { fetchItems } from "@/lib/api";
import type { ItemKind } from "@/lib/types";

export function ItemsBrowser({ kind }: { kind: ItemKind }) {
  const { data, isLoading } = useQuery({
    queryKey: ["items", kind],
    queryFn: () => fetchItems(kind),
  });
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [status, setStatus] = useState("all");

  const items = useMemo(() => {
    const term = q.toLowerCase().trim();
    return (data ?? []).filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (location !== "all" && i.location !== location) return false;
      if (status !== "all" && i.status !== status) return false;
      if (!term) return true;
      return `${i.title} ${i.description} ${i.brand ?? ""} ${i.color ?? ""} ${i.location}`
        .toLowerCase()
        .includes(term);
    });
  }, [data, q, category, location, status]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, brand, colour…"
            className="pl-9"
            maxLength={80}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {CAMPUS_LOCATIONS.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="claimed">Claim pending</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        {!isLoading && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No items match your filters.</p>
        )}
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}