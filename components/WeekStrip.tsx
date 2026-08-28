"use client";

import { energyTone, type DaySummary } from "@/lib/week";

export function WeekStrip({
  days,
  bare = false,
}: {
  days: DaySummary[];
  bare?: boolean;
}) {
  return (
    <div className={bare ? "" : "card p-3"}>
      {!bare && (
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-sage-500">
        This week
      </div>
      )}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const stackFull =
            day.stackTotal > 0 && day.stackDone === day.stackTotal;
          return (
            <div
              key={day.key}
              className={`rounded-xl px-1 py-2 text-center ${
                day.isToday ? "bg-sage-100" : "bg-cream-50"
              } ${day.isFuture ? "opacity-50" : ""}`}
            >
              <div className="text-[10px] font-medium text-sage-500">
                {day.weekday}
              </div>
              <div className="text-sm font-semibold text-sage-900">
                {day.label}
              </div>
              <div className="mt-1 flex justify-center gap-0.5 text-[10px]">
                <span title="Workout">
                  {day.workoutDone ? "●" : day.isFuture ? "·" : "○"}
                </span>
                <span title="Supplements">
                  {day.stackTotal === 0
                    ? ""
                    : stackFull
                      ? "●"
                      : day.stackDone > 0
                        ? "◐"
                        : day.isFuture
                          ? ""
                          : "○"}
                </span>
              </div>
              <div
                className={`mt-0.5 text-[10px] font-semibold ${energyTone(day.energy)}`}
                title={day.energy ? `Energy ${day.energy}` : "No energy logged"}
              >
                {day.energy ?? (day.isFuture ? "" : "·")}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-sage-500">
        Dots = movement + supplements · number = energy 1–5
      </p>
    </div>
  );
}
