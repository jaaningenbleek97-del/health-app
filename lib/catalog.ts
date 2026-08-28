import { getRemedy, remedies } from "@/data/remedies";
import { getSupplement, supplements } from "@/data/supplements";
import { getWorkout, workouts } from "@/data/workouts";
import type { Remedy, Supplement, Workout } from "@/lib/types";

export function allWorkouts(custom: Workout[] = []): Workout[] {
  const ids = new Set(custom.map((w) => w.id));
  return [...custom, ...workouts.filter((w) => !ids.has(w.id))];
}

export function allSupplements(custom: Supplement[] = []): Supplement[] {
  const ids = new Set(custom.map((s) => s.id));
  return [...custom, ...supplements.filter((s) => !ids.has(s.id))];
}

export function allRemedies(custom: Remedy[] = []): Remedy[] {
  const ids = new Set(custom.map((r) => r.id));
  return [...custom, ...remedies.filter((r) => !ids.has(r.id))];
}

export function findWorkout(
  id: string,
  custom: Workout[] = []
): Workout | undefined {
  return custom.find((w) => w.id === id) ?? getWorkout(id);
}

export function findSupplement(
  id: string,
  custom: Supplement[] = []
): Supplement | undefined {
  return custom.find((s) => s.id === id) ?? getSupplement(id);
}

export function findRemedy(
  id: string,
  custom: Remedy[] = []
): Remedy | undefined {
  return custom.find((r) => r.id === id) ?? getRemedy(id);
}

export function workoutTimedSec(workout: Workout): number {
  return workout.steps.reduce(
    (acc, step) => acc + (step.durationSec ?? 0) + (step.restSec ?? 0),
    0
  );
}

export function workoutDisplayMin(workout: Workout): number {
  const timed = workoutTimedSec(workout);
  const hasSets = workout.steps.some((s) => s.sets || s.reps);
  if (hasSets) return workout.durationMin;
  if (timed >= 30) return Math.max(1, Math.round(timed / 60));
  return workout.durationMin;
}
