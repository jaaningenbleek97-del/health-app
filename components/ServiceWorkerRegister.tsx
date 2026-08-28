"use client";

import { useEffect } from "react";

async function unregisterNaturaWorkers() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((reg) => reg.unregister()));
  if (!("caches" in window)) return;
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((key) => key.startsWith("natura-")).map((key) => caches.delete(key))
  );
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      void unregisterNaturaWorkers();
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline cache is optional */
    });
  }, []);
  return null;
}
