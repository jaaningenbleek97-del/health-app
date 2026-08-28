"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { findWorkout, workoutDisplayMin, workoutTimedSec } from "@/lib/catalog";
import { playBeep } from "@/lib/audio";
import { useNaturaStore } from "@/lib/store";
import type { WorkoutStep } from "@/lib/types";

function stepLabel(step: WorkoutStep): string {
  if (step.durationSec) {
    const m = Math.floor(step.durationSec / 60);
    const s = step.durationSec % 60;
    return m ? `${m}m ${s ? `${s}s` : ""}`.trim() : `${s}s`;
  }
  const parts: string[] = [];
  if (step.sets) parts.push(`${step.sets} sets`);
  if (step.reps) parts.push(`${step.reps} reps`);
  return parts.join(" · ") || "Follow cues";
}

export default function WorkoutPlayerPage() {
  const params = useParams();
  const id = String(params.id);
  const customWorkouts = useNaturaStore((s) => s.customWorkouts);
  const workout = findWorkout(id, customWorkouts);
  const logWorkout = useNaturaStore((s) => s.logWorkout);
  const removeCustom = useNaturaStore((s) => s.removeCustomWorkout);
  const soundEnabled = useNaturaStore((s) => s.soundEnabled);
  const favoriteIds = useNaturaStore((s) => s.favoriteWorkoutIds);
  const toggleFavorite = useNaturaStore((s) => s.toggleFavoriteWorkout);

  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [resting, setResting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const step = workout?.steps[stepIndex];
  const fav = workout ? favoriteIds.includes(workout.id) : false;

  const totalTimed = useMemo(
    () => (workout ? workoutTimedSec(workout) : 0),
    [workout]
  );

  function elapsedSoFar(): number {
    if (!workout) return 0;
    let done = 0;
    for (let i = 0; i < stepIndex; i += 1) {
      done += workout.steps[i].durationSec ?? 0;
      done += workout.steps[i].restSec ?? 0;
    }
    const current = workout.steps[stepIndex];
    if (!current) return done;
    if (resting) {
      done += current.durationSec ?? 0;
      done += (current.restSec ?? 0) - (secondsLeft ?? 0);
    } else if (secondsLeft != null && current.durationSec) {
      done += current.durationSec - secondsLeft;
    }
    return Math.max(0, done);
  }

  useEffect(() => {
    if (!started || !step || resting || paused) return;
    if (!step.durationSec) return;
    setSecondsLeft((prev) => (prev === null ? step.durationSec! : prev));
  }, [started, stepIndex, step, resting, paused]);

  useEffect(() => {
    if (!started || paused || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      advance();
      return;
    }
    const t = window.setTimeout(
      () => setSecondsLeft((s) => (s === null ? s : s - 1)),
      1000
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, started, paused]);

  useEffect(() => {
    if (!started || paused) {
      void wakeLockRef.current?.release();
      wakeLockRef.current = null;
      return;
    }
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    if (!nav.wakeLock) return;
    let cancelled = false;
    nav.wakeLock
      .request("screen")
      .then((lock) => {
        if (cancelled) {
          void lock.release();
          return;
        }
        wakeLockRef.current = lock;
      })
      .catch(() => {
        /* wake lock is optional */
      });
    const onVis = () => {
      if (document.visibilityState === "visible" && started && !paused && nav.wakeLock) {
        nav.wakeLock.request("screen").then((lock) => {
          wakeLockRef.current = lock;
        }).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      void wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [started, paused]);

  function beep() {
    if (soundEnabled) playBeep();
  }

  function advance() {
    if (!workout || !step) return;
    beep();
    if (!resting && step.restSec) {
      setResting(true);
      setSecondsLeft(step.restSec);
      return;
    }
    setResting(false);
    if (stepIndex >= workout.steps.length - 1) {
      finish();
      return;
    }
    setStepIndex((i) => i + 1);
    setSecondsLeft(null);
  }

  function skipForward() {
    if (!workout) return;
    beep();
    setResting(false);
    if (stepIndex >= workout.steps.length - 1) {
      finish();
      return;
    }
    setStepIndex((i) => i + 1);
    setSecondsLeft(null);
  }

  function skipBack() {
    if (resting) {
      setResting(false);
      setSecondsLeft(step?.durationSec ?? null);
      return;
    }
    if (stepIndex === 0) {
      setSecondsLeft(step?.durationSec ?? null);
      return;
    }
    setStepIndex((i) => i - 1);
    setResting(false);
    setSecondsLeft(null);
  }

  function finish(partial = false) {
    beep();
    const planned = workout ? workoutTimedSec(workout) : 0;
    logWorkout(id, {
      elapsedSec: partial ? elapsedSoFar() : planned || elapsedSoFar(),
      plannedSec: planned || undefined,
      completed: !partial,
    });
    if (partial) {
      setStarted(false);
      setPaused(false);
      setResting(false);
      setSecondsLeft(null);
      return;
    }
    setDone(true);
    setStarted(false);
    setPaused(false);
  }

  function resetPlayer() {
    setDone(false);
    setStarted(false);
    setPaused(false);
    setResting(false);
    setStepIndex(0);
    setSecondsLeft(null);
  }

  if (!workout) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p>Workout not found.</p>
        <Link href="/fitness" className="btn-secondary">
          Back
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 text-center">
        <div className="card p-8">
          <div className="text-4xl">🌿</div>
          <h1 className="mt-3 text-2xl font-bold text-sage-900">Nice work</h1>
          <p className="mt-2 text-sage-600">
            You finished <strong>{workout.title}</strong>. Streak updated on Home.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" className="btn-primary" onClick={resetPlayer}>
              Do this again
            </button>
            <Link href="/" className="btn-secondary">
              Back home
            </Link>
          </div>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-sage-700 underline"
            onClick={() => toggleFavorite(workout.id)}
          >
            {fav ? "Remove from favorites" : "Save as favorite"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/fitness" className="text-sm font-medium text-sage-700">
          ← All workouts
        </Link>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            fav ? "bg-terracotta-100 text-terracotta-800" : "bg-cream-100 text-sage-700"
          }`}
          onClick={() => toggleFavorite(workout.id)}
        >
          {fav ? "Favorited" : "Favorite"}
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-sage-900">{workout.title}</h1>
        <p className="mt-1 text-sm text-sage-600">{workout.description}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="chip">{workoutDisplayMin(workout)} min</span>
          {workout.custom && <span className="chip-terra">Yours</span>}
          <span className="chip">{workout.difficulty}</span>
          <span className="chip">No equipment</span>
        </div>
      </div>

      {!started ? (
        <>
          <ol className="card divide-y divide-cream-200">
            {workout.steps.map((s, i) => (
              <li key={`${s.name}-${i}`} className="flex items-start justify-between gap-3 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  {s.cue && <p className="text-xs text-sage-600">{s.cue}</p>}
                </div>
                <span className="shrink-0 text-xs text-sage-600">
                  {stepLabel(s)}
                </span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              setStarted(true);
              setPaused(false);
              setStepIndex(0);
              setSecondsLeft(null);
            }}
          >
            Start session
          </button>
          {totalTimed > 0 && (
            <p className="text-center text-xs text-sage-600">
              Timed work ~{workoutDisplayMin(workout)} min including rest
            </p>
          )}
          {workout.custom && (
            <button
              type="button"
              className="w-full text-xs text-terracotta-700 underline"
              onClick={() => {
                removeCustom(workout.id);
                window.location.href = "/fitness";
              }}
            >
              Delete this custom workout
            </button>
          )}
        </>
      ) : (
        <div className="card space-y-4 p-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-sage-500">
            Step {stepIndex + 1} of {workout.steps.length}
            {resting ? " · Rest" : ""}
            {paused ? " · Paused" : ""}
          </div>
          <h2 className="text-xl font-bold text-sage-900">
            {resting ? "Rest" : step?.name}
          </h2>
          {!resting && step?.cue && (
            <p className="text-sm text-sage-600">{step.cue}</p>
          )}
          {secondsLeft !== null ? (
            <div className="text-5xl font-bold tabular-nums text-sage-800">
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
            </div>
          ) : (
            <div className="text-sm text-sage-600">
              {step && stepLabel(step)} — tap next when finished
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={skipBack}>
              Previous
            </button>
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? "Resume" : "Pause"}
            </button>
            <button type="button" className="btn-primary flex-1" onClick={advance}>
              {stepIndex >= workout.steps.length - 1 && !(!resting && step?.restSec)
                ? "Finish"
                : "Next"}
            </button>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-sage-700 underline"
            onClick={skipForward}
          >
            Skip this step
          </button>
          <div className="flex justify-center gap-4 text-xs">
            <button
              type="button"
              className="font-medium text-sage-600 underline"
              onClick={() => finish(true)}
            >
              Save leftover time & exit
            </button>
            <button
              type="button"
              className="font-medium text-sage-600 underline"
              onClick={() => {
                setStarted(false);
                setPaused(false);
                setResting(false);
                setSecondsLeft(null);
              }}
            >
              Exit without logging
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
