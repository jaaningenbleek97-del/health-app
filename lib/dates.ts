export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

/** Monday-start week containing `d`. */
export function startOfWeek(d = new Date()): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

export interface WeekDay {
  key: string;
  label: string;
  weekday: string;
  isToday: boolean;
  isFuture: boolean;
}

export function weekDays(now = new Date()): WeekDay[] {
  const start = startOfWeek(now);
  const today = todayKey(now);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const key = todayKey(date);
    return {
      key,
      label: String(date.getDate()),
      weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
      isToday: key === today,
      isFuture: key > today,
    };
  });
}

export function weekKeys(now = new Date()): string[] {
  return weekDays(now).map((d) => d.key);
}
