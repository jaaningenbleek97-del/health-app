import { addDays, startOfWeek, weekDays, weekKeys, todayKey } from "@/lib/dates";
import type { DailyCheckin, HabitId, StackItem, WorkoutLog } from "@/lib/types";

export interface DaySummary {
  key: string;
  label: string;
  weekday: string;
  isToday: boolean;
  isFuture: boolean;
  workoutDone: boolean;
  stackDone: number;
  stackTotal: number;
  habits: HabitId[];
  energy?: number;
  sleepHours?: number;
}

export function energyTone(energy?: number): string {
  if (!energy) return "text-sage-400";
  if (energy <= 2) return "text-terracotta-700";
  if (energy === 3) return "text-sage-500";
  return "text-sage-700";
}

export function weekSummaries(opts: {
  logs: WorkoutLog[];
  checkins: DailyCheckin[];
  stack: StackItem[];
  now?: Date;
}): DaySummary[] {
  const now = opts.now ?? new Date();
  const workoutDays = new Set(
    opts.logs.map((l) => todayKey(new Date(l.completedAt)))
  );
  const checkinByDate = new Map(opts.checkins.map((c) => [c.date, c]));
  const stackIds = opts.stack.map((s) => s.supplementId);
  const total = stackIds.length;

  return weekDays(now).map((day) => {
    const checkin = checkinByDate.get(day.key);
    const checked = checkin?.checkedSupplementIds ?? [];
    const stackDone = stackIds.filter((id) => checked.includes(id)).length;
    return {
      ...day,
      workoutDone: workoutDays.has(day.key),
      stackDone,
      stackTotal: total,
      habits: checkin?.habits ?? [],
      energy: checkin?.vitals?.energy,
      sleepHours: checkin?.vitals?.sleepHours,
    };
  });
}

export function historyDays(opts: {
  logs: WorkoutLog[];
  checkins: DailyCheckin[];
  stack: StackItem[];
  weeks?: number;
  now?: Date;
}): DaySummary[] {
  const now = opts.now ?? new Date();
  const weeks = opts.weeks ?? 4;
  const start = startOfWeek(addDays(now, -7 * (weeks - 1)));
  const today = todayKey(now);
  const workoutDays = new Set(
    opts.logs.map((l) => todayKey(new Date(l.completedAt)))
  );
  const checkinByDate = new Map(opts.checkins.map((c) => [c.date, c]));
  const stackIds = opts.stack.map((s) => s.supplementId);
  const total = stackIds.length;

  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = addDays(start, i);
    const key = todayKey(date);
    const checkin = checkinByDate.get(key);
    const checked = checkin?.checkedSupplementIds ?? [];
    return {
      key,
      label: String(date.getDate()),
      weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
      isToday: key === today,
      isFuture: key > today,
      workoutDone: workoutDays.has(key),
      stackDone: stackIds.filter((id) => checked.includes(id)).length,
      stackTotal: total,
      habits: checkin?.habits ?? [],
      energy: checkin?.vitals?.energy,
      sleepHours: checkin?.vitals?.sleepHours,
    };
  });
}

export function historyRecap(days: DaySummary[]): {
  sessions: number;
  stackDays: number;
  habitDays: number;
  elapsed: number;
  stackPct: number;
  avgEnergy: number | null;
} {
  const elapsed = days.filter((d) => !d.isFuture);
  const sessions = elapsed.filter((d) => d.workoutDone).length;
  const stackDays = elapsed.filter(
    (d) => d.stackTotal > 0 && d.stackDone === d.stackTotal
  ).length;
  const habitDays = elapsed.filter((d) => d.habits.length > 0).length;
  const stackEligible = elapsed.filter((d) => d.stackTotal > 0).length;
  const rated = elapsed.filter((d) => d.energy);
  const avgEnergy = rated.length
    ? Math.round(
        (rated.reduce((sum, d) => sum + (d.energy ?? 0), 0) / rated.length) * 10
      ) / 10
    : null;
  return {
    sessions,
    stackDays,
    habitDays,
    elapsed: elapsed.length,
    stackPct: stackEligible
      ? Math.round((stackDays / stackEligible) * 100)
      : 0,
    avgEnergy,
  };
}

export function weeklyRecap(opts: {
  logs: WorkoutLog[];
  checkins: DailyCheckin[];
  stack: StackItem[];
  now?: Date;
}): {
  sessions: number;
  stackDaysComplete: number;
  daysElapsed: number;
  stackPct: number;
} {
  const now = opts.now ?? new Date();
  const keys = weekKeys(now);
  const today = todayKey(now);
  const elapsed = keys.filter((k) => k <= today);
  const workoutDays = new Set(
    opts.logs.map((l) => todayKey(new Date(l.completedAt)))
  );
  const sessions = elapsed.filter((k) => workoutDays.has(k)).length;
  const stackIds = opts.stack.map((s) => s.supplementId);
  let stackDaysComplete = 0;
  if (stackIds.length) {
    for (const key of elapsed) {
      const checked =
        opts.checkins.find((c) => c.date === key)?.checkedSupplementIds ?? [];
      if (stackIds.every((id) => checked.includes(id))) stackDaysComplete += 1;
    }
  }
  const daysElapsed = elapsed.length;
  const stackPct =
    stackIds.length && daysElapsed
      ? Math.round((stackDaysComplete / daysElapsed) * 100)
      : 0;
  return { sessions, stackDaysComplete, daysElapsed, stackPct };
}
