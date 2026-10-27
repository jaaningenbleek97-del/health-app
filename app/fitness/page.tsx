"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { allWorkouts, workoutDisplayMin } from "@/lib/catalog";
import { lastCompletedWorkout } from "@/lib/suggest";
import { matchesQuery } from "@/lib/search";
import { useNaturaStore } from "@/lib/store";
import type { WorkoutCategory } from "@/lib/types";

const categories: { id: WorkoutCategory | "all" | "favorites"; label: string }[] =
  [
    { id: "all", label: "All" },
    { id: "favorites", label: "Favorites" },
    { id: "walk", label: "Walk" },
    { id: "mobility", label: "Mobility" },
    { id: "strength", label: "Strength" },
    { id: "calisthenics", label: "Calisthenics" },
    { id: "stretch", label: "Stretch" },
    { id: "yoga", label: "Yoga" },
    { id: "breath", label: "Breath" },
  ];

export default function FitnessPage() {
  const [filter, setFilter] = useState<WorkoutCategory | "all" | "favorites">(
    "all"
  );
  const [query, setQuery] = useState("");
  const logs = useNaturaStore((s) => s.workoutLogs);
  const favoriteIds = useNaturaStore((s) => s.favoriteWorkoutIds);
  const customWorkouts = useNaturaStore((s) => s.customWorkouts);
  const toggleFavorite = useNaturaStore((s) => s.toggleFavoriteWorkout);
  const workouts = useMemo(() => allWorkouts(customWorkouts), [customWorkouts]);

  const completedIds = useMemo(() => {
    return new Set(logs.map((l) => l.workoutId));
  }, [logs]);

  const again = lastCompletedWorkout(logs, workouts);

  const list = useMemo(() => {
    const base =
      filter === "favorites"
        ? workouts.filter((w) => favoriteIds.includes(w.id))
        : filter === "all"
          ? workouts
          : workouts.filter((w) => w.category === filter);
    return base.filter((w) =>
      matchesQuery(query, [w.title, w.description, w.category])
    );
  }, [filter, favoriteIds, workouts, query]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-sage-900">Workouts</h1>
        <p className="mt-1 text-sm text-sage-600">
          No-equipment sessions you can do at home or outdoors.
        </p>
        <Link href="/fitness/new" className="mt-2 inline-block text-sm font-medium text-sage-700 underline">
          Add a custom workout
        </Link>
      </div>

      <input
        type="search"
        className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2.5 text-sm"
        placeholder="Search walks, yoga, breath…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {again && (
        <Link
          href={`/fitness/${again.id}`}
          className="card block border-sage-200 p-4"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-sage-500">
            Do this again
          </div>
          <h2 className="mt-1 font-semibold text-sage-900">{again.title}</h2>
          <p className="text-sm text-sage-600">
            {workoutDisplayMin(again)} min · last completed session
          </p>
        </Link>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === c.id
                ? "bg-sage-600 text-white"
                : "bg-cream-100 text-sage-700"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-sage-600">No workouts in this view yet.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((w) => {
            const fav = favoriteIds.includes(w.id);
            return (
              <li key={w.id} className="card relative p-4 transition hover:border-sage-300">
                <Link href={`/fitness/${w.id}`} className="block pr-12">
                  <h2 className="font-semibold text-sage-900">{w.title}</h2>
                  <p className="mt-1 text-sm text-sage-600 line-clamp-2">
                    {w.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="chip">{workoutDisplayMin(w)} min</span>
                    {w.custom && <span className="chip-terra">Yours</span>}
                    <span className="chip">{w.difficulty}</span>
                    <span className="chip">{w.category}</span>
                    {completedIds.has(w.id) && (
                      <span className="chip-terra">Done before</span>
                    )}
                  </div>
                </Link>
                <button
                  type="button"
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    fav
                      ? "bg-terracotta-100 text-terracotta-800"
                      : "bg-cream-100 text-sage-700"
                  }`}
                  onClick={() => toggleFavorite(w.id)}
                  aria-pressed={fav}
                  aria-label={fav ? `Unfavorite ${w.title}` : `Favorite ${w.title}`}
                >
                  {fav ? "★" : "☆"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
