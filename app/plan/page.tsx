"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  allRemedies,
  allSupplements,
  allWorkouts,
  findRemedy,
  findWorkout,
  workoutDisplayMin,
} from "@/lib/catalog";
import { HABITS } from "@/lib/habits";
import { matchesQuery } from "@/lib/search";
import {
  WEEKDAY_LONG,
  WEEKDAY_NAMES,
  WEEKDAY_ORDER,
  careSessions,
  planForWeekday,
  scheduledStackItems,
  sessionTitle,
  workoutSessions,
} from "@/lib/schedule";
import { useNaturaStore } from "@/lib/store";

export default function PlanPage() {
  const weeklySchedule = useNaturaStore((s) => s.weeklySchedule);
  const stack = useNaturaStore((s) => s.stack);
  const customWorkouts = useNaturaStore((s) => s.customWorkouts);
  const customSupplements = useNaturaStore((s) => s.customSupplements);
  const customRemedies = useNaturaStore((s) => s.customRemedies);
  const updateDayPlan = useNaturaStore((s) => s.updateDayPlan);
  const addDaySession = useNaturaStore((s) => s.addDaySession);
  const updateDaySession = useNaturaStore((s) => s.updateDaySession);
  const removeDaySession = useNaturaStore((s) => s.removeDaySession);
  const toggleDaySupplement = useNaturaStore((s) => s.toggleDaySupplement);
  const setDayFullStack = useNaturaStore((s) => s.setDayFullStack);
  const toggleDayHabit = useNaturaStore((s) => s.toggleDayHabit);
  const copyDayPlan = useNaturaStore((s) => s.copyDayPlan);
  const setScheduleRemindersEnabled = useNaturaStore(
    (s) => s.setScheduleRemindersEnabled
  );

  const todayWeekday = new Date().getDay();
  const [selected, setSelected] = useState(todayWeekday);
  const [workoutQuery, setWorkoutQuery] = useState("");
  const [remedyQuery, setRemedyQuery] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customTime, setCustomTime] = useState("20:00");
  const [customNote, setCustomNote] = useState("");
  const [copied, setCopied] = useState("");

  const workouts = useMemo(
    () => allWorkouts(customWorkouts),
    [customWorkouts]
  );
  const supplements = useMemo(
    () => allSupplements(customSupplements),
    [customSupplements]
  );
  const remedies = useMemo(
    () => allRemedies(customRemedies),
    [customRemedies]
  );
  const plan = planForWeekday(weeklySchedule, selected);
  const dayStack = scheduledStackItems(plan, stack);
  const dayWorkouts = workoutSessions(plan);
  const dayCare = careSessions(plan);
  const workoutMatches = workouts.filter((w) =>
    matchesQuery(workoutQuery, [w.title, w.description, w.category])
  );
  const remedyMatches = remedies.filter((r) =>
    matchesQuery(remedyQuery, [r.title, r.summary, r.category, ...r.ingredients])
  );

  function flash(message: string) {
    setCopied(message);
    window.setTimeout(() => setCopied(""), 2000);
  }

  function onAddCustom(e: FormEvent) {
    e.preventDefault();
    if (!customTitle.trim()) return;
    addDaySession(selected, {
      kind: "custom",
      title: customTitle.trim(),
      time: customTime,
      note: customNote.trim() || undefined,
    });
    setCustomTitle("");
    setCustomNote("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-sage-900">Plan</h1>
        <p className="mt-1 text-sm text-sage-600">
          Edit the repeating week. Give each workout or care slot its own time.
        </p>
      </div>

      <section className="card space-y-3 p-4">
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>
            <span className="font-medium text-sage-900">Plan reminders</span>
            <span className="mt-0.5 block text-xs text-sage-600">
              Pings at each session time while the tab is open.
            </span>
          </span>
          <input
            type="checkbox"
            checked={weeklySchedule.remindersEnabled}
            onChange={(e) => setScheduleRemindersEnabled(e.target.checked)}
          />
        </label>
        <Link href="/reminders" className="block text-sm font-medium text-sage-700 underline">
          Extra custom reminders
        </Link>
      </section>

      <section className="card p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-sage-500">
          This week, every week
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_ORDER.map((weekday) => {
            const day = planForWeekday(weeklySchedule, weekday);
            const on = selected === weekday;
            const isToday = weekday === todayWeekday;
            const w = workoutSessions(day).length;
            const c = careSessions(day).length;
            let chip = "—";
            if (day.restDay && !c) chip = "Rest";
            else if (day.restDay && c) chip = `Rest · ${c}`;
            else if (w && c) chip = `${w} + ${c}`;
            else if (w) chip = `${w} workout${w === 1 ? "" : "s"}`;
            else if (c) chip = `${c} care`;
            return (
              <button
                key={weekday}
                type="button"
                onClick={() => setSelected(weekday)}
                className={`rounded-xl px-1 py-2 text-center ${
                  on
                    ? "bg-sage-600 text-white"
                    : isToday
                      ? "bg-sage-100 text-sage-900"
                      : "bg-cream-50 text-sage-800"
                }`}
              >
                <div className="text-[10px] font-medium opacity-80">
                  {WEEKDAY_NAMES[weekday]}
                </div>
                <div className="mt-1 text-[10px] leading-tight">{chip}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-sage-900">
              {WEEKDAY_LONG[selected]}
            </h2>
            {selected === todayWeekday && (
              <p className="text-xs text-sage-600">Shows on Home today</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={plan.restDay}
              onChange={(e) =>
                updateDayPlan(selected, { restDay: e.target.checked })
              }
            />
            Rest day
          </label>
        </div>

        <label className="block text-sm">
          Note
          <textarea
            className="mt-1 w-full rounded-xl border border-cream-200 bg-surface px-3 py-2 text-sm"
            rows={2}
            placeholder="Optional — e.g. gym closed, travel day"
            value={plan.note}
            onChange={(e) => updateDayPlan(selected, { note: e.target.value })}
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TimeField
            label="Morning supplements"
            href="/stack/morning"
            value={plan.stackMorningTime}
            onChange={(stackMorningTime) =>
              updateDayPlan(selected, { stackMorningTime })
            }
          />
          <TimeField
            label="Night supplements"
            href="/stack/night"
            value={plan.stackEveningTime}
            onChange={(stackEveningTime) =>
              updateDayPlan(selected, { stackEveningTime })
            }
          />
        </div>
      </section>

      <section className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sage-900">Workout sessions</h2>
          <Link href="/fitness/new" className="text-xs font-medium text-sage-700 underline">
            Custom
          </Link>
        </div>
        {plan.restDay && (
          <p className="text-sm text-sage-600">
            Rest day — Home will not require a session. Adding a workout turns
            rest off.
          </p>
        )}
        {dayWorkouts.length > 0 && (
          <ul className="space-y-2">
            {dayWorkouts.map((session) => {
              const workout = session.refId
                ? findWorkout(session.refId, customWorkouts)
                : undefined;
              return (
                <li
                  key={session.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl bg-cream-50 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-sage-900">
                      {sessionTitle(session, workouts, remedies)}
                    </div>
                    {workout && (
                      <div className="text-xs text-sage-600">
                        {workoutDisplayMin(workout)} min · {workout.category}
                      </div>
                    )}
                  </div>
                  <input
                    type="time"
                    className="rounded-lg border border-cream-200 bg-surface px-2 py-1 text-sm"
                    value={session.time}
                    onChange={(e) =>
                      updateDaySession(selected, session.id, {
                        time: e.target.value,
                      })
                    }
                    aria-label={`Time for ${sessionTitle(session, workouts, remedies)}`}
                  />
                  <button
                    type="button"
                    className="text-xs text-terracotta-700"
                    onClick={() => removeDaySession(selected, session.id)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <input
          type="search"
          className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2 text-sm"
          placeholder="Add another workout session…"
          value={workoutQuery}
          onChange={(e) => setWorkoutQuery(e.target.value)}
        />
        <ul className="max-h-56 space-y-1 overflow-y-auto">
          {workoutMatches.slice(0, 20).map((workout) => {
            const count = dayWorkouts.filter((s) => s.refId === workout.id).length;
            return (
              <li key={workout.id}>
                <button
                  type="button"
                  onClick={() =>
                    addDaySession(selected, {
                      kind: "workout",
                      refId: workout.id,
                    })
                  }
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-cream-50"
                >
                  <span>
                    {workout.title}
                    <span className="ml-2 text-xs text-sage-500">
                      {workoutDisplayMin(workout)} min
                    </span>
                  </span>
                  <span className="text-xs font-medium">
                    {count ? `Add another · ${count} on day` : "Add"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sage-900">Care & remedies</h2>
          <Link href="/remedies/new" className="text-xs font-medium text-sage-700 underline">
            Custom remedy
          </Link>
        </div>
        <p className="text-xs text-sage-600">
          Timed rituals for sleep, digestion, or other discomforts. Wellness
          education only — not a diagnosis or treatment.
        </p>
        {dayCare.length > 0 && (
          <ul className="space-y-2">
            {dayCare.map((session) => {
              const remedy =
                session.kind === "remedy" && session.refId
                  ? findRemedy(session.refId, customRemedies)
                  : undefined;
              return (
                <li
                  key={session.id}
                  className="space-y-2 rounded-xl bg-cream-50 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-sage-900">
                        {sessionTitle(session, workouts, remedies)}
                      </div>
                      <div className="text-xs text-sage-600">
                        {session.kind === "custom" ? "Custom" : "Remedy"}
                        {remedy ? ` · ${remedy.category}` : ""}
                        {session.note ? ` · ${session.note}` : ""}
                      </div>
                    </div>
                    <input
                      type="time"
                      className="rounded-lg border border-cream-200 bg-surface px-2 py-1 text-sm"
                      value={session.time}
                      onChange={(e) =>
                        updateDaySession(selected, session.id, {
                          time: e.target.value,
                        })
                      }
                      aria-label={`Time for ${sessionTitle(session, workouts, remedies)}`}
                    />
                    <button
                      type="button"
                      className="text-xs text-terracotta-700"
                      onClick={() => removeDaySession(selected, session.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form onSubmit={onAddCustom} className="space-y-2 rounded-xl border border-cream-200 p-3">
          <div className="text-sm font-medium text-sage-900">Add a custom time</div>
          <input
            className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2 text-sm"
            placeholder="e.g. Ginger tea for queasiness"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs text-sage-600">
              Time
              <input
                type="time"
                className="mt-1 w-full rounded-xl border border-cream-200 bg-surface px-3 py-2 text-sm text-sage-900"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            </label>
            <label className="block text-xs text-sage-600">
              Note
              <input
                className="mt-1 w-full rounded-xl border border-cream-200 bg-surface px-3 py-2 text-sm text-sage-900"
                placeholder="Optional"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="btn-secondary w-full">
            Add custom slot
          </button>
        </form>

        <input
          type="search"
          className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2 text-sm"
          placeholder="Add a catalog remedy…"
          value={remedyQuery}
          onChange={(e) => setRemedyQuery(e.target.value)}
        />
        <ul className="max-h-56 space-y-1 overflow-y-auto">
          {remedyMatches.slice(0, 10).map((remedy) => (
            <li key={remedy.id}>
              <button
                type="button"
                onClick={() =>
                  addDaySession(selected, {
                    kind: "remedy",
                    refId: remedy.id,
                    title: remedy.title,
                  })
                }
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-cream-50"
              >
                <span>
                  {remedy.title}
                  <span className="ml-2 text-xs text-sage-500">
                    {remedy.category}
                  </span>
                </span>
                <span className="text-xs font-medium">Add</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sage-900">Supplements</h2>
          <div className="flex gap-3">
            <Link
              href="/stack/morning"
              className="text-xs font-medium text-sage-700 underline"
            >
              Edit morning
            </Link>
            <Link
              href="/stack/night"
              className="text-xs font-medium text-sage-700 underline"
            >
              Edit night
            </Link>
          </div>
        </div>
        {stack.length === 0 ? (
          <p className="text-sm text-sage-600">
            No supplements yet.{" "}
            <Link href="/supplements" className="underline">
              Add vitamins
            </Link>
          </p>
        ) : (
          <>
            <label className="flex items-center justify-between text-sm">
              <span>Use all supplements this day</span>
              <input
                type="checkbox"
                checked={plan.useFullStack}
                onChange={(e) => setDayFullStack(selected, e.target.checked)}
              />
            </label>
            <p className="text-xs text-sage-600">
              {plan.useFullStack
                ? `All ${stack.length} supplements · morning ${plan.stackMorningTime} · night ${plan.stackEveningTime}`
                : `${dayStack.length} of ${stack.length} selected`}
            </p>
            <ul className="space-y-1">
              {stack.map((item) => {
                const supp = supplements.find((s) => s.id === item.supplementId);
                const on =
                  plan.useFullStack ||
                  plan.supplementIds.includes(item.supplementId);
                return (
                  <li key={item.supplementId}>
                    <button
                      type="button"
                      onClick={() =>
                        toggleDaySupplement(selected, item.supplementId)
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                        on ? "bg-sage-100" : "bg-cream-50 text-sage-500"
                      }`}
                    >
                      <span>
                        {supp?.name ?? item.supplementId}
                        <span className="ml-2 text-xs text-sage-500">
                          {item.timing.replace("_", " ")}
                        </span>
                      </span>
                      <span className="text-xs font-medium">
                        {on ? "On" : "Off"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold text-sage-900">Daily habits</h2>
        <ul className="space-y-1">
          {HABITS.map((habit) => {
            const on = plan.habits.includes(habit.id);
            return (
              <li key={habit.id}>
                <button
                  type="button"
                  onClick={() => toggleDayHabit(selected, habit.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                    on ? "bg-sage-100" : "bg-cream-50 text-sage-500"
                  }`}
                >
                  <span>{habit.label}</span>
                  <span className="text-xs font-medium">{on ? "On" : "Off"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card space-y-2 p-4">
        <h2 className="font-semibold text-sage-900">Copy this day</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              copyDayPlan(selected, [1, 2, 3, 4, 5]);
              flash("Copied to weekdays");
            }}
          >
            Weekdays
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              copyDayPlan(selected, [0, 6]);
              flash("Copied to weekend");
            }}
          >
            Weekend
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              copyDayPlan(selected, [0, 1, 2, 3, 4, 5, 6]);
              flash("Copied to every day");
            }}
          >
            Every day
          </button>
        </div>
        {copied && <p className="text-xs text-sage-600">{copied}</p>}
      </section>
    </div>
  );
}

function TimeField({
  label,
  href,
  value,
  onChange,
}: {
  label: string;
  href?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="block text-sm">
      {href ? (
        <Link href={href} className="font-medium text-sage-700 underline">
          {label}
        </Link>
      ) : (
        <label htmlFor={`time-${label}`} className="text-sage-800">
          {label}
        </label>
      )}
      <input
        id={href ? undefined : `time-${label}`}
        type="time"
        aria-label={label}
        className="mt-1 w-full rounded-xl border border-cream-200 bg-surface px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
