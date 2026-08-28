"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CircadianCard } from "@/components/CircadianCard";
import { HabitCheck } from "@/components/HabitCheck";
import { VitalsCard } from "@/components/VitalsCard";
import { WeekStrip } from "@/components/WeekStrip";
import {
  allRemedies,
  allSupplements,
  allWorkouts,
  findWorkout,
  workoutDisplayMin,
} from "@/lib/catalog";
import { currentWindows, dueTimings, HABITS, timingLabel } from "@/lib/habits";
import {
  formatMinutesUntil,
  formatReminderWhen,
  listTodayReminders,
} from "@/lib/reminders";
import {
  careSessions,
  combinedReminders,
  isWorkoutSessionDone,
  scheduledStackItems,
  sessionTitle,
  todayPlan,
  workoutLogCounts,
  workoutSessions,
} from "@/lib/schedule";
import { useNaturaStore } from "@/lib/store";
import { stackWindowPath } from "@/lib/stackWindows";
import { suggestWorkout } from "@/lib/suggest";
import { weekSummaries, weeklyRecap } from "@/lib/week";

export default function HomePage() {
  const displayName = useNaturaStore((s) => s.displayName);
  const stack = useNaturaStore((s) => s.stack);
  const reminders = useNaturaStore((s) => s.reminders);
  const weeklySchedule = useNaturaStore((s) => s.weeklySchedule);
  const logs = useNaturaStore((s) => s.workoutLogs);
  const checkins = useNaturaStore((s) => s.checkins);
  const favoriteWorkoutIds = useNaturaStore((s) => s.favoriteWorkoutIds);
  const customWorkouts = useNaturaStore((s) => s.customWorkouts);
  const customSupplements = useNaturaStore((s) => s.customSupplements);
  const customRemedies = useNaturaStore((s) => s.customRemedies);
  const toggleSessionCheck = useNaturaStore((s) => s.toggleSessionCheck);
  const isSessionDoneToday = useNaturaStore((s) => s.isSessionDoneToday);
  const streak = useNaturaStore((s) => s.getStreak());
  const completedToday = useNaturaStore((s) => s.completedToday());
  const isStackCheckedToday = useNaturaStore((s) => s.isStackCheckedToday);
  const isHabitDoneToday = useNaturaStore((s) => s.isHabitDoneToday);
  const leftoverFromYesterday = useNaturaStore((s) => s.leftoverFromYesterday);
  const circadianPrefs = useNaturaStore((s) => s.circadianPrefs);

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const hour = now?.getHours() ?? 12;
  const windows = currentWindows(hour);
  const due = dueTimings(hour);
  const catalog = useMemo(
    () => allWorkouts(customWorkouts),
    [customWorkouts]
  );
  const suppCatalog = useMemo(
    () => allSupplements(customSupplements),
    [customSupplements]
  );
  const remedyCatalog = useMemo(
    () => allRemedies(customRemedies),
    [customRemedies]
  );
  const plan = useMemo(
    () => todayPlan(weeklySchedule, now ?? undefined),
    [weeklySchedule, now]
  );
  const todayStack = useMemo(
    () => scheduledStackItems(plan, stack),
    [plan, stack]
  );

  const todayReminders = useMemo(() => {
    void now;
    return listTodayReminders(
      combinedReminders(
        reminders,
        weeklySchedule,
        stack,
        catalog,
        remedyCatalog,
        { now: now ?? undefined, circadian: circadianPrefs }
      )
    );
  }, [
    reminders,
    weeklySchedule,
    stack,
    catalog,
    remedyCatalog,
    circadianPrefs,
    now,
  ]);
  const dueOrUpcoming = todayReminders.filter(
    (r) => r.status === "due" || r.status === "upcoming"
  );

  const suggestion = useMemo(
    () =>
      suggestWorkout({
        logs,
        streak,
        completedToday,
        favoriteIds: favoriteWorkoutIds,
        workouts: catalog,
        now: now ?? undefined,
      }),
    [logs, streak, completedToday, favoriteWorkoutIds, catalog, now]
  );

  const week = useMemo(
    () => weekSummaries({ logs, checkins, stack }),
    [logs, checkins, stack]
  );
  const recap = useMemo(
    () => weeklyRecap({ logs, checkins, stack }),
    [logs, checkins, stack]
  );

  const todayWorkoutCounts = useMemo(
    () => workoutLogCounts(logs, now ?? new Date()),
    [logs, now]
  );
  const todayWorkoutSessions = workoutSessions(plan);
  const todayCare = careSessions(plan);
  const careDone =
    todayCare.length > 0 &&
    todayCare.every((s) => isSessionDoneToday(s.id));

  const dueItems = todayStack.filter(
    (item) => due.includes(item.timing) && !isStackCheckedToday(item.supplementId)
  );
  const leftovers = leftoverFromYesterday().filter(
    (item) => !isStackCheckedToday(item.supplementId)
  );
  const stackDone = todayStack.filter((s) =>
    isStackCheckedToday(s.supplementId)
  ).length;

  const morningHabits = HABITS.filter(
    (h) => h.window === "morning" && plan.habits.includes(h.id)
  );
  const middayHabits = HABITS.filter(
    (h) => h.window === "midday" && plan.habits.includes(h.id)
  );
  const eveningHabits = HABITS.filter(
    (h) => h.window === "evening" && plan.habits.includes(h.id)
  );

  const morningNow = windows.includes("morning");
  const middayNow = windows.includes("midday");
  const eveningNow = windows.includes("evening");
  const scheduledMove = todayWorkoutSessions.length > 0 && !plan.restDay;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="text-sm text-sage-600">
          {now
            ? now.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : "Today"}
        </p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-sage-900">
            {displayName ? `Hello, ${displayName}` : "Today’s plan"}
          </h1>
          <Link
            href="/plan"
            className="shrink-0 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-800"
          >
            Edit week
          </Link>
        </div>
        <p className="mt-1 text-sm text-sage-600">
          {plan.note ||
            "From your weekly Plan — check things off as you go."}
        </p>
      </div>

      <CircadianCard />
      <VitalsCard />

      <section className="card divide-y divide-cream-200 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3">
          <h2 className="font-semibold text-sage-900">Daily plan</h2>
          <span className="text-xs text-sage-500">{streak} day streak</span>
        </header>

        {morningHabits.length > 0 && (
          <PlanBlock
            label="Morning"
            now={morningNow}
            done={morningHabits.every((h) => isHabitDoneToday(h.id))}
          >
            {morningHabits.map((h) => (
              <HabitCheck
                key={h.id}
                id={h.id}
                emphasize={morningNow}
              />
            ))}
          </PlanBlock>
        )}

        <PlanBlock
          label="Supplements"
          now={dueItems.length > 0}
          done={todayStack.length > 0 && stackDone === todayStack.length}
        >
          {todayStack.length === 0 ? (
            <p className="px-3 py-2 text-sm text-sage-600">
              {stack.length === 0 ? (
                <>
                  No supplements yet.{" "}
                  <Link href="/supplements" className="underline">
                    Add vitamins
                  </Link>
                </>
              ) : (
                <>
                  None scheduled today.{" "}
                  <Link href="/plan" className="underline">
                    Add on Plan
                  </Link>
                </>
              )}
            </p>
          ) : dueItems.length === 0 ? (
            <p className="px-3 py-2 text-sm text-sage-600">
              {stackDone}/{todayStack.length} taken today
              {plan.useFullStack ? "" : " · today’s picks"}. Nothing due right
              now.
            </p>
          ) : (
            <div className="space-y-2 px-3 py-2">
              <p className="text-xs text-sage-500">
                Due now · {due.map(timingLabel).join(" · ")} · morning{" "}
                {plan.stackMorningTime} · night {plan.stackEveningTime}
              </p>
              <ul className="space-y-1">
                {dueItems.slice(0, 5).map((item) => {
                  const supp = suppCatalog.find(
                    (s) => s.id === item.supplementId
                  );
                  return (
                    <li key={item.supplementId} className="text-sm text-sage-800">
                      {supp?.name ?? item.supplementId}
                    </li>
                  );
                })}
              </ul>
              <Link
                href={stackWindowPath(
                  due.includes("evening") ? "night" : "morning"
                )}
                className="btn-primary w-full"
              >
                Take {dueItems.length} due now
              </Link>
            </div>
          )}
          {leftovers.length > 0 && (
            <p className="px-3 pb-2 text-xs text-terracotta-700">
              {leftovers.length} leftover from yesterday.{" "}
              <Link href="/stack" className="underline">
                Review
              </Link>
            </p>
          )}
          {stack.length > 0 && (
            <p className="space-x-3 px-3 pb-2 text-xs font-medium text-sage-700">
              <Link href="/stack/morning" className="underline">
                Edit morning
              </Link>
              <Link href="/stack/night" className="underline">
                Edit night
              </Link>
            </p>
          )}
        </PlanBlock>

        <PlanBlock
          label="Workout"
          now={!plan.restDay}
          done={completedToday}
        >
          <div className="space-y-2 px-3 py-2">
            {plan.restDay ? (
              <>
                <p className="text-sm font-medium text-sage-900">Rest day</p>
                <p className="text-xs text-sage-600">
                  No session required. Optional extra below.
                </p>
                <Link
                  href={`/fitness/${suggestion.workout.id}`}
                  className="btn-secondary w-full"
                >
                  Optional: {suggestion.workout.title}
                </Link>
              </>
            ) : scheduledMove ? (
              <ul className="space-y-2">
                {todayWorkoutSessions.map((session) => {
                  const workout = session.refId
                    ? findWorkout(session.refId, customWorkouts)
                    : undefined;
                  const done = isWorkoutSessionDone(
                    session,
                    plan,
                    todayWorkoutCounts
                  );
                  return (
                    <li
                      key={session.id}
                      className="rounded-xl bg-cream-50 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-sage-500">
                            {session.time}
                          </p>
                          <p className="text-sm font-medium text-sage-900">
                            {sessionTitle(session, catalog, remedyCatalog)}
                          </p>
                          {workout && (
                            <p className="text-xs text-sage-600">
                              {workoutDisplayMin(workout)} min
                              {done ? " · logged" : ""}
                            </p>
                          )}
                        </div>
                        {done && <span className="chip">Done</span>}
                      </div>
                      {session.refId && (
                        <Link
                          href={`/fitness/${session.refId}`}
                          className={
                            done
                              ? "btn-secondary mt-2 w-full"
                              : "btn-primary mt-2 w-full"
                          }
                        >
                          {done ? "Do again" : "Start"}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <>
                <p className="text-sm font-medium text-sage-900">
                  {completedToday ? "Optional extra" : suggestion.workout.title}
                </p>
                <p className="text-xs text-sage-600">
                  {workoutDisplayMin(suggestion.workout)} min ·{" "}
                  {suggestion.reason}
                </p>
                <p className="text-xs text-sage-600">
                  Nothing pinned for today yet.
                </p>
                <Link
                  href={`/fitness/${suggestion.workout.id}`}
                  className="btn-primary mt-1 w-full"
                >
                  {completedToday ? "Add a short session" : "Start workout"}
                </Link>
                <Link
                  href="/plan"
                  className="block text-center text-xs font-medium text-sage-700 underline"
                >
                  Choose today’s workout on Plan
                </Link>
              </>
            )}
          </div>
        </PlanBlock>

        {todayCare.length > 0 && (
          <PlanBlock
            label="Care"
            now={todayCare.some((s) => !isSessionDoneToday(s.id))}
            done={careDone}
          >
            <ul className="space-y-2 px-3 py-2">
              {todayCare.map((session) => {
                const done = isSessionDoneToday(session.id);
                const href =
                  session.kind === "remedy" && session.refId
                    ? `/remedies/${session.refId}`
                    : "/plan";
                return (
                  <li
                    key={session.id}
                    className="flex items-start gap-3 rounded-xl bg-cream-50 px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSessionCheck(session.id)}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm ${
                        done
                          ? "border-sage-600 bg-sage-600 text-white"
                          : "border-sage-300"
                      }`}
                      aria-pressed={done}
                      aria-label={`Mark ${sessionTitle(session, catalog, remedyCatalog)} done`}
                    >
                      {done ? "✓" : ""}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-sage-500">{session.time}</p>
                      <p className="text-sm font-medium text-sage-900">
                        {sessionTitle(session, catalog, remedyCatalog)}
                      </p>
                      {session.note && (
                        <p className="text-xs text-sage-600">{session.note}</p>
                      )}
                      <Link
                        href={href}
                        className="text-xs font-medium text-sage-700 underline"
                      >
                        {session.kind === "remedy" ? "Open remedy" : "Edit on Plan"}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </PlanBlock>
        )}

        {middayHabits.length > 0 && (
          <PlanBlock
            label="After food"
            now={middayNow}
            done={middayHabits.every((h) => isHabitDoneToday(h.id))}
          >
            {middayHabits.map((h) => (
              <HabitCheck key={h.id} id={h.id} emphasize={middayNow} />
            ))}
          </PlanBlock>
        )}

        {eveningHabits.length > 0 && (
          <PlanBlock
            label="Evening"
            now={eveningNow}
            done={eveningHabits.every((h) => isHabitDoneToday(h.id))}
          >
            {eveningHabits.map((h) => (
              <HabitCheck key={h.id} id={h.id} emphasize={eveningNow} />
            ))}
            <Link
              href="/remedies/chamomile-wind-down"
              className="block px-3 pb-2 text-xs font-medium text-sage-700 underline"
            >
              Wind-down remedy
            </Link>
          </PlanBlock>
        )}
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-sage-500">
            This week
          </h2>
          <Link href="/history" className="text-xs font-medium text-sage-700">
            4-week history
          </Link>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-sage-800">{streak}</div>
            <div className="text-[11px] text-sage-600">day streak</div>
          </div>
          <div>
            <div className="text-xl font-bold text-sage-800">
              {recap.sessions}
            </div>
            <div className="text-[11px] text-sage-600">
              of {recap.daysElapsed} sessions
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-sage-800">
              {stack.length ? `${recap.stackPct}%` : "—"}
            </div>
            <div className="text-[11px] text-sage-600">supplement days</div>
          </div>
        </div>
        <div className="mt-3">
          <WeekStrip days={week} bare />
        </div>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sage-900">Reminders</h2>
          <Link href="/reminders" className="text-sm font-medium text-sage-700">
            Manage
          </Link>
        </div>
        {dueOrUpcoming.length === 0 ? (
          <p className="mt-2 text-sm text-sage-600">
            None upcoming today. Set times on{" "}
            <Link href="/plan" className="underline">
              Plan
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {dueOrUpcoming.slice(0, 4).map(({ reminder, minutesUntil, status }) => (
              <li
                key={reminder.id}
                className="flex items-center justify-between rounded-xl bg-cream-50 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">{reminder.title}</div>
                  <div className="text-xs text-sage-600">
                    {formatReminderWhen(reminder)}
                  </div>
                </div>
                <span className={status === "due" ? "chip-terra" : "chip"}>
                  {status === "due" ? "Due" : formatMinutesUntil(minutesUntil)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PlanBlock({
  label,
  now,
  done,
  children,
}: {
  label: string;
  now?: boolean;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="px-1 py-2">
      <div className="flex items-center gap-2 px-3 pb-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-sage-500">
          {label}
        </h3>
        {now && !done && <span className="chip">Now</span>}
        {done && <span className="chip">Done</span>}
      </div>
      {children}
    </div>
  );
}
