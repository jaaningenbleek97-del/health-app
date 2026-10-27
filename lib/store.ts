"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { applyRecipeToWeek, foundationRecipe } from "./applyFoundation";
import { parseBackup, type BackupPayload } from "./backup";
import { findRemedy, findSupplement, findWorkout } from "./catalog";
import { emptyCheckin, normalizeCheckin, normalizeVitals } from "./checkin";
import { defaultCircadianPrefs, normalizeCircadianPrefs } from "./circadian";
import { addDays, todayKey } from "./dates";
import {
  allWorkoutSessionsDone,
  copyDayTo,
  defaultWeeklySchedule,
  nextSessionTime,
  normalizeWeeklySchedule,
  patchDay,
  planForWeekday,
  scheduledStackItems,
  stripIdFromSchedule,
  todayPlan,
  workoutLogCounts,
  workoutSessions,
} from "./schedule";
import { normalizeStackItem } from "./stackDose";
import { itemsInWindow, type StackWindow } from "./stackWindows";
import { applyThemeClass, normalizeTheme } from "./theme";
import { PERSIST_VERSION } from "./types";
import { uid } from "./uid";
import type {
  ApproachPillar,
  CircadianPrefs,
  DailyCheckin,
  DailyVitals,
  DoseTiming,
  DoseUnit,
  HabitId,
  PlanSession,
  PlanSessionKind,
  RdiProfile,
  Remedy,
  Reminder,
  StackItem,
  Supplement,
  ThemeMode,
  WeekDayPlan,
  WeeklySchedule,
  Workout,
  WorkoutLog,
} from "./types";

let persistWritesEnabled = false;

export function enablePersistWrites(): void {
  persistWritesEnabled = true;
}

export interface PersistedNatura {
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
  theme: ThemeMode;
}

interface NaturaState extends PersistedNatura {
  hasHydrated: boolean;

