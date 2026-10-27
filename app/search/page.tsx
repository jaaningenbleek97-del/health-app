"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { allRemedies, allSupplements, allWorkouts, workoutDisplayMin } from "@/lib/catalog";
import { matchesQuery } from "@/lib/search";
import { useNaturaStore } from "@/lib/store";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const customWorkouts = useNaturaStore((s) => s.customWorkouts);
  const customSupplements = useNaturaStore((s) => s.customSupplements);
  const customRemedies = useNaturaStore((s) => s.customRemedies);

  const workouts = useMemo(() => allWorkouts(customWorkouts), [customWorkouts]);
  const supplements = useMemo(
    () => allSupplements(customSupplements),
    [customSupplements]
  );
  const remedies = useMemo(() => allRemedies(customRemedies), [customRemedies]);

  const q = query.trim();
  const moveHits = q
    ? workouts.filter((w) =>
        matchesQuery(q, [w.title, w.description, w.category, w.difficulty])
      )
    : [];
  const stackHits = q
    ? supplements.filter((s) =>
        matchesQuery(q, [
          s.name,
          s.summary,
          s.category,
          s.why,
          ...s.foodSources,
          ...s.forms,
        ])
      )
    : [];
  const remedyHits = q
    ? remedies.filter((r) =>
        matchesQuery(q, [r.title, r.summary, r.category, ...r.ingredients])
      )
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-sage-900">Search</h1>
        <p className="mt-1 text-sm text-sage-600">
          Workouts, vitamins, and remedies in one place.
        </p>
      </div>
      <input
        type="search"
        autoFocus
        className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2.5 text-sm"
        placeholder="Try magnesium, walk, sleep, ginger…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!q && (
        <p className="text-sm text-sage-600">
          Type a word to search Workouts, supplements, and remedies.
        </p>
      )}

      {q && moveHits.length + stackHits.length + remedyHits.length === 0 && (
        <p className="text-sm text-sage-600">No matches for “{q}”.</p>
      )}

      {moveHits.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-sage-500">
            Workouts
          </h2>
          <ul className="space-y-2">
            {moveHits.slice(0, 8).map((w) => (
              <li key={w.id}>
                <Link href={`/fitness/${w.id}`} className="card block p-3">
                  <div className="font-medium">{w.title}</div>
                  <div className="text-xs text-sage-600">
                    {workoutDisplayMin(w)} min · {w.category}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stackHits.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-sage-500">
            Supplements
          </h2>
          <ul className="space-y-2">
            {stackHits.slice(0, 8).map((s) => (
              <li key={s.id}>
                <Link href={`/supplements/${s.id}`} className="card block p-3">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-sage-600 line-clamp-2">
                    {s.summary}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {remedyHits.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-sage-500">
            Remedies
          </h2>
          <ul className="space-y-2">
            {remedyHits.slice(0, 8).map((r) => (
              <li key={r.id}>
                <Link href={`/remedies/${r.id}`} className="card block p-3">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-sage-600">{r.summary}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
