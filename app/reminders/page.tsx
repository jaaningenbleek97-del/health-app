"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { allRemedies, allWorkouts } from "@/lib/catalog";
import { combinedReminders } from "@/lib/schedule";
import { useNaturaStore } from "@/lib/store";
import type { Reminder, ReminderMode } from "@/lib/types";
import {
  DAY_LABELS,
  formatMinutesUntil,
  formatReminderDays,
  formatReminderWhen,
  listTodayReminders,
  notificationSupported,
  requestNotificationPermission,
  scheduleTodayNotifications,
} from "@/lib/reminders";

const defaultDays = [1, 2, 3, 4, 5];
const intervalOptions = [30, 60, 90, 120, 180];

export default function RemindersPage() {
  const reminders = useNaturaStore((s) => s.reminders);
  const weeklySchedule = useNaturaStore((s) => s.weeklySchedule);
  const stack = useNaturaStore((s) => s.stack);
  const customWorkouts = useNaturaStore((s) => s.customWorkouts);
  const customRemedies = useNaturaStore((s) => s.customRemedies);
  const circadianPrefs = useNaturaStore((s) => s.circadianPrefs);
  const addReminder = useNaturaStore((s) => s.addReminder);
  const updateReminder = useNaturaStore((s) => s.updateReminder);
  const removeReminder = useNaturaStore((s) => s.removeReminder);
  const notificationsEnabled = useNaturaStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useNaturaStore(
    (s) => s.setNotificationsEnabled
  );

  const [title, setTitle] = useState("Time for a workout");
  const [mode, setMode] = useState<ReminderMode>("clock");
  const [time, setTime] = useState("07:00");
  const [intervalMinutes, setIntervalMinutes] = useState(120);
  const [days, setDays] = useState<number[]>(defaultDays);
  const [kind, setKind] = useState<Reminder["kind"]>("exercise");
  const [permNote, setPermNote] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  const merged = useMemo(
    () =>
      combinedReminders(
        reminders,
        weeklySchedule,
        stack,
        allWorkouts(customWorkouts),
        allRemedies(customRemedies),
        { circadian: circadianPrefs }
      ),
    [
      reminders,
      weeklySchedule,
      stack,
      customWorkouts,
      customRemedies,
      circadianPrefs,
    ]
  );

  const today = useMemo(() => {
    void tick;
    return listTodayReminders(merged);
  }, [merged, tick]);

  function toggleDay(d: number) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (mode === "clock" && !time) return;
    addReminder({
      title: title.trim(),
      mode,
      time: mode === "clock" ? time : "",
      intervalMinutes: mode === "interval" ? intervalMinutes : undefined,
      days,
      enabled: true,
      kind,
    });
    setTitle(
      kind === "exercise"
        ? "Time for a workout"
        : kind === "care"
          ? "Care reminder"
          : "Take your supplements"
    );
  }

  async function enableNotifications() {
    if (!notificationSupported()) {
      setPermNote(
        "This browser does not support notifications. You’ll still see due items in the app."
      );
      return;
    }
    const ok = await requestNotificationPermission();
    setNotificationsEnabled(ok);
    const n = scheduleTodayNotifications(merged.filter((r) => r.enabled));
    if (ok) {
      setPermNote(
        `Alerts enabled. ${n} reminder${n === 1 ? "" : "s"} active while this tab stays open. Interval pings only fire while Terrain is open. iPhone Safari often blocks web alerts.`
      );
    } else {
      setPermNote(
        "Permission not granted. Reminders still appear on Home and this page."
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-sage-900">Reminders</h1>
        <p className="mt-1 text-sm text-sage-600">
          Clock times or every-N-minutes pings while this tab is open. Today
          also includes times from{" "}
          <Link href="/plan" className="underline">
            Plan
          </Link>
          .
        </p>
      </div>
      <DisclaimerBanner compact />

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">Browser alerts</h2>
        <p className="text-sm text-sage-600">
          Status:{" "}
          {notificationsEnabled ? "enabled on this device" : "in-app list only"}
        </p>
        <button type="button" className="btn-primary w-full" onClick={enableNotifications}>
          {notificationsEnabled ? "Reschedule today’s alerts" : "Enable notifications"}
        </button>
        {permNote && <p className="text-xs text-sage-600">{permNote}</p>}
      </section>

      <section className="card p-4">
        <h2 className="font-semibold">Today</h2>
        {today.length === 0 ? (
          <p className="mt-2 text-sm text-sage-600">Nothing scheduled for today.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {today.map(({ reminder, minutesUntil, status }) => (
              <li
                key={reminder.id}
                className="flex items-center justify-between rounded-xl bg-cream-50 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">{reminder.title}</div>
                  <div className="text-xs text-sage-600">
                    {formatReminderWhen(reminder)} · {reminder.kind}
                  </div>
                </div>
                <span className={status === "due" ? "chip-terra" : "chip"}>
                  {status === "passed"
                    ? "Done window"
                    : status === "due"
                      ? "Due"
                      : formatMinutesUntil(minutesUntil)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={onSubmit} className="card space-y-3 p-4">
        <h2 className="font-semibold">Add reminder</h2>
        <label className="block text-sm">
          Title
          <input
            className="mt-1 w-full rounded-xl border border-cream-200 bg-surface px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Style
          <select
            className="mt-1 w-full rounded-xl border border-cream-200 bg-surface px-3 py-2"
            value={mode}
            onChange={(e) => setMode(e.target.value as ReminderMode)}
          >
            <option value="clock">At a set time</option>
            <option value="interval">Every N minutes while open</option>
          </select>
        </label>
        {mode === "clock" ? (
          <label className="block text-sm">
            Time
            <input
              type="time"
              className="mt-1 w-full rounded-xl border border-cream-200 bg-surface px-3 py-2"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </label>
        ) : (
          <label className="block text-sm">
            Interval
            <select
              className="mt-1 w-full rounded-xl border border-cream-200 bg-surface px-3 py-2"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(Number(e.target.value))}
            >
              {intervalOptions.map((m) => (
                <option key={m} value={m}>
                  {m >= 60 && m % 60 === 0
                    ? `Every ${m / 60} hour${m === 60 ? "" : "s"}`
                    : `Every ${m} minutes`}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-sm">
          Type
          <select
            className="mt-1 w-full rounded-xl border border-cream-200 bg-surface px-3 py-2"
            value={kind}
            onChange={(e) => setKind(e.target.value as Reminder["kind"])}
          >
            <option value="exercise">Workout</option>
            <option value="stack">Supplements</option>
            <option value="care">Care / remedy</option>
          </select>
        </label>
        <div>
          <div className="text-sm">Days</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DAY_LABELS.map((label, i) => {
              const on = days.includes(i);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    on ? "bg-sage-600 text-white" : "bg-cream-100 text-sage-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="text-xs font-medium text-sage-700 underline"
              onClick={() => setDays([])}
            >
              Every day
            </button>
            <button
              type="button"
              className="text-xs font-medium text-sage-700 underline"
              onClick={() => setDays([1, 2, 3, 4, 5])}
            >
              Weekdays
            </button>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">
          Save reminder
        </button>
      </form>

      <section className="card space-y-2 p-4">
        <h2 className="font-semibold">From your weekly Plan</h2>
        <p className="text-sm text-sage-600">
          {weeklySchedule.remindersEnabled
            ? "On — Home and alerts use today’s workout and supplement times."
            : "Off — only the custom list below will ping."}{" "}
          <Link href="/plan" className="font-medium text-sage-700 underline">
            Edit Plan
          </Link>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Custom reminders</h2>
        {reminders.length === 0 ? (
          <p className="text-sm text-sage-600">None yet.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li key={r.id} className="card flex items-center gap-3 p-3">
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={(e) =>
                    updateReminder(r.id, { enabled: e.target.checked })
                  }
                  aria-label={`Enable ${r.title}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-sage-600">
                    {formatReminderWhen(r)} · {formatReminderDays(r.days)} ·{" "}
                    {r.kind === "stack"
                      ? "supplements"
                      : r.kind === "exercise"
                        ? "workout"
                        : "care"}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs text-terracotta-700"
                  onClick={() => removeReminder(r.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
