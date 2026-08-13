import { cn } from "@/lib/utils";
import type { ItemKind, ItemStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";

export function KindBadge({ kind }: { kind: ItemKind }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase backdrop-blur",
        kind === "lost"
          ? "bg-destructive/90 text-destructive-foreground"
          : "bg-success/90 text-success-foreground",
      )}
    >
      {kind}
    </span>
  );
}

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur",
        status === "returned" && "bg-primary/90 text-primary-foreground",
        status === "claimed" && "bg-warning/90 text-warning-foreground",
        status === "open" && "bg-background/85 text-foreground",
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}