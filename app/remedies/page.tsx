"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { remedyCategories } from "@/data/remedies";
import { allRemedies } from "@/lib/catalog";
import { matchesQuery } from "@/lib/search";
import { useNaturaStore } from "@/lib/store";
import type { RemedyCategory } from "@/lib/types";

export default function RemediesPage() {
  const [filter, setFilter] = useState<RemedyCategory | "all" | "favorites">(
    "all"
  );
  const [query, setQuery] = useState("");
  const favorites = useNaturaStore((s) => s.favoriteRemedyIds);
  const customRemedies = useNaturaStore((s) => s.customRemedies);
  const remedies = useMemo(() => allRemedies(customRemedies), [customRemedies]);

  const list = useMemo(() => {
    const byFilter =
      filter === "favorites"
        ? remedies.filter((r) => favorites.includes(r.id))
        : filter === "all"
          ? remedies
          : remedies.filter((r) => r.category === filter);
    return byFilter.filter((r) =>
      matchesQuery(query, [
        r.title,
        r.summary,
        r.category,
        ...r.ingredients,
        ...r.steps,
        r.howToUse,
      ])
    );
  }, [filter, favorites, query, remedies]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-sage-900">Natural remedies</h1>
        <p className="mt-1 text-sm text-sage-600">
          Food, herbs, and lifestyle comforts — not cures.
        </p>
        <Link href="/remedies/new" className="mt-2 inline-block text-sm font-medium text-sage-700 underline">
          Add a custom remedy
        </Link>
      </div>
      <DisclaimerBanner />

      <input
        type="search"
        className="w-full rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm"
        placeholder="Search sleep, ginger, tea, stress…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
        />
        <FilterChip
          active={filter === "favorites"}
          onClick={() => setFilter("favorites")}
          label="Favorites"
        />
        {remedyCategories.map((c) => (
          <FilterChip
            key={c.id}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
            label={c.label}
          />
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-sage-600">No remedies in this view yet.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => (
            <li key={r.id}>
              <Link
                href={`/remedies/${r.id}`}
                className="card block p-4 hover:border-sage-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-sage-900">{r.title}</h2>
                  <span className="chip">{r.category}</span>
                </div>
                <p className="mt-1 text-sm text-sage-600">{r.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
        active ? "bg-sage-600 text-white" : "bg-cream-100 text-sage-700"
      }`}
    >
      {label}
    </button>
  );
}
