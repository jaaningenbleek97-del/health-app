import { normalizeCheckin } from "@/lib/checkin";
import { normalizeCircadianPrefs } from "@/lib/circadian";
import { normalizeWeeklySchedule } from "@/lib/schedule";
import { normalizeStackItem } from "@/lib/stackDose";
import { PERSIST_VERSION } from "@/lib/types";
import type {
  CircadianPrefs,
  DailyCheckin,
  HabitId,
  RdiProfile,
  Remedy,
  Reminder,
  StackItem,
  Supplement,
  WeeklySchedule,
  Workout,
  WorkoutLog,
} from "@/lib/types";

export interface BackupPayload {
  version: number;
  exportedAt: string;
  displayName: string;
  stack: StackItem[];
  reminders: Reminder[];
  favoriteRemedyIds: string[];
  favoriteWorkoutIds: string[];
  workoutLogs: WorkoutLog[];
  checkins: DailyCheckin[];
  notificationsEnabled: boolean;
  onboardingComplete: boolean;
  soundEnabled: boolean;
  rdiProfile: RdiProfile;
  customWorkouts: Workout[];
  customSupplements: Supplement[];
  customRemedies: Remedy[];
  weeklySchedule: WeeklySchedule;
  circadianPrefs: CircadianPrefs;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

const habitIds: HabitId[] = [
  "morning-light",
  "delay-caffeine",
  "meal-walk",
  "evening-dim",
];

function parseCheckins(raw: unknown): DailyCheckin[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((c) =>
      normalizeCheckin({
        date: String(c.date ?? ""),
        checkedSupplementIds: asStringArray(c.checkedSupplementIds),
        habits: asStringArray(c.habits).filter((h): h is HabitId =>
          habitIds.includes(h as HabitId)
        ),
        checkedSessionIds: asStringArray(c.checkedSessionIds),
        vitals: isRecord(c.vitals)
          ? {
              sleepHours:
                typeof c.vitals.sleepHours === "number"
                  ? c.vitals.sleepHours
                  : undefined,
              energy:
                typeof c.vitals.energy === "number"
                  ? c.vitals.energy
                  : undefined,
              stress:
                typeof c.vitals.stress === "number"
                  ? c.vitals.stress
                  : undefined,
              restingHr:
                typeof c.vitals.restingHr === "number"
                  ? c.vitals.restingHr
                  : undefined,
            }
          : undefined,
        firstBiteAt:
          typeof c.firstBiteAt === "string" ? c.firstBiteAt : undefined,
        lastBiteAt: typeof c.lastBiteAt === "string" ? c.lastBiteAt : undefined,
      })
    )
    .filter((c) => c.date);
}

export function parseBackup(raw: unknown): BackupPayload | null {
  if (!isRecord(raw)) return null;
  if (!Array.isArray(raw.stack) || !Array.isArray(raw.reminders)) return null;
  if (!Array.isArray(raw.workoutLogs) || !Array.isArray(raw.checkins)) {
    return null;
  }

  const customSupplements = Array.isArray(raw.customSupplements)
    ? (raw.customSupplements as Supplement[])
    : [];

  const reminders: Reminder[] = raw.reminders
    .filter(isRecord)
    .map((r) => ({
      id: String(r.id ?? ""),
      title: String(r.title ?? "Reminder"),
      mode: r.mode === "interval" ? ("interval" as const) : ("clock" as const),
      time: String(r.time ?? ""),
      intervalMinutes:
        typeof r.intervalMinutes === "number" ? r.intervalMinutes : undefined,
      days: Array.isArray(r.days)
        ? r.days.filter((d): d is number => typeof d === "number")
        : [],
      enabled: r.enabled !== false,
      kind:
        r.kind === "stack"
          ? ("stack" as const)
          : r.kind === "care"
            ? ("care" as const)
            : ("exercise" as const),
      createdAt: String(r.createdAt ?? new Date().toISOString()),
    }))
    .filter((r) => r.id && r.title);

  return {
    version: typeof raw.version === "number" ? raw.version : PERSIST_VERSION,
    exportedAt:
      typeof raw.exportedAt === "string"
        ? raw.exportedAt
        : new Date().toISOString(),
    displayName: typeof raw.displayName === "string" ? raw.displayName : "",
    stack: (raw.stack as StackItem[]).map((item) =>
      normalizeStackItem(item ?? { supplementId: "" }, customSupplements)
    ),
    rdiProfile:
      raw.rdiProfile === "male" || raw.rdiProfile === "female"
        ? raw.rdiProfile
        : "general",
    reminders,
    favoriteRemedyIds: asStringArray(raw.favoriteRemedyIds),
    favoriteWorkoutIds: asStringArray(raw.favoriteWorkoutIds),
    workoutLogs: raw.workoutLogs as WorkoutLog[],
    checkins: parseCheckins(raw.checkins),
    notificationsEnabled: Boolean(raw.notificationsEnabled),
    onboardingComplete: raw.onboardingComplete !== false,
    soundEnabled: raw.soundEnabled !== false,
    customWorkouts: Array.isArray(raw.customWorkouts)
      ? (raw.customWorkouts as Workout[])
      : [],
    customSupplements,
    customRemedies: Array.isArray(raw.customRemedies)
      ? (raw.customRemedies as Remedy[])
      : [],
    weeklySchedule: normalizeWeeklySchedule(
      isRecord(raw.weeklySchedule)
        ? (raw.weeklySchedule as unknown as WeeklySchedule)
        : undefined
    ),
    circadianPrefs: normalizeCircadianPrefs(
      isRecord(raw.circadianPrefs)
        ? (raw.circadianPrefs as unknown as Partial<CircadianPrefs>)
        : undefined
    ),
  };
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
