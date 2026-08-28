import { circadianClock } from "@/lib/circadian";
import { findRemedy, findWorkout } from "@/lib/catalog";
import { todayKey } from "@/lib/dates";
import { addMinutesToHm } from "@/lib/sun";
import { APPROACH_PILLARS } from "@/lib/types";
import type {
  ApproachPillar,
  CircadianPrefs,
  HabitId,
  PlanSession,
  PlanSessionKind,
  Remedy,
  Reminder,
  StackItem,
  WeekDayPlan,
  WeeklySchedule,
  Workout,
  WorkoutLog,
} from "@/lib/types";

const DEFAULT_HABITS: HabitId[] = [
  "morning-light",
  "delay-caffeine",
  "meal-walk",
  "evening-dim",
];

export function emptyDayPlan(weekday: number): WeekDayPlan {
  return {
    weekday,
    sessions: [],
    workoutIds: [],
    supplementIds: [],
    useFullStack: true,
    habits: [...DEFAULT_HABITS],
    moveTime: "07:30",
    stackMorningTime: "08:00",
    stackEveningTime: "20:00",
    restDay: false,
    note: "",
  };
}

export function defaultWeeklySchedule(): WeeklySchedule {
  return {
    remindersEnabled: true,
    appliedFoundationId: null,
    days: Array.from({ length: 7 }, (_, weekday) => emptyDayPlan(weekday)),
  };
}

