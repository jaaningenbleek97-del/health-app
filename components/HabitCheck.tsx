"use client";

import { habitById } from "@/lib/habits";
import { useNaturaStore } from "@/lib/store";
import type { HabitId } from "@/lib/types";

export function HabitCheck({
  id,
  emphasize = false,
}: {
  id: HabitId;
  emphasize?: boolean;
}) {
  const done = useNaturaStore((s) => s.isHabitDoneToday(id));
  const toggle = useNaturaStore((s) => s.toggleHabit);
  const habit = habitById(id);

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ${
        emphasize ? "bg-sage-50" : "bg-cream-50"
      }`}
      aria-pressed={done}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm ${
          done ? "border-sage-600 bg-sage-600 text-white" : "border-sage-300"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-sage-900">
          {habit.label}
        </span>
        <span className="block text-xs text-sage-600">{habit.detail}</span>
      </span>
    </button>
  );
}
