"use client";

import { useEffect } from "react";
import { allRemedies, allWorkouts } from "@/lib/catalog";
import { scheduleTodayNotifications } from "@/lib/reminders";
import { combinedReminders } from "@/lib/schedule";
import { useNaturaStore } from "@/lib/store";

/** Keeps clock + interval reminder timers running while the tab is open. */
export function ReminderScheduler() {
  const reminders = useNaturaStore((s) => s.reminders);
  const weeklySchedule = useNaturaStore((s) => s.weeklySchedule);
  const stack = useNaturaStore((s) => s.stack);
  const customWorkouts = useNaturaStore((s) => s.customWorkouts);
  const customRemedies = useNaturaStore((s) => s.customRemedies);
  const circadianPrefs = useNaturaStore((s) => s.circadianPrefs);

  useEffect(() => {
    const merged = combinedReminders(
      reminders.filter((r) => r.enabled),
      weeklySchedule,
      stack,
      allWorkouts(customWorkouts),
      allRemedies(customRemedies),
      { circadian: circadianPrefs }
    );
    scheduleTodayNotifications(merged.filter((r) => r.enabled));
  }, [
    reminders,
    weeklySchedule,
    stack,
    customWorkouts,
    customRemedies,
    circadianPrefs,
  ]);

  return null;
}