function asFoundationId(raw: unknown): ApproachPillar | null | undefined {
  if (raw === null) return null;
  if (
    typeof raw === "string" &&
    (APPROACH_PILLARS as string[]).includes(raw)
  ) {
    return raw as ApproachPillar;
  }
  return undefined;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeSession(
  raw: unknown,
  weekday: number,
  index: number
): PlanSession | null {
  if (!isRecord(raw)) return null;
  const kind: PlanSessionKind =
    raw.kind === "remedy" || raw.kind === "custom" ? raw.kind : "workout";
  const time =
    typeof raw.time === "string" && raw.time ? raw.time : "07:30";
  const id =
    typeof raw.id === "string" && raw.id
      ? raw.id
      : `sess-${weekday}-${index}`;
  const refId = typeof raw.refId === "string" ? raw.refId : undefined;
  const title = typeof raw.title === "string" ? raw.title : undefined;
  const note = typeof raw.note === "string" ? raw.note : undefined;
  if (kind === "workout" && !refId) return null;
  if (kind === "remedy" && !refId && !title) return null;
  if (kind === "custom" && !title?.trim()) return null;
  return { id, kind, time, refId, title, note };
}

function migrateLegacyWorkouts(found: Record<string, unknown>, weekday: number): PlanSession[] {
  const ids = Array.isArray(found.workoutIds)
    ? found.workoutIds.filter((id): id is string => typeof id === "string")
    : [];
  const time =
    typeof found.moveTime === "string" && found.moveTime
      ? found.moveTime
      : "07:30";
  return ids.map((id, index) => ({
    id: `migrated-w-${weekday}-${id}-${index}`,
    kind: "workout" as const,
    time,
    refId: id,
  }));
}

export function withSyncedIds(plan: WeekDayPlan): WeekDayPlan {
  const workoutSessions = (plan.sessions ?? []).filter(
    (s) => s.kind === "workout" && s.refId
  );
  return {
    ...plan,
    workoutIds: workoutSessions.map((s) => s.refId as string),
    moveTime: workoutSessions[0]?.time || plan.moveTime,
  };
}

export function normalizeWeeklySchedule(
  raw?: Partial<WeeklySchedule> | null
): WeeklySchedule {
  const base = defaultWeeklySchedule();
  const incoming = Array.isArray(raw?.days) ? raw.days : [];
  return {
    remindersEnabled: raw?.remindersEnabled !== false,
    appliedFoundationId: asFoundationId(raw?.appliedFoundationId),
    days: base.days.map((fallback) => {
      const found = incoming.find((d) => d.weekday === fallback.weekday);
      if (!found) return fallback;
      const record = found as unknown as Record<string, unknown>;
      const parsed = Array.isArray(found.sessions)
        ? found.sessions
            .map((s, i) => normalizeSession(s, fallback.weekday, i))
            .filter((s): s is PlanSession => s !== null)
        : [];
      const sessions =
        parsed.length > 0
          ? parsed
          : migrateLegacyWorkouts(record, fallback.weekday);
      return withSyncedIds({
        weekday: fallback.weekday,
        sessions,
        workoutIds: [],
        supplementIds: Array.isArray(found.supplementIds)
          ? found.supplementIds
          : [],
        useFullStack: found.useFullStack !== false,
        habits: Array.isArray(found.habits) ? found.habits : [...DEFAULT_HABITS],
        moveTime:
          typeof found.moveTime === "string" ? found.moveTime : fallback.moveTime,
        stackMorningTime:
          typeof found.stackMorningTime === "string"
            ? found.stackMorningTime
            : fallback.stackMorningTime,
        stackEveningTime:
          typeof found.stackEveningTime === "string"
            ? found.stackEveningTime
            : fallback.stackEveningTime,
        restDay: Boolean(found.restDay),
        note: typeof found.note === "string" ? found.note : "",
      });
    }),
  };
}

export function planForWeekday(
  schedule: WeeklySchedule,
  weekday: number
): WeekDayPlan {
  return (
    schedule.days.find((d) => d.weekday === weekday) ?? emptyDayPlan(weekday)
  );
}

export function todayPlan(
  schedule: WeeklySchedule,
  now = new Date()
): WeekDayPlan {
  return planForWeekday(schedule, now.getDay());
}

export function scheduledStackItems(
  plan: WeekDayPlan,
  stack: StackItem[]
): StackItem[] {
  if (plan.useFullStack) return stack;
  const allow = new Set(plan.supplementIds);
  return stack.filter((item) => allow.has(item.supplementId));
}

export function sortSessions(sessions: PlanSession[]): PlanSession[] {
  return [...sessions].sort((a, b) =>
    (a.time || "").localeCompare(b.time || "")
  );
}

export function workoutSessions(plan: WeekDayPlan): PlanSession[] {
  return sortSessions(
    (plan.sessions ?? []).filter((s) => s.kind === "workout")
  );
}

export function careSessions(plan: WeekDayPlan): PlanSession[] {
  return sortSessions(
    (plan.sessions ?? []).filter((s) => s.kind !== "workout")
  );
}

export function nextSessionTime(
  sessions: PlanSession[],
  kind: PlanSessionKind
): string {
  const same = sortSessions(
    sessions.filter((s) =>
      kind === "workout" ? s.kind === "workout" : s.kind !== "workout"
    )
  );
  if (!same.length) return kind === "workout" ? "07:30" : "20:00";
  if (kind === "workout" && same.length === 1) return "17:00";
  return shiftTime(same[same.length - 1].time, 60);
}

export function shiftTime(hhmm: string, addMinutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total =
    (((h || 0) * 60 + (m || 0) + addMinutes) % (24 * 60) + 24 * 60) %
    (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function sessionTitle(
  session: PlanSession,
  workouts: Workout[] = [],
  remedies: Remedy[] = []
): string {
  if (session.title?.trim()) return session.title.trim();
  if (session.kind === "workout" && session.refId) {
    return findWorkout(session.refId, workouts)?.title ?? "Workout";
  }
  if (session.kind === "remedy" && session.refId) {
    return findRemedy(session.refId, remedies)?.title ?? "Remedy";
  }
  return "Care";
}

export function workoutLogCounts(
  logs: WorkoutLog[],
  day = new Date()
): Map<string, number> {
  const key = todayKey(day);
  const counts = new Map<string, number>();
  for (const log of logs) {
    if (log.completed === false) continue;
    if (todayKey(new Date(log.completedAt)) !== key) continue;
    counts.set(log.workoutId, (counts.get(log.workoutId) ?? 0) + 1);
  }
  return counts;
}

export function isWorkoutSessionDone(
  session: PlanSession,
  plan: WeekDayPlan,
  counts: Map<string, number>
): boolean {
  if (session.kind !== "workout" || !session.refId) return false;
  const same = workoutSessions(plan).filter((s) => s.refId === session.refId);
  const index = same.findIndex((s) => s.id === session.id);
  if (index < 0) return false;
  return (counts.get(session.refId) ?? 0) > index;
}

export function allWorkoutSessionsDone(
  plan: WeekDayPlan,
  counts: Map<string, number>
): boolean {
  const sessions = workoutSessions(plan);
  if (!sessions.length) return counts.size > 0;
  return sessions.every((s) => isWorkoutSessionDone(s, plan, counts));
}

export function patchDay(
  schedule: WeeklySchedule,
  weekday: number,
  patch: Partial<WeekDayPlan>
): WeeklySchedule {
  const normalized = normalizeWeeklySchedule(schedule);
  return {
    ...normalized,
    days: normalized.days.map((day) =>
      day.weekday === weekday
        ? withSyncedIds({ ...day, ...patch, weekday })
        : day
    ),
  };
}

export function copyDayTo(
  schedule: WeeklySchedule,
  fromWeekday: number,
  targets: number[]
): WeeklySchedule {
  const normalized = normalizeWeeklySchedule(schedule);
  const src = planForWeekday(normalized, fromWeekday);
  return {
    ...normalized,
    days: normalized.days.map((day) =>
      targets.includes(day.weekday)
        ? withSyncedIds({
            ...src,
            weekday: day.weekday,
            sessions: src.sessions.map((s) => ({
              ...s,
              id:
                day.weekday === fromWeekday
                  ? s.id
                  : `${s.id}-d${day.weekday}`,
            })),
          })
        : day
    ),
  };
}

export function stripIdFromSchedule(
  schedule: WeeklySchedule,
  kind: "workout" | "supplement" | "remedy",
  id: string
): WeeklySchedule {
  const normalized = normalizeWeeklySchedule(schedule);
  return {
    ...normalized,
    days: normalized.days.map((day) =>
      withSyncedIds({
        ...day,
        workoutIds:
          kind === "workout"
            ? day.workoutIds.filter((x) => x !== id)
            : day.workoutIds,
        supplementIds:
          kind === "supplement"
            ? day.supplementIds.filter((x) => x !== id)
            : day.supplementIds,
        sessions:
          kind === "supplement"
            ? day.sessions
            : day.sessions.filter(
                (s) =>
                  !(
                    (kind === "workout" &&
                      s.kind === "workout" &&
                      s.refId === id) ||
                    (kind === "remedy" && s.kind === "remedy" && s.refId === id)
                  )
              ),
      })
    ),
  };
}

function circadianReminders(
  plan: WeekDayPlan,
  prefs: CircadianPrefs,
  now: Date
): Reminder[] {
  const clock = circadianClock(prefs, now);
  const createdAt = "schedule";
  const out: Reminder[] = [];

  if (plan.habits.includes("morning-light")) {
    out.push({
      id: `schedule-light-${plan.weekday}`,
      title: "Morning light",
      mode: "clock",
      time: clock.lightHm,
      days: [plan.weekday],
      enabled: true,
      kind: "care",
      createdAt,
    });
  }

  if (plan.habits.includes("evening-dim")) {
    out.push({
      id: `schedule-dim-${plan.weekday}`,
      title: "Dim the house",
      mode: "clock",
      time: clock.dimHm,
      days: [plan.weekday],
      enabled: true,
      kind: "care",
      createdAt,
    });
  }

  if (prefs.eatingWindowEnabled) {
    out.push({
      id: `schedule-eat-open-${plan.weekday}`,
      title: "Eating window opens",
      mode: "clock",
      time: prefs.eatingStart,
      days: [plan.weekday],
      enabled: true,
      kind: "care",
      createdAt,
    });
    out.push({
      id: `schedule-eat-close-${plan.weekday}`,
      title: "Last bite soon",
      mode: "clock",
      time: addMinutesToHm(prefs.eatingEnd, -30),
      days: [plan.weekday],
      enabled: true,
      kind: "care",
      createdAt,
    });
  }

  return out;
}

export function scheduleReminders(
  plan: WeekDayPlan,
  opts: {
    stack: StackItem[];
    workouts?: Workout[];
    remedies?: Remedy[];
    enabled: boolean;
    circadian?: CircadianPrefs;
    now?: Date;
  }
): Reminder[] {
  if (!opts.enabled) return [];

  const items = scheduledStackItems(plan, opts.stack);
  const createdAt = "schedule";
  const out: Reminder[] = [];
  const workouts = opts.workouts ?? [];
  const remedies = opts.remedies ?? [];

  for (const session of sortSessions(plan.sessions ?? [])) {
    if (!session.time) continue;
    if (session.kind === "workout" && plan.restDay) continue;
    const title = sessionTitle(session, workouts, remedies);
    out.push({
      id: `schedule-sess-${plan.weekday}-${session.id}`,
      title:
        session.kind === "workout"
          ? `Workout: ${title}`
          : session.kind === "remedy"
            ? `Remedy: ${title}`
            : title,
      mode: "clock",
      time: session.time,
      days: [plan.weekday],
      enabled: true,
      kind: session.kind === "workout" ? "exercise" : "care",
      createdAt,
    });
  }

  const morning = items.filter(
    (s) =>
      s.timing === "morning" ||
      s.timing === "anytime" ||
      s.timing === "with_food"
  );
  if (plan.stackMorningTime && morning.length) {
    out.push({
      id: `schedule-stack-am-${plan.weekday}`,
      title: "Morning supplements",
      mode: "clock",
      time: plan.stackMorningTime,
      days: [plan.weekday],
      enabled: true,
      kind: "stack",
      createdAt,
    });
  }

  const evening = items.filter((s) => s.timing === "evening");
  if (plan.stackEveningTime && evening.length) {
    out.push({
      id: `schedule-stack-pm-${plan.weekday}`,
      title: "Night supplements",
      mode: "clock",
      time: plan.stackEveningTime,
      days: [plan.weekday],
      enabled: true,
      kind: "stack",
      createdAt,
    });
  }

  if (opts.circadian) {
    out.push(
      ...circadianReminders(plan, opts.circadian, opts.now ?? new Date())
    );
  }

  return out;
}

export function combinedReminders(
  user: Reminder[],
  schedule: WeeklySchedule,
  stack: StackItem[],
  workouts: Workout[] = [],
  remedies: Remedy[] = [],
  extras: { now?: Date; circadian?: CircadianPrefs } = {}
): Reminder[] {
  const now = extras.now ?? new Date();
  const plan = todayPlan(schedule, now);
  return [
    ...user,
    ...scheduleReminders(plan, {
      stack,
      workouts,
      remedies,
      enabled: schedule.remindersEnabled,
      circadian: extras.circadian,
      now,
    }),
  ];
}

export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
