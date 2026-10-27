import { circadianClock } from "@/lib/circadian";
import { normalizeWeeklySchedule, withSyncedIds } from "@/lib/schedule";
import type {
  ApproachPillar,
  CircadianPrefs,
  DoseTiming,
  HabitId,
  PlanSession,
  WeekDayPlan,
  WeeklySchedule,
} from "@/lib/types";

export interface FoundationPlacement {
  id: string;
  time: string;
  days?: number[];
}

export interface FoundationRecipe {
  title: string;
  habits: HabitId[];
  workouts: FoundationPlacement[];
  remedies: FoundationPlacement[];
  supplements: { id: string; timing: DoseTiming }[];
  restDays: number[];
  stackMorningTime: string;
  stackEveningTime: string;
  note: string;
}

const EVERY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];

export function foundationRecipe(
  id: ApproachPillar,
  prefs: CircadianPrefs,
  now = new Date()
): FoundationRecipe {
  const clock = circadianClock(prefs, now);
  const morning = clock.lightHm;
  const walk = clock.morningStackHm;
  const evening = clock.dimHm;
  const night = clock.eveningStackHm;

  switch (id) {
    case "circadian":
      return {
        title: "Circadian week",
        habits: ["morning-light", "delay-caffeine", "evening-dim"],
        workouts: [{ id: "morning-walk", time: walk }],
        remedies: [],
        supplements: [
          { id: "vitamin-d", timing: "morning" },
          { id: "magnesium", timing: "evening" },
        ],
        restDays: [],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: clock.eveningStackHm,
        note: "Circadian week — morning light, walk, dim evening.",
      };
    case "sleep":
      return {
        title: "Sleep week",
        habits: ["delay-caffeine", "evening-dim"],
        workouts: [
          { id: "evening-stretch", time: evening },
          { id: "nsdr-10", time: night, days: [0, 6] },
        ],
        remedies: [{ id: "chamomile-wind-down", time: night }],
        supplements: [
          { id: "magnesium", timing: "evening" },
          { id: "glycine", timing: "evening" },
          { id: "theanine", timing: "evening" },
        ],
        restDays: [],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: night,
        note: "Sleep week — caffeine cutoff, dim light, downshift.",
      };
    case "metabolic":
      return {
        title: "Metabolic week",
        habits: ["meal-walk"],
        workouts: [
          { id: "lunch-break-move", time: "12:30", days: WEEKDAYS },
          { id: "zone2-walk", time: walk, days: [0, 6] },
        ],
        remedies: [{ id: "post-meal-walk", time: "13:00" }],
        supplements: [
          { id: "omega-3", timing: "with_food" },
          { id: "magnesium", timing: "evening" },
        ],
        restDays: [],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: clock.eveningStackHm,
        note: "Metabolic week — protein, walk after the biggest meal.",
      };
    case "gut":
      return {
        title: "Gut week",
        habits: ["meal-walk"],
        workouts: [{ id: "desk-mobility", time: "15:00", days: WEEKDAYS }],
        remedies: [
          { id: "ginger-tea-queasy", time: "19:00" },
          { id: "fermented-fork", time: "18:30" },
        ],
        supplements: [
          { id: "probiotics", timing: "morning" },
          { id: "ginger", timing: "with_food" },
        ],
        restDays: [],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: clock.eveningStackHm,
        note: "Gut week — sit to eat, slow fiber, ginger if queasy.",
      };
    case "stress":
      return {
        title: "Nervous-system week",
        habits: ["evening-dim"],
        workouts: [
          { id: "physio-sigh", time: morning },
          { id: "nsdr-10", time: evening },
        ],
        remedies: [{ id: "box-breathing", time: "15:00", days: WEEKDAYS }],
        supplements: [
          { id: "magnesium", timing: "evening" },
          { id: "theanine", timing: "anytime" },
        ],
        restDays: [],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: clock.eveningStackHm,
        note: "Stress week — sigh, NSDR, dim evening.",
      };
    case "inflammation":
      return {
        title: "Recovery-inflammation week",
        habits: ["evening-dim"],
        workouts: [
          { id: "zone2-walk", time: walk, days: WEEKDAYS },
          { id: "yoga-restore", time: evening, days: [0] },
        ],
        remedies: [{ id: "traditional-sauna", time: "18:30", days: [2, 4] }],
        supplements: [
          { id: "omega-3", timing: "with_food" },
          { id: "turmeric", timing: "with_food" },
        ],
        restDays: [0],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: clock.eveningStackHm,
        note: "Inflammation week — easy cardio, plants, one rest day.",
      };
    case "methylation":
      return {
        title: "B-vitamin week",
        habits: ["morning-light"],
        workouts: [{ id: "morning-walk", time: walk }],
        remedies: [],
        supplements: [
          { id: "vitamin-b12", timing: "morning" },
          { id: "folate", timing: "morning" },
        ],
        restDays: [],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: clock.eveningStackHm,
        note: "Methylation week — food first, B12/folate if you already use them.",
      };
    case "recovery":
      return {
        title: "Strength & recovery week",
        habits: ["morning-light", "evening-dim"],
        workouts: [
          { id: "beginner-strength", time: "17:00", days: [1, 3, 5] },
          { id: "zone2-walk", time: walk, days: [2, 4, 6] },
        ],
        remedies: [{ id: "traditional-sauna", time: "19:00", days: [2, 4, 6] }],
        supplements: [
          { id: "creatine", timing: "anytime" },
          { id: "magnesium", timing: "evening" },
        ],
        restDays: [0],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: clock.eveningStackHm,
        note: "Recovery week — lift 3×, walk 3×, sauna, rest Sunday.",
      };
    case "focus":
      return {
        title: "Focus week",
        habits: ["morning-light", "delay-caffeine"],
        workouts: [
          { id: "morning-walk", time: walk },
          { id: "desk-mobility", time: "15:00", days: WEEKDAYS },
        ],
        remedies: [{ id: "box-breathing", time: "10:30", days: WEEKDAYS }],
        supplements: [
          { id: "theanine", timing: "morning" },
          { id: "green-tea", timing: "morning" },
        ],
        restDays: [],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: clock.eveningStackHm,
        note: "Focus week — light before caffeine, walk, short resets.",
      };
    case "minerals":
      return {
        title: "Mineral week",
        habits: ["morning-light"],
        workouts: [{ id: "zone2-walk", time: walk }],
        remedies: [{ id: "hydration-habit", time: "11:00" }],
        supplements: [
          { id: "magnesium", timing: "evening" },
          { id: "zinc", timing: "with_food" },
        ],
        restDays: [],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: clock.eveningStackHm,
        note: "Mineral week — food, sweat, magnesium at night.",
      };
    default:
      return {
        title: "Foundation week",
        habits: ["morning-light"],
        workouts: [{ id: "morning-walk", time: walk }],
        remedies: [],
        supplements: [],
        restDays: [],
        stackMorningTime: clock.morningStackHm,
        stackEveningTime: clock.eveningStackHm,
        note: "",
      };
  }
}

