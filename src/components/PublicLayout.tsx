import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, PackageSearch, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-soft-gradient">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-hero-gradient text-primary-foreground">
              <PackageSearch className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold">Campus Lost &amp; Found</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/lost">Lost</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/found">Found</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/scan">Scan QR</Link>
            </Button>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="ml-auto sm:ml-0"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild size="sm" className="rounded-xl">
            <Link to={user ? "/dashboard" : "/auth"}>{user ? "Dashboard" : "Sign in"}</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Campus Lost &amp; Found Portal — helping students reunite with their belongings.
      </footer>
    </div>
  );
}