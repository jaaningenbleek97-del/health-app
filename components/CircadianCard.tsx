"use client";

import Link from "next/link";
import { useMemo } from "react";
import { pillarLabels } from "@/data/protocols";
import { circadianClock, normalizeCircadianPrefs } from "@/lib/circadian";
import { formatClock } from "@/lib/sun";
import { useNaturaStore } from "@/lib/store";

export function CircadianCard() {
  const rawPrefs = useNaturaStore((s) => s.circadianPrefs);
  const checkins = useNaturaStore((s) => s.checkins);
  const getTodayCheckin = useNaturaStore((s) => s.getTodayCheckin);
  const setTodayEating = useNaturaStore((s) => s.setTodayEating);
  const applied = useNaturaStore((s) => s.weeklySchedule.appliedFoundationId);

  const prefs = useMemo(() => normalizeCircadianPrefs(rawPrefs), [rawPrefs]);
  const clock = useMemo(() => circadianClock(prefs), [prefs]);
  const checkin = useMemo(() => {
    void checkins;
    return getTodayCheckin();
  }, [checkins, getTodayCheckin]);

  return (
    <section className="card space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-sage-900">Today’s light</h2>
          <p className="text-xs text-sage-500">
            {prefs.locationLabel} · sunrise {formatClock(clock.sunriseHm)} ·
            sunset {formatClock(clock.sunsetHm)}
          </p>
        </div>
        <Link
          href="/foundations"
          className="shrink-0 text-xs font-medium text-sage-700 underline"
        >
          Settings
        </Link>
      </div>
      <p className="text-xs text-sage-600">
        Morning light {formatClock(clock.lightHm)} · dim the house{" "}
        {formatClock(clock.dimHm)}
        {prefs.eatingWindowEnabled
          ? ` · eat ${formatClock(prefs.eatingStart)}–${formatClock(prefs.eatingEnd)}`
          : ""}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs font-medium text-sage-600">First bite</span>
          <input
            type="time"
            className="mt-1 w-full rounded-lg border border-cream-200 bg-white px-2 py-1.5 text-sm"
            value={checkin.firstBiteAt ?? ""}
            onChange={(e) => setTodayEating({ firstBiteAt: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-sage-600">Last bite</span>
          <input
            type="time"
            className="mt-1 w-full rounded-lg border border-cream-200 bg-white px-2 py-1.5 text-sm"
            value={checkin.lastBiteAt ?? ""}
            onChange={(e) => setTodayEating({ lastBiteAt: e.target.value })}
          />
        </label>
      </div>
      {applied && (
        <p className="text-xs text-sage-500">
          This week: {pillarLabels[applied]}.{" "}
          <Link href="/foundations" className="underline">
            Change
          </Link>
        </p>
      )}
    </section>
  );
}
