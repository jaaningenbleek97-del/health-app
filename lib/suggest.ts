import { workouts as catalogWorkouts } from "@/data/workouts";
import { todayKey } from "@/lib/dates";
import type { Workout, WorkoutCategory, WorkoutLog } from "@/lib/types";

export interface Suggestion {
  workout: Workout;
  reason: string;
  again?: Workout;
}

function byId(id: string, list: Workout[]): Workout | undefined {
  return list.find((w) => w.id === id);
}

function pick(
  list: Workout[],
  ids: string[],
  excludeId?: string,
  favoriteIds: string[] = []
): Workout {
  const found = ids
    .map((id) => byId(id, list))
    .filter((w): w is Workout => w !== undefined && w.id !== excludeId);
  const pool = found.length
    ? found
    : list.filter((w) => w.id !== excludeId);
  const fav = pool.filter((w) => favoriteIds.includes(w.id));
  return (fav[0] ?? pool[0] ?? list[0] ?? catalogWorkouts[0]) as Workout;
}

function lastLog(logs: WorkoutLog[]): WorkoutLog | undefined {
  if (!logs.length) return undefined;
  return [...logs].sort((a, b) =>
    a.completedAt.localeCompare(b.completedAt)
  )[logs.length - 1];
}

function complementary(category: WorkoutCategory): string[] {
  switch (category) {
    case "strength":
      return ["evening-stretch", "hip-opener", "yoga-restore", "wrist-prep"];
    case "calisthenics":
      return ["wrist-prep", "evening-stretch", "hip-opener", "desk-mobility"];
    case "walk":
      return ["pushup-school", "core-basics", "squat-school", "posture-fix"];
    case "yoga":
      return ["morning-walk", "power-walk", "lunch-break-move"];
    case "stretch":
      return ["morning-walk", "desk-mobility", "pushup-school"];
    case "mobility":
      return ["squat-school", "glute-focus", "hollow-body"];
    case "breath":
      return ["morning-walk", "desk-mobility", "evening-stretch"];
    default:
      return ["morning-walk"];
  }
}

function timeBucket(hour: number): string[] {
  if (hour < 11) {
    return ["morning-walk", "yoga-sunrise", "physio-sigh", "desk-mobility"];
  }
  if (hour < 16) {
    return ["lunch-break-move", "box-breath-set", "plank-series", "core-basics"];
  }
  if (hour < 20) {
    return ["leg-day-bw", "hip-opener", "chair-dips-rows", "power-walk"];
  }
  return ["nsdr-10", "yoga-restore", "evening-stretch"];
}

const easyIds = [
  "morning-walk",
  "desk-mobility",
  "evening-stretch",
  "lunch-break-move",
  "yoga-restore",
  "posture-fix",
];

export function suggestWorkout(opts: {
  logs: WorkoutLog[];
  streak: number;
  completedToday: boolean;
  favoriteIds?: string[];
  workouts?: Workout[];
  now?: Date;
}): Suggestion {
  const now = opts.now ?? new Date();
  const favoriteIds = opts.favoriteIds ?? [];
  const list = opts.workouts?.length ? opts.workouts : catalogWorkouts;
  const last = lastLog(opts.logs);
  const lastWorkout = last ? byId(last.workoutId, list) : undefined;
  const lastWasToday =
    last && todayKey(new Date(last.completedAt)) === todayKey(now);

  if (opts.completedToday || lastWasToday) {
    const extra = lastWorkout
      ? pick(list, complementary(lastWorkout.category), lastWorkout.id, favoriteIds)
      : pick(list, timeBucket(now.getHours()), undefined, favoriteIds);
    return {
      workout: extra,
      reason: lastWorkout
        ? `Optional extra after ${lastWorkout.title}`
        : "A gentle add-on if you want more",
      again: lastWorkout,
    };
  }

  if (opts.streak === 0 && opts.logs.length > 0) {
    return {
      workout: pick(list, easyIds, lastWorkout?.id, favoriteIds),
      reason: "Easy session to restart the streak",
      again: lastWorkout,
    };
  }

  if (lastWorkout) {
    return {
      workout: pick(
        list,
        complementary(lastWorkout.category),
        lastWorkout.id,
        favoriteIds
      ),
      reason: `Pairs well after ${lastWorkout.category}`,
      again: lastWorkout,
    };
  }

  const hour = now.getHours();
  let reason = "A good fit for this time of day";
  if (hour < 11) reason = "A gentle start for the morning";
  else if (hour < 16) reason = "A short reset for midday stiffness";
  else if (hour < 20) reason = "Wind-down movement for the evening";
  else reason = "A quiet session before rest";

  return {
    workout: pick(list, timeBucket(hour), undefined, favoriteIds),
    reason,
  };
}

export function lastCompletedWorkout(
  logs: WorkoutLog[],
  list: Workout[] = catalogWorkouts
): Workout | undefined {
  const last = lastLog(logs);
  return last ? byId(last.workoutId, list) : undefined;
}
