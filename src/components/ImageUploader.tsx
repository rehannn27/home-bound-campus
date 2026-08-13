import { useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ItemImage } from "./ItemImage";

export function ImageUploader({
  userId,
  paths,
  onChange,
  max = 4,
}: {
  userId: string;
  paths: string[];
  onChange: (paths: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = max - paths.length;
    const chosen = Array.from(files).slice(0, room);
    if (!chosen.length) {
      toast.error(`You can upload up to ${max} photos.`);
      return;
    }
    setUploading(true);
    const next: string[] = [];
    for (const file of chosen) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB.`);
        continue;
      }
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("item-images").upload(path, file);
      if (error) toast.error(error.message);
      else next.push(path);
    }
    setUploading(false);
    if (next.length) onChange([...paths, ...next]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = async (path: string) => {
    onChange(paths.filter((p) => p !== path));
    await supabase.storage.from("item-images").remove([path]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {paths.map((p) => (
          <div key={p} className="relative h-24 w-24 overflow-hidden rounded-xl border">
            <ItemImage path={p} alt="Uploaded item photo" className="h-full w-full" />
            <button
              type="button"
              onClick={() => void remove(p)}
              aria-label="Remove photo"
              className="absolute top-1 right-1 rounded-full bg-background/90 p-1 text-foreground shadow-sm transition hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {paths.length < max && (
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="h-24 w-24 flex-col gap-1 border-dashed"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span className="text-xs">Photo</span>
              </>
            )}
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">Up to {max} photos, 5MB each.</p>
    </div>
  );
}