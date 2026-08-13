import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function useSignedUrl(path?: string | null) {
  return useQuery({
    queryKey: ["signed-url", path],
    enabled: !!path,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("item-images")
        .createSignedUrl(path!, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

export function ItemImage({
  path,
  alt,
  className,
}: {
  path?: string | null;
  alt: string;
  className?: string;
}) {
  const { data, isLoading } = useSignedUrl(path);

  if (!path) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="h-6 w-6" aria-hidden />
      </div>
    );
  }
  if (isLoading || !data) return <Skeleton className={className} />;
  return <img src={data} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
}