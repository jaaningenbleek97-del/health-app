"use client";

import { useEffect } from "react";
import {
  applyPersistedJson,
  enablePersistWrites,
  useNaturaStore,
} from "@/lib/store";

export function StoreHydration() {
  const hasHydrated = useNaturaStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated) return;
    try {
      applyPersistedJson(window.localStorage.getItem("natura-storage"));
    } catch {
      useNaturaStore.setState({ hasHydrated: true });
    } finally {
      enablePersistWrites();
    }
  }, [hasHydrated]);

  return null;
}
