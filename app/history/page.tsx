"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useNaturaStore } from "@/lib/store";
import { energyTone, historyDays, historyRecap } from "@/lib/week";

export default function HistoryPage() {
  const logs = useNaturaStore((s) => s.workoutLogs);
  const checkins = useNaturaStore((s) => s.checkins);
  const stack = useNaturaStore((s) => s.stack);
  const streak = useNaturaStore((s) => s.getStreak());

  const days = useMemo(
    () => historyDays({ logs, checkins, stack, weeks: 4 }),
    [logs, checkins, stack]
  );
  const recap = useMemo(() => historyRecap(days), [days]);
  const weeks = [0, 1, 2, 3].map((i) => days.slice(i * 7, i * 7 + 7));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-sage-900">Last 4 weeks</h1>
        <p className="mt-1 text-sm text-sage-600">
          Sessions, supplement days, and habit taps on this device.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Streak" value={`${streak}d`} />
        <Stat label="Sessions" value={`${recap.sessions}`} />
        <Stat
          label="Supplement days"
          value={stack.length ? `${recap.stackPct}%` : "—"}
        />
        <Stat label="Habit days" value={`${recap.habitDays}`} />
        <Stat
          label="Avg energy"
          value={recap.avgEnergy == null ? "—" : `${recap.avgEnergy}`}
        />
      </section>

      <section className="card space-y-4 p-4">
        {weeks.map((week) => (
          <div key={week[0]?.key}>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-sage-500">
              {week[0]
                ? new Date(week[0].key + "T12:00:00").toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric" }
                  )
                : ""}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {week.map((day) => {
                const stackFull =
                  day.stackTotal > 0 && day.stackDone === day.stackTotal;
                return (
                  <div
                    key={day.key}
                    className={`rounded-xl px-1 py-2 text-center ${
                      day.isToday ? "bg-sage-100" : "bg-cream-50"
                    } ${day.isFuture ? "opacity-40" : ""}`}
                    title={`${day.weekday} ${day.label}`}
                  >
                    <div className="text-[10px] text-sage-500">{day.weekday}</div>
                    <div className="text-sm font-semibold">{day.label}</div>
                    <div className="mt-1 flex justify-center gap-0.5 text-[10px]">
                      <span title="Workout">{day.workoutDone ? "●" : "○"}</span>
                      <span title="Supplements">
                        {day.stackTotal === 0
                          ? ""
                          : stackFull
                            ? "●"
                            : day.stackDone > 0
                              ? "◐"
                              : "○"}
                      </span>
                      <span title="Habits">
                        {day.habits.length ? "·" : ""}
                      </span>
                    </div>
                    {day.energy ? (
                      <div
                        className={`text-[10px] font-semibold ${energyTone(day.energy)}`}
                      >
                        {day.energy}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <p className="text-[11px] text-sage-500">
          Left = movement · middle = supplements · number = energy 1–5
        </p>
      </section>

      <Link href="/" className="btn-secondary w-full">
        Back to today’s plan
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xl font-bold text-sage-800">{value}</div>
      <div className="text-[11px] text-sage-600">{label}</div>
    </div>
  );
}
