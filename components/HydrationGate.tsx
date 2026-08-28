"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useNaturaStore } from "@/lib/store";

export function HydrationGate({ children }: { children: ReactNode }) {
  const hasHydrated = useNaturaStore((s) => s.hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hasHydrated) return;
    const id = window.setTimeout(() => {
      useNaturaStore.setState({ hasHydrated: true });
    }, 2500);
    return () => window.clearTimeout(id);
  }, [hasHydrated]);

  // Empty on the server and the first client paint so injected browser
  // attributes (e.g. Cursor's data-cursor-ref) cannot mismatch hydration.
  if (!mounted) {
    return (
      <div
        className="min-h-dvh bg-cream-50"
        aria-busy="true"
        suppressHydrationWarning
      />
    );
  }

  if (!hasHydrated) {
    return (
      <div
        className="mx-auto max-w-2xl space-y-4 px-4 py-8"
        aria-busy="true"
      >
        <div className="h-7 w-40 animate-pulse rounded-lg bg-cream-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-cream-200" />
        <div className="grid grid-cols-2 gap-3">
          <div className="card h-24 animate-pulse bg-cream-100" />
          <div className="card h-24 animate-pulse bg-cream-100" />
        </div>
        <div className="card h-36 animate-pulse bg-cream-100" />
      </div>
    );
  }

  return <>{children}</>;
}