  setDisplayName: (name: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setOnboardingComplete: (done: boolean) => void;

  setRdiProfile: (profile: RdiProfile) => void;
  addToStack: (
    supplementId: string,
    timing: DoseTiming,
    note?: string,
    amount?: number,
    unit?: DoseUnit
  ) => void;
  removeFromStack: (supplementId: string) => void;
  updateStackTiming: (supplementId: string, timing: DoseTiming) => void;
  updateStackNote: (supplementId: string, note: string) => void;
  updateStackDose: (supplementId: string, amount: number, unit: DoseUnit) => void;
  toggleStackCheck: (supplementId: string) => void;
  checkStackGroup: (timing: DoseTiming) => void;
  checkStackWindow: (window: StackWindow) => void;
  isStackCheckedToday: (supplementId: string) => boolean;
  getTodayCheckin: () => DailyCheckin;
  leftoverFromYesterday: () => StackItem[];

  toggleHabit: (id: HabitId) => void;
  isHabitDoneToday: (id: HabitId) => boolean;

  addReminder: (input: Omit<Reminder, "id" | "createdAt">) => void;
  updateReminder: (id: string, patch: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;

  toggleFavoriteRemedy: (id: string) => void;
  toggleFavoriteWorkout: (id: string) => void;

  logWorkout: (
    workoutId: string,
    meta?: { elapsedSec?: number; plannedSec?: number; completed?: boolean }
  ) => void;
  getStreak: () => number;
  completedToday: () => boolean;

  saveCustomWorkout: (workout: Workout) => void;
  removeCustomWorkout: (id: string) => void;
  saveCustomSupplement: (supplement: Supplement) => void;
  removeCustomSupplement: (id: string) => void;
  saveCustomRemedy: (remedy: Remedy) => void;
  removeCustomRemedy: (id: string) => void;

  toggleSessionCheck: (sessionId: string) => void;
  isSessionDoneToday: (sessionId: string) => boolean;

  updateDayPlan: (weekday: number, patch: Partial<WeekDayPlan>) => void;
  addDaySession: (
    weekday: number,
    input: {
      kind: PlanSessionKind;
      time?: string;
      refId?: string;
      title?: string;
      note?: string;
    }
  ) => void;
  updateDaySession: (
    weekday: number,
    sessionId: string,
    patch: Partial<PlanSession>
  ) => void;
  removeDaySession: (weekday: number, sessionId: string) => void;
  toggleDaySupplement: (weekday: number, supplementId: string) => void;
  setDayFullStack: (weekday: number, useFullStack: boolean) => void;
  toggleDayHabit: (weekday: number, habitId: HabitId) => void;
  copyDayPlan: (fromWeekday: number, targets: number[]) => void;
  setScheduleRemindersEnabled: (enabled: boolean) => void;
  applyFoundation: (id: ApproachPillar) => void;
  setCircadianPrefs: (patch: Partial<CircadianPrefs>) => void;
  setTodayVitals: (patch: Partial<DailyVitals>) => void;
  setTodayEating: (patch: {
    firstBiteAt?: string;
    lastBiteAt?: string;
  }) => void;

  completeOnboarding: (input: {
    name: string;
    supplementIds: { id: string; timing: DoseTiming }[];
    reminder?: Omit<Reminder, "id" | "createdAt">;
  }) => void;

  exportBackup: () => BackupPayload;
  importBackup: (raw: unknown) => boolean;

  resetAll: () => void;
}

function upsertCheckin(
  checkins: DailyCheckin[],
  key: string,
  patch: Partial<
    Pick<
      DailyCheckin,
      | "checkedSupplementIds"
      | "habits"
      | "checkedSessionIds"
      | "vitals"
      | "firstBiteAt"
      | "lastBiteAt"
    >
  >
): DailyCheckin[] {
  const next = [...checkins];
  const idx = next.findIndex((c) => c.date === key);
  const current = idx >= 0 ? normalizeCheckin(next[idx]) : emptyCheckin(key);
  const updated = normalizeCheckin({ ...current, ...patch, date: key });
  if (idx >= 0) next[idx] = updated;
  else next.push(updated);
  return next.sort((a, b) => a.date.localeCompare(b.date)).slice(-120);
}

const persistedDefaults: PersistedNatura = {
  displayName: "",
  stack: [],
  reminders: [],
  favoriteRemedyIds: [],
  favoriteWorkoutIds: [],
  workoutLogs: [],
  checkins: [],
  notificationsEnabled: false,
  onboardingComplete: false,
  soundEnabled: true,
  rdiProfile: "general",
  customWorkouts: [],
  customSupplements: [],
  customRemedies: [],
  weeklySchedule: defaultWeeklySchedule(),
  circadianPrefs: defaultCircadianPrefs(),
  theme: "dark",
};

function normalizeReminder(r: Reminder): Reminder {
  return {
    ...r,
    mode: r.mode ?? "clock",
    time: r.time ?? "",
  };
}

function extrasFrom(p: Partial<PersistedNatura>): Supplement[] {
  return Array.isArray(p.customSupplements) ? p.customSupplements : [];
}

export function applyPersistedJson(raw: string | null): void {
  if (!raw) {
    useNaturaStore.setState({ hasHydrated: true });
    return;
  }
  try {
    const parsed = JSON.parse(raw) as {
      state?: Partial<PersistedNatura> & { reminders?: Reminder[] };
    };
    const p = parsed.state ?? {};
    const extras = extrasFrom(p);
    useNaturaStore.setState({
      displayName: typeof p.displayName === "string" ? p.displayName : "",
      reminders: (p.reminders ?? []).map((r) =>
        normalizeReminder({
          ...r,
          mode: r.mode ?? "clock",
          time: r.time || "07:00",
        })
      ),
      favoriteRemedyIds: Array.isArray(p.favoriteRemedyIds)
        ? p.favoriteRemedyIds
        : [],
      favoriteWorkoutIds: Array.isArray(p.favoriteWorkoutIds)
        ? p.favoriteWorkoutIds
        : [],
      workoutLogs: Array.isArray(p.workoutLogs) ? p.workoutLogs : [],
      checkins: (Array.isArray(p.checkins) ? p.checkins : []).map(normalizeCheckin),
      notificationsEnabled: Boolean(p.notificationsEnabled),
      onboardingComplete: Boolean(p.onboardingComplete) || Boolean(p.stack?.length),
      soundEnabled: p.soundEnabled !== false,
      rdiProfile:
        p.rdiProfile === "male" || p.rdiProfile === "female"
          ? p.rdiProfile
          : "general",
      stack: (Array.isArray(p.stack) ? p.stack : []).map((item) =>
        normalizeStackItem(item as StackItem, extras)
      ),
      customWorkouts: Array.isArray(p.customWorkouts) ? p.customWorkouts : [],
      customSupplements: extras,
      customRemedies: Array.isArray(p.customRemedies) ? p.customRemedies : [],
      weeklySchedule: normalizeWeeklySchedule(
        (p as Partial<PersistedNatura>).weeklySchedule
      ),
      circadianPrefs: normalizeCircadianPrefs(
        (p as Partial<PersistedNatura>).circadianPrefs
      ),
      theme: normalizeTheme((p as Partial<PersistedNatura>).theme),
      hasHydrated: true,
    });
  } catch {
    useNaturaStore.setState({ hasHydrated: true });
  }
}

export const useNaturaStore = create<NaturaState>()(
  persist(
    (set, get) => ({
      ...persistedDefaults,
      hasHydrated: false,

      setDisplayName: (name) => set({ displayName: name }),
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme });
      },
      setOnboardingComplete: (done) => set({ onboardingComplete: done }),
      setRdiProfile: (profile) => set({ rdiProfile: profile }),

      addToStack: (supplementId, timing, note, amount, unit) => {
        const exists = get().stack.some((s) => s.supplementId === supplementId);
        if (exists) return;
        const supp = findSupplement(supplementId, get().customSupplements);
        set({
          stack: [
            ...get().stack,
            normalizeStackItem(
              {
                supplementId,
                timing,
                note,
                addedAt: new Date().toISOString(),
                amount: amount ?? supp?.servingAmount,
                unit: unit ?? supp?.servingUnit,
              },
              get().customSupplements
            ),
          ],
        });
      },

      removeFromStack: (supplementId) =>
        set({
          stack: get().stack.filter((s) => s.supplementId !== supplementId),
          weeklySchedule: stripIdFromSchedule(
            get().weeklySchedule,
            "supplement",
            supplementId
          ),
        }),

      updateStackTiming: (supplementId, timing) =>
        set({
          stack: get().stack.map((s) =>
            s.supplementId === supplementId ? { ...s, timing } : s
          ),
        }),

      updateStackNote: (supplementId, note) =>
        set({
          stack: get().stack.map((s) =>
            s.supplementId === supplementId ? { ...s, note } : s
          ),
        }),

      updateStackDose: (supplementId, amount, unit) =>
        set({
          stack: get().stack.map((s) =>
            s.supplementId === supplementId
              ? { ...s, amount: Number.isNaN(amount) ? s.amount : amount, unit }
              : s
          ),
        }),

      getTodayCheckin: () => {
        const key = todayKey();
        const found = get().checkins.find((c) => c.date === key);
        return found ? normalizeCheckin(found) : emptyCheckin();
      },

      isStackCheckedToday: (supplementId) => {
        return get().getTodayCheckin().checkedSupplementIds.includes(supplementId);
      },

      leftoverFromYesterday: () => {
        const yesterday = addDays(new Date(), -1);
        const ykey = todayKey(yesterday);
        const y = get().checkins.find((c) => c.date === ykey);
        if (!y) return [];
        const checked = new Set(y.checkedSupplementIds ?? []);
        const planned = scheduledStackItems(
          planForWeekday(get().weeklySchedule, yesterday.getDay()),
          get().stack
        );
        return planned.filter((item) => !checked.has(item.supplementId));
      },

      toggleStackCheck: (supplementId) => {
        const key = todayKey();
        const current = get().getTodayCheckin();
        const has = current.checkedSupplementIds.includes(supplementId);
        const checkedSupplementIds = has
          ? current.checkedSupplementIds.filter((id) => id !== supplementId)
          : [...current.checkedSupplementIds, supplementId];
        set({
          checkins: upsertCheckin(get().checkins, key, { checkedSupplementIds }),
        });
      },

      checkStackWindow: (window) => {
        const key = todayKey();
        const current = get().getTodayCheckin();
        const ids = itemsInWindow(get().stack, window).map(
          (item) => item.supplementId
        );
        const checkedSupplementIds = [
          ...new Set([...current.checkedSupplementIds, ...ids]),
        ];
        set({
          checkins: upsertCheckin(get().checkins, key, { checkedSupplementIds }),
        });
      },

      checkStackGroup: (timing) => {
        if (timing === "morning") {
          get().checkStackWindow("morning");
          return;
        }
        if (timing === "evening") {
          get().checkStackWindow("night");
          return;
        }
        const key = todayKey();
        const current = get().getTodayCheckin();
        const ids = get()
          .stack.filter((s) => s.timing === timing)
          .map((s) => s.supplementId);
        const checkedSupplementIds = [
          ...new Set([...current.checkedSupplementIds, ...ids]),
        ];
        set({
          checkins: upsertCheckin(get().checkins, key, { checkedSupplementIds }),
        });
      },

      toggleHabit: (id) => {
        const key = todayKey();
        const current = get().getTodayCheckin();
        const habits = current.habits?.includes(id)
          ? (current.habits ?? []).filter((h) => h !== id)
          : [...(current.habits ?? []), id];
        set({ checkins: upsertCheckin(get().checkins, key, { habits }) });
      },

      isHabitDoneToday: (id) => {
        return get().getTodayCheckin().habits?.includes(id) ?? false;
      },

      toggleSessionCheck: (sessionId) => {
        const key = todayKey();
        const current = get().getTodayCheckin();
        const list = current.checkedSessionIds ?? [];
        const checkedSessionIds = list.includes(sessionId)
          ? list.filter((id) => id !== sessionId)
          : [...list, sessionId];
        set({
          checkins: upsertCheckin(get().checkins, key, { checkedSessionIds }),
        });
      },

      isSessionDoneToday: (sessionId) => {
        return (
          get().getTodayCheckin().checkedSessionIds?.includes(sessionId) ?? false
        );
      },

      addReminder: (input) =>
        set({
          reminders: [
            ...get().reminders,
            {
              ...normalizeReminder(input as Reminder),
              id: uid(),
              createdAt: new Date().toISOString(),
            },
          ],
        }),

      updateReminder: (id, patch) =>
        set({
          reminders: get().reminders.map((r) =>
            r.id === id ? normalizeReminder({ ...r, ...patch }) : r
          ),
        }),

      removeReminder: (id) =>
        set({ reminders: get().reminders.filter((r) => r.id !== id) }),

      toggleFavoriteRemedy: (id) => {
        const favs = get().favoriteRemedyIds;
        set({
          favoriteRemedyIds: favs.includes(id)
            ? favs.filter((x) => x !== id)
            : [...favs, id],
        });
      },

      toggleFavoriteWorkout: (id) => {
        const favs = get().favoriteWorkoutIds;
        set({
          favoriteWorkoutIds: favs.includes(id)
            ? favs.filter((x) => x !== id)
            : [...favs, id],
        });
      },

      logWorkout: (workoutId, meta) =>
        set({
          workoutLogs: [
            ...get().workoutLogs,
            {
              workoutId,
              completedAt: new Date().toISOString(),
              elapsedSec: meta?.elapsedSec,
              plannedSec: meta?.plannedSec,
              completed: meta?.completed ?? true,
            },
          ],
        }),

      completedToday: () => {
        const plan = todayPlan(get().weeklySchedule);
        const counts = workoutLogCounts(get().workoutLogs);
        if (plan.restDay) return true;
        if (workoutSessions(plan).length) {
          return allWorkoutSessionsDone(plan, counts);
        }
        return [...counts.values()].some((n) => n > 0);
      },

      getStreak: () => {
        const logs = get().workoutLogs.filter((l) => l.completed !== false);
        if (logs.length === 0) return 0;
        const days = new Set(
          logs.map((l) => todayKey(new Date(l.completedAt)))
        );
        let streak = 0;
        const cursor = new Date();
        const today = todayKey();
        if (!days.has(today)) {
          cursor.setDate(cursor.getDate() - 1);
        }
        while (true) {
          const key = todayKey(cursor);
          if (!days.has(key)) break;
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
        }
        return streak;
      },

      saveCustomWorkout: (workout) => {
        const list = get().customWorkouts.filter((w) => w.id !== workout.id);
        set({ customWorkouts: [...list, { ...workout, custom: true }] });
      },

      removeCustomWorkout: (id) =>
        set({
          customWorkouts: get().customWorkouts.filter((w) => w.id !== id),
          favoriteWorkoutIds: get().favoriteWorkoutIds.filter((x) => x !== id),
          weeklySchedule: stripIdFromSchedule(get().weeklySchedule, "workout", id),
        }),

      saveCustomSupplement: (supplement) => {
        const list = get().customSupplements.filter((s) => s.id !== supplement.id);
        set({
          customSupplements: [...list, { ...supplement, custom: true }],
        });
      },

      removeCustomSupplement: (id) =>
        set({
          customSupplements: get().customSupplements.filter((s) => s.id !== id),
          stack: get().stack.filter((s) => s.supplementId !== id),
          weeklySchedule: stripIdFromSchedule(
            get().weeklySchedule,
            "supplement",
            id
          ),
        }),

      saveCustomRemedy: (remedy) => {
        const list = get().customRemedies.filter((r) => r.id !== remedy.id);
        set({ customRemedies: [...list, { ...remedy, custom: true }] });
      },

      removeCustomRemedy: (id) =>
        set({
          customRemedies: get().customRemedies.filter((r) => r.id !== id),
          favoriteRemedyIds: get().favoriteRemedyIds.filter((x) => x !== id),
          weeklySchedule: stripIdFromSchedule(get().weeklySchedule, "remedy", id),
        }),

      completeOnboarding: ({ name, supplementIds, reminder }) => {
        const now = new Date().toISOString();
        const current = get();
        const existing = new Set(current.stack.map((s) => s.supplementId));
        const added: StackItem[] = supplementIds
          .filter((s) => !existing.has(s.id))
          .map((s) =>
            normalizeStackItem(
              {
                supplementId: s.id,
                timing: s.timing,
                addedAt: now,
              },
              current.customSupplements
            )
          );
        const reminders = [...current.reminders];
        if (reminder) {
          const dup = reminders.some(
            (r) =>
              r.title === reminder.title &&
              r.mode === (reminder.mode ?? "clock") &&
              r.time === (reminder.time ?? "")
          );
          if (!dup) {
            reminders.push({
              ...normalizeReminder(reminder as Reminder),
              id: uid(),
              createdAt: now,
            });
          }
        }
        set({
          displayName: name.trim() || current.displayName,
          stack: [...current.stack, ...added],
          reminders,
          onboardingComplete: true,
        });
      },

      exportBackup: () => {
        const s = get();
        return {
          version: PERSIST_VERSION,
          exportedAt: new Date().toISOString(),
          displayName: s.displayName,
          stack: s.stack,
          reminders: s.reminders,
          favoriteRemedyIds: s.favoriteRemedyIds,
          favoriteWorkoutIds: s.favoriteWorkoutIds,
          workoutLogs: s.workoutLogs,
          checkins: s.checkins,
          notificationsEnabled: s.notificationsEnabled,
          onboardingComplete: s.onboardingComplete,
          soundEnabled: s.soundEnabled,
          rdiProfile: s.rdiProfile,
          customWorkouts: s.customWorkouts,
          customSupplements: s.customSupplements,
          customRemedies: s.customRemedies,
          weeklySchedule: s.weeklySchedule,
          circadianPrefs: s.circadianPrefs,
          theme: s.theme,
        };
      },

      importBackup: (raw) => {
        const parsed = parseBackup(raw);
        if (!parsed) return false;
        set({
          displayName: parsed.displayName,
          stack: parsed.stack.map((item) =>
            normalizeStackItem(item, parsed.customSupplements)
          ),
          rdiProfile: parsed.rdiProfile,
          reminders: parsed.reminders.map(normalizeReminder),
          favoriteRemedyIds: parsed.favoriteRemedyIds,
          favoriteWorkoutIds: parsed.favoriteWorkoutIds,
          workoutLogs: parsed.workoutLogs,
          checkins: parsed.checkins.map(normalizeCheckin),
          notificationsEnabled: parsed.notificationsEnabled,
          onboardingComplete: parsed.onboardingComplete,
          soundEnabled: parsed.soundEnabled,
          customWorkouts: parsed.customWorkouts,
          customSupplements: parsed.customSupplements,
          customRemedies: parsed.customRemedies,
          weeklySchedule: parsed.weeklySchedule,
          circadianPrefs: parsed.circadianPrefs,
          theme: parsed.theme,
        });
        return true;
      },

      updateDayPlan: (weekday, patch) =>
        set({ weeklySchedule: patchDay(get().weeklySchedule, weekday, patch) }),

      addDaySession: (weekday, input) => {
        const plan = planForWeekday(get().weeklySchedule, weekday);
        const existing = plan.sessions ?? [];
        const session: PlanSession = {
          id: uid("sess"),
          kind: input.kind,
          time: input.time || nextSessionTime(existing, input.kind),
          refId: input.refId,
          title: input.title,
          note: input.note,
        };
        set({
          weeklySchedule: patchDay(get().weeklySchedule, weekday, {
            sessions: [...existing, session],
            restDay: input.kind === "workout" ? false : plan.restDay,
          }),
        });
      },

      updateDaySession: (weekday, sessionId, patch) => {
        const plan = planForWeekday(get().weeklySchedule, weekday);
        const sessions = plan.sessions ?? [];
        set({
          weeklySchedule: patchDay(get().weeklySchedule, weekday, {
            sessions: sessions.map((s) =>
              s.id === sessionId ? { ...s, ...patch, id: s.id } : s
            ),
          }),
        });
      },

      removeDaySession: (weekday, sessionId) => {
        const plan = planForWeekday(get().weeklySchedule, weekday);
        set({
          weeklySchedule: patchDay(get().weeklySchedule, weekday, {
            sessions: (plan.sessions ?? []).filter((s) => s.id !== sessionId),
          }),
        });
      },

      toggleDaySupplement: (weekday, supplementId) => {
        const plan = planForWeekday(get().weeklySchedule, weekday);
        const current = plan.useFullStack
          ? get().stack.map((s) => s.supplementId)
          : plan.supplementIds;
        const has = current.includes(supplementId);
        set({
          weeklySchedule: patchDay(get().weeklySchedule, weekday, {
            useFullStack: false,
            supplementIds: has
              ? current.filter((id) => id !== supplementId)
              : [...current, supplementId],
          }),
        });
      },

      setDayFullStack: (weekday, useFullStack) => {
        const ids = useFullStack
          ? []
          : get().stack.map((s) => s.supplementId);
        set({
          weeklySchedule: patchDay(get().weeklySchedule, weekday, {
            useFullStack,
            supplementIds: ids,
          }),
        });
      },

      toggleDayHabit: (weekday, habitId) => {
        const plan = planForWeekday(get().weeklySchedule, weekday);
        const has = plan.habits.includes(habitId);
        set({
          weeklySchedule: patchDay(get().weeklySchedule, weekday, {
            habits: has
              ? plan.habits.filter((id) => id !== habitId)
              : [...plan.habits, habitId],
          }),
        });
      },

      copyDayPlan: (fromWeekday, targets) =>
        set({
          weeklySchedule: copyDayTo(get().weeklySchedule, fromWeekday, targets),
        }),

      setScheduleRemindersEnabled: (enabled) =>
        set({
          weeklySchedule: {
            ...normalizeWeeklySchedule(get().weeklySchedule),
            remindersEnabled: enabled,
          },
        }),

      applyFoundation: (id) => {
        const current = get();
        const prefs = normalizeCircadianPrefs(current.circadianPrefs);
        const recipe = foundationRecipe(id, prefs);
        const extras = current.customSupplements;
        const stack = [...current.stack];
        const now = new Date().toISOString();
        for (const item of recipe.supplements) {
          if (!findSupplement(item.id, extras)) continue;
          if (stack.some((s) => s.supplementId === item.id)) continue;
          stack.push(
            normalizeStackItem(
              {
                supplementId: item.id,
                timing: item.timing,
                addedAt: now,
              },
              extras
            )
          );
        }
        set({
          stack,
          weeklySchedule: applyRecipeToWeek(
            current.weeklySchedule,
            recipe,
            {
              foundationId: id,
              hasWorkout: (workoutId) =>
                Boolean(findWorkout(workoutId, current.customWorkouts)),
              hasRemedy: (remedyId) =>
                Boolean(findRemedy(remedyId, current.customRemedies)),
              newId: () => uid("sess"),
            }
          ),
        });
      },

      setCircadianPrefs: (patch) =>
        set({
          circadianPrefs: normalizeCircadianPrefs({
            ...get().circadianPrefs,
            ...patch,
          }),
        }),

      setTodayVitals: (patch) => {
        const key = todayKey();
        const current = get().getTodayCheckin();
        const merged: DailyVitals = { ...(current.vitals ?? {}) };
        (Object.keys(patch) as (keyof DailyVitals)[]).forEach((field) => {
          const value = patch[field];
          if (value === undefined || Number.isNaN(value)) {
            delete merged[field];
          } else {
            merged[field] = value;
          }
        });
        set({
          checkins: upsertCheckin(get().checkins, key, {
            vitals: normalizeVitals(merged),
          }),
        });
      },

      setTodayEating: (patch) => {
        const key = todayKey();
        const current = get().getTodayCheckin();
        set({
          checkins: upsertCheckin(get().checkins, key, {
            firstBiteAt:
              patch.firstBiteAt !== undefined
                ? patch.firstBiteAt
                : current.firstBiteAt,
            lastBiteAt:
              patch.lastBiteAt !== undefined
                ? patch.lastBiteAt
                : current.lastBiteAt,
          }),
        });
      },

      resetAll: () =>
        set({
          ...persistedDefaults,
          hasHydrated: true,
        }),
    }),
    {
      name: "natura-storage",
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          throw new Error("no-window");
        }
        return {
          getItem: (name: string) => window.localStorage.getItem(name),
          setItem: (name: string, value: string) => {
            if (!persistWritesEnabled) return;
            window.localStorage.setItem(name, value);
          },
          removeItem: (name: string) => window.localStorage.removeItem(name),
        };
      }),
      partialize: (state) => ({
        displayName: state.displayName,
        stack: state.stack,
        reminders: state.reminders,
        favoriteRemedyIds: state.favoriteRemedyIds,
        favoriteWorkoutIds: state.favoriteWorkoutIds,
        workoutLogs: state.workoutLogs,
        checkins: state.checkins,
        notificationsEnabled: state.notificationsEnabled,
        onboardingComplete: state.onboardingComplete,
        soundEnabled: state.soundEnabled,
        rdiProfile: state.rdiProfile,
        customWorkouts: state.customWorkouts,
        customSupplements: state.customSupplements,
        customRemedies: state.customRemedies,
        weeklySchedule: state.weeklySchedule,
        circadianPrefs: state.circadianPrefs,
        theme: state.theme,
      }),
      skipHydration: true,
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<PersistedNatura> & {
          reminders?: Reminder[];
        };
        const extras = extrasFrom(p);
        const reminders = (p.reminders ?? []).map((r) =>
          normalizeReminder({
            ...r,
            mode: r.mode ?? "clock",
            time: r.time || "07:00",
          })
        );
        const hasData = Boolean(
          p.displayName ||
            (p.stack && p.stack.length) ||
            reminders.length ||
            (p.workoutLogs && p.workoutLogs.length)
        );
        return {
          ...persistedDefaults,
          ...p,
          reminders,
          favoriteWorkoutIds: p.favoriteWorkoutIds ?? [],
          onboardingComplete:
            version >= 2
              ? Boolean(p.onboardingComplete)
              : Boolean(p.onboardingComplete) || hasData,
          soundEnabled: p.soundEnabled ?? true,
          rdiProfile: p.rdiProfile ?? "general",
          stack: (p.stack ?? []).map((item) =>
            normalizeStackItem(item, extras)
          ),
          checkins: (p.checkins ?? []).map(normalizeCheckin),
          customWorkouts: p.customWorkouts ?? [],
          customSupplements: extras,
          customRemedies: p.customRemedies ?? [],
          weeklySchedule: normalizeWeeklySchedule(
            (p as Partial<PersistedNatura>).weeklySchedule
          ),
          circadianPrefs: normalizeCircadianPrefs(
            (p as Partial<PersistedNatura>).circadianPrefs
          ),
          theme: normalizeTheme((p as Partial<PersistedNatura>).theme),
        };
      },
    }
  )
);

export { todayKey };
