import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan item QR — Campus Lost & Found Portal" },
      {
        name: "description",
        content: "Scan an item's QR code with your camera to open its page instantly.",
      },
      { property: "og:title", content: "Scan an item QR code" },
      { property: "og:description", content: "Point your camera at a tagged item to open its page." },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;

    void (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner as unknown as { stop: () => Promise<void>; clear: () => void };
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decoded: string) => {
            const match = /\/items\/([0-9a-f-]{36})/i.exec(decoded);
            void scanner.stop().then(() => scanner.clear());
            setScanning(false);
            if (match?.[1]) {
              void navigate({ to: "/items/$id", params: { id: match[1] } });
            } else {
              setError("That QR code isn't a campus item tag.");
            }
          },
          () => {},
        );
      } catch {
        if (!cancelled) {
          setError("Camera unavailable. Check browser permissions and try again.");
          setScanning(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      scannerRef.current = null;
      if (s) void s.stop().then(() => s.clear()).catch(() => {});
    };
  }, [scanning, navigate]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl animate-fade-up rounded-3xl border bg-card p-8 text-center shadow-lift">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <ScanLine className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Scan an item QR code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Point your camera at the QR tag on an item to open its page.
        </p>

        <div
          id="qr-reader"
          className="mx-auto mt-6 overflow-hidden rounded-2xl border bg-muted"
          style={{ minHeight: scanning ? 300 : 0 }}
        />

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <Button
          className="mt-6 rounded-xl"
          onClick={() => {
            setError(null);
            setScanning((v) => !v);
          }}
        >
          {scanning ? "Stop camera" : "Start scanning"}
        </Button>
      </div>
    </PublicLayout>
  );
}