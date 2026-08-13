import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";
import type { Item } from "@/lib/types";
import { ItemImage } from "./ItemImage";
import { StatusBadge, KindBadge } from "./Badges";

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      to="/items/$id"
      params={{ id: item.id }}
      className="group animate-fade-up overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <ItemImage
          path={item.images[0] ?? null}
          alt={item.title}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <KindBadge kind={item.kind} />
          <StatusBadge status={item.status} />
        </div>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="truncate text-base font-semibold">{item.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {item.location || "Unknown"}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> {item.occurred_on}
          </span>
        </div>
      </div>
    </Link>
  );
}