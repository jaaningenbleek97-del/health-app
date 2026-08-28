"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { HydrationGate } from "@/components/HydrationGate";
import { Onboarding } from "@/components/Onboarding";
import { ReminderScheduler } from "@/components/ReminderScheduler";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { StoreHydration } from "@/components/StoreHydration";
import { useNaturaStore } from "@/lib/store";

export function AppFrame({ children }: { children: ReactNode }) {
  const onboarded = useNaturaStore((s) => s.onboardingComplete);

  return (
    <>
      <StoreHydration />
      <ServiceWorkerRegister />
      <HydrationGate>
        {onboarded ? (
          <AppShell>
            <ReminderScheduler />
            {children}
          </AppShell>
        ) : (
          <Onboarding />
        )}
      </HydrationGate>
    </>
  );
}