export function daysFor(item: FoundationPlacement): number[] {
  return item.days?.length ? item.days : EVERY;
}

export function sessionExists(
  sessions: PlanSession[],
  kind: "workout" | "remedy",
  refId: string
): boolean {
  return sessions.some((s) => s.kind === kind && s.refId === refId);
}

export function mergeHabits(current: HabitId[], extra: HabitId[]): HabitId[] {
  return [...new Set([...current, ...extra])];
}

export function foundationNote(plan: WeekDayPlan, note: string): string {
  if (!plan.note.trim()) return note;
  if (plan.note.includes(note)) return plan.note;
  if (plan.note.endsWith("week.") || plan.note.includes(" week —")) return note;
  return plan.note;
}

export function applyRecipeToWeek(
  schedule: WeeklySchedule,
  recipe: FoundationRecipe,
  opts: {
    foundationId: ApproachPillar;
    hasWorkout: (id: string) => boolean;
    hasRemedy: (id: string) => boolean;
    newId: () => string;
  }
): WeeklySchedule {
  const current = normalizeWeeklySchedule(schedule);
  return {
    ...current,
    remindersEnabled: true,
    appliedFoundationId: opts.foundationId,
    days: current.days.map((day) => {
      const sessions = [...(day.sessions ?? [])];
      const rest = recipe.restDays.includes(day.weekday);
      const hadWorkout = sessions.some((s) => s.kind === "workout");

      for (const workout of recipe.workouts) {
        if (!opts.hasWorkout(workout.id)) continue;
        if (sessionExists(sessions, "workout", workout.id)) continue;
        if (!daysFor(workout).includes(day.weekday)) continue;
        if (rest) continue;
        sessions.push({
          id: opts.newId(),
          kind: "workout",
          time: workout.time,
          refId: workout.id,
        });
      }

      for (const remedy of recipe.remedies) {
        if (!opts.hasRemedy(remedy.id)) continue;
        if (sessionExists(sessions, "remedy", remedy.id)) continue;
        if (!daysFor(remedy).includes(day.weekday)) continue;
        sessions.push({
          id: opts.newId(),
          kind: "remedy",
          time: remedy.time,
          refId: remedy.id,
        });
      }

      return withSyncedIds({
        ...day,
        sessions,
        habits: mergeHabits(day.habits, recipe.habits),
        restDay: rest && !hadWorkout ? true : day.restDay,
        stackMorningTime: recipe.stackMorningTime,
        stackEveningTime: recipe.stackEveningTime,
        note: foundationNote(day, recipe.note),
      });
    }),
  };
}
