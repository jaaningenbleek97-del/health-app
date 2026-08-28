import type { Reminder } from "./types";

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function notificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function todayMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function reminderAppliesToday(
  reminder: Reminder,
  date = new Date()
): boolean {
  if (!reminder.enabled) return false;
  if (!reminder.days.length) return true;
  return reminder.days.includes(date.getDay());
}

export interface DueReminder {
  reminder: Reminder;
  minutesUntil: number;
  status: "due" | "upcoming" | "passed";
}

const nextFireAt = new Map<string, number>();
const scheduledTimeouts = new Map<string, number>();
const scheduledIntervals = new Map<string, number>();

export function getNextIntervalFire(id: string): number | undefined {
  return nextFireAt.get(id);
}

export function getReminderStatus(
  reminder: Reminder,
  now = new Date()
): DueReminder | null {
  if (!reminderAppliesToday(reminder, now)) return null;

  if (reminder.mode === "interval") {
    const minutes = reminder.intervalMinutes ?? 60;
    const next = nextFireAt.get(reminder.id);
    if (next) {
      const diff = Math.round((next - now.getTime()) / 60000);
      return {
        reminder,
        minutesUntil: diff,
        status: diff <= 0 ? "due" : "upcoming",
      };
    }
    return { reminder, minutesUntil: minutes, status: "upcoming" };
  }

  if (!reminder.time) return null;
  const target = parseTimeToMinutes(reminder.time);
  const current = now.getHours() * 60 + now.getMinutes();
  const diff = target - current;
  let status: DueReminder["status"];
  if (diff <= 0 && diff >= -30) status = "due";
  else if (diff > 0) status = "upcoming";
  else status = "passed";
  return { reminder, minutesUntil: diff, status };
}

export function listTodayReminders(reminders: Reminder[]): DueReminder[] {
  const order = { due: 0, upcoming: 1, passed: 2 };
  return reminders
    .map((r) => getReminderStatus(r))
    .filter((x): x is DueReminder => x !== null)
    .sort((a, b) => {
      if (a.status !== b.status) return order[a.status] - order[b.status];
      return a.minutesUntil - b.minutesUntil;
    });
}

export function clearScheduledReminders(): void {
  if (typeof window === "undefined") return;
  scheduledTimeouts.forEach((id) => window.clearTimeout(id));
  scheduledIntervals.forEach((id) => window.clearInterval(id));
  scheduledTimeouts.clear();
  scheduledIntervals.clear();
}

function canNotify(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

function fireNotification(reminder: Reminder): void {
  if (!canNotify()) return;
  new Notification("Natura reminder", {
    body: reminder.title,
    tag: reminder.id,
  });
}

/** Schedule clock + interval alerts. Interval countdowns work even without permission. */
export function scheduleTodayNotifications(reminders: Reminder[]): number {
  if (typeof window === "undefined") return 0;

  clearScheduledReminders();
  const now = new Date();
  let scheduled = 0;

  for (const reminder of reminders) {
    if (!reminderAppliesToday(reminder, now)) continue;

    if (reminder.mode === "interval" && reminder.intervalMinutes) {
      const ms = reminder.intervalMinutes * 60 * 1000;
      nextFireAt.set(reminder.id, Date.now() + ms);
      const intervalId = window.setInterval(() => {
        nextFireAt.set(reminder.id, Date.now() + ms);
        fireNotification(reminder);
      }, ms);
      scheduledIntervals.set(reminder.id, intervalId);
      scheduled += 1;
      continue;
    }

    if (!reminder.time) continue;
    const [h, m] = reminder.time.split(":").map(Number);
    const fire = new Date(now);
    fire.setHours(h, m, 0, 0);
    const delay = fire.getTime() - now.getTime();
    if (delay <= 0 || delay > 24 * 60 * 60 * 1000) continue;

    const timeoutId = window.setTimeout(() => {
      fireNotification(reminder);
    }, delay);
    scheduledTimeouts.set(reminder.id, timeoutId);
    scheduled += 1;
  }

  return scheduled;
}

export function formatMinutesUntil(minutes: number): string {
  if (minutes <= 0) return "now";
  if (minutes < 60) return `in ${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `in ${h}h ${m}m` : `in ${h}h`;
}

export function formatInterval(minutes: number): string {
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return h === 1 ? "Every 1 hour" : `Every ${h} hours`;
  }
  return `Every ${minutes} min`;
}

export function formatReminderWhen(reminder: Reminder): string {
  if (reminder.mode === "interval") {
    return formatInterval(reminder.intervalMinutes ?? 60);
  }
  return reminder.time || "—";
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatReminderDays(days: number[]): string {
  if (!days.length) return "Every day";
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) {
    return "Weekdays";
  }
  if (days.length === 2 && days.includes(0) && days.includes(6)) {
    return "Weekends";
  }
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS[d])
    .join(", ");
}

export { todayMinutes, parseTimeToMinutes };
