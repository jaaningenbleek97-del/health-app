export type WorkoutDifficulty = "beginner" | "easy" | "moderate";
export type WorkoutCategory =
  | "walk"
  | "mobility"
  | "strength"
  | "calisthenics"
  | "stretch"
  | "yoga"
  | "breath";

export interface WorkoutStep {
  name: string;
  durationSec?: number;
  reps?: number;
  sets?: number;
  restSec?: number;
  cue?: string;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  difficulty: WorkoutDifficulty;
  category: WorkoutCategory;
  equipment: "none";
  steps: WorkoutStep[];
  custom?: boolean;
}

export type SupplementCategory =
  | "vitamin"
  | "mineral"
  | "herb"
  | "mushroom"
  | "other"
  | "amino";

export type DoseTiming = "morning" | "with_food" | "evening" | "anytime";

export type DoseUnit = "mg" | "mcg" | "g" | "IU" | "billion-CFU";

export type RdiProfile = "general" | "male" | "female";

export type ApproachPillar =
  | "circadian"
  | "sleep"
  | "metabolic"
  | "gut"
  | "stress"
  | "inflammation"
  | "methylation"
  | "recovery"
  | "focus"
  | "minerals";

export const APPROACH_PILLARS: ApproachPillar[] = [
  "circadian",
  "sleep",
  "metabolic",
  "gut",
  "stress",
  "inflammation",
  "methylation",
  "recovery",
  "focus",
  "minerals",
];

export interface NutrientContribution {
  nutrientId: string;
  amount: number;
}

export interface Supplement {
  id: string;
  name: string;
  category: SupplementCategory;
  summary: string;
  foodSources: string[];
  typicalTiming: DoseTiming;
  caution: string;
  seeDoctorIf: string;
  pillars: ApproachPillar[];
  forms: string[];
  servingAmount: number;
  servingUnit: DoseUnit;
  servingLabel: string;
  typicalRange: string;
  why: string;
  howToTake: string;
  nutrients: NutrientContribution[];
  custom?: boolean;
}

export type RemedyCategory =
  | "sleep"
  | "digestion"
  | "stress"
  | "immunity"
  | "skin"
  | "energy"
  | "metabolic"
  | "circadian"
  | "recovery";

export interface Remedy {
  id: string;
  title: string;
  category: RemedyCategory;
  summary: string;
  ingredients: string[];
  steps: string[];
  howToUse: string;
  safety: string;
  seeDoctorIf: string;
  pillars?: ApproachPillar[];
  custom?: boolean;
}

export type ReminderMode = "clock" | "interval";

export interface Reminder {
  id: string;
  title: string;
  mode: ReminderMode;
  /** HH:mm local — used in clock mode */
  time: string;
  /** Minutes between pings — used in interval mode */
  intervalMinutes?: number;
  /** 0=Sun … 6=Sat; empty = every day */
  days: number[];
  enabled: boolean;
  kind: "exercise" | "stack" | "care";
  createdAt: string;
}

export interface StackItem {
  supplementId: string;
  timing: DoseTiming;
  note?: string;
  addedAt: string;
  amount: number;
  unit: DoseUnit;
}

export interface WorkoutLog {
  workoutId: string;
  completedAt: string;
  elapsedSec?: number;
  plannedSec?: number;
  completed?: boolean;
}

export type HabitId =
  | "morning-light"
  | "delay-caffeine"
  | "meal-walk"
  | "evening-dim";

export interface DailyVitals {
  sleepHours?: number;
  energy?: number;
  stress?: number;
  restingHr?: number;
}

export interface DailyCheckin {
  /** YYYY-MM-DD local */
  date: string;
  checkedSupplementIds: string[];
  habits?: HabitId[];
  /** Remedy / custom plan sessions checked off today */
  checkedSessionIds?: string[];
  vitals?: DailyVitals;
  /** HH:mm local */
  firstBiteAt?: string;
  lastBiteAt?: string;
}

export interface CircadianPrefs {
  latitude: number;
  longitude: number;
  locationLabel: string;
  eatingWindowEnabled: boolean;
  /** HH:mm local */
  eatingStart: string;
  eatingEnd: string;
}

export type PlanSessionKind = "workout" | "remedy" | "custom";

export interface PlanSession {
  id: string;
  kind: PlanSessionKind;
  /** HH:mm local */
  time: string;
  /** Workout or remedy id */
  refId?: string;
  /** Custom title, or override */
  title?: string;
  note?: string;
}

export interface WeekDayPlan {
  /** 0=Sun … 6=Sat */
  weekday: number;
  sessions: PlanSession[];
  /** Derived from workout sessions — kept for older data */
  workoutIds: string[];
  /** Used when useFullStack is false */
  supplementIds: string[];
  useFullStack: boolean;
  habits: HabitId[];
  moveTime: string;
  stackMorningTime: string;
  stackEveningTime: string;
  restDay: boolean;
  note: string;
}

export interface WeeklySchedule {
  days: WeekDayPlan[];
  remindersEnabled: boolean;
  appliedFoundationId?: ApproachPillar | null;
}

export type ThemeMode = "dark" | "light";

export const PERSIST_VERSION = 8;
