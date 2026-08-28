import { todayKey } from "@/lib/dates";
import type { DailyCheckin, DailyVitals } from "@/lib/types";

function clampNum(n: unknown, min: number, max: number): number | undefined {
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, n));
}

function isHm(s: unknown): s is string {
  return typeof s === "string" && /^\d{1,2}:\d{2}$/.test(s);
}

function padHm(s: string): string {
  const [h, m] = s.split(":");
  return `${String(Number(h)).padStart(2, "0")}:${String(Number(m)).padStart(2, "0")}`;
}

export function normalizeVitals(
  raw?: Partial<DailyVitals> | null
): DailyVitals | undefined {
  if (!raw) return undefined;
  const sleepRaw = clampNum(raw.sleepHours, 0, 14);
  const energy = clampNum(raw.energy, 1, 5);
  const stress = clampNum(raw.stress, 1, 5);
  const restingHr = clampNum(raw.restingHr, 30, 220);
  const out: DailyVitals = {};
  if (sleepRaw !== undefined) out.sleepHours = Math.round(sleepRaw * 2) / 2;
  if (energy !== undefined) out.energy = Math.round(energy);
  if (stress !== undefined) out.stress = Math.round(stress);
  if (restingHr !== undefined) out.restingHr = Math.round(restingHr);
  return Object.keys(out).length ? out : undefined;
}

export function emptyCheckin(date = todayKey()): DailyCheckin {
  return { date, checkedSupplementIds: [], habits: [], checkedSessionIds: [] };
}

export function normalizeCheckin(c: DailyCheckin): DailyCheckin {
  return {
    date: c.date,
    checkedSupplementIds: Array.isArray(c.checkedSupplementIds)
      ? c.checkedSupplementIds
      : [],
    habits: Array.isArray(c.habits) ? c.habits : [],
    checkedSessionIds: Array.isArray(c.checkedSessionIds)
      ? c.checkedSessionIds
      : [],
    vitals: normalizeVitals(c.vitals),
    firstBiteAt: isHm(c.firstBiteAt) ? padHm(c.firstBiteAt) : undefined,
    lastBiteAt: isHm(c.lastBiteAt) ? padHm(c.lastBiteAt) : undefined,
  };
}
