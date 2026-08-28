"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { pillarLabels } from "@/data/protocols";
import { supplementCategories } from "@/data/supplements";
import { allSupplements } from "@/lib/catalog";
import { matchesQuery } from "@/lib/search";
import { SupplementsSubnav } from "@/components/SupplementsSubnav";
import {
  defaultTimingForWindow,
  stackWindowForTiming,
  stackWindowLabel,
} from "@/lib/stackWindows";
import { useNaturaStore } from "@/lib/store";
import type { ApproachPillar, DoseTiming, SupplementCategory } from "@/lib/types";

const timingLabel: Record<DoseTiming, string> = {
  morning: "Morning",
  with_food: "With food",
  evening: "Evening",
  anytime: "Anytime",
};

const cats: { id: SupplementCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...supplementCategories,
];

const pillars: { id: ApproachPillar | "all"; label: string }[] = [
  { id: "all", label: "All systems" },
  ...(Object.keys(pillarLabels) as ApproachPillar[]).map((id) => ({
    id,
    label: pillarLabels[id],
  })),
];

export default function SupplementsPage() {
  const [filter, setFilter] = useState<SupplementCategory | "all">("all");
  const [pillar, setPillar] = useState<ApproachPillar | "all">("all");
  const [query, setQuery] = useState("");
  const stack = useNaturaStore((s) => s.stack);
  const customSupplements = useNaturaStore((s) => s.customSupplements);
  const addToStack = useNaturaStore((s) => s.addToStack);
  const removeFromStack = useNaturaStore((s) => s.removeFromStack);
  const updateStackTiming = useNaturaStore((s) => s.updateStackTiming);
  const supplements = useMemo(
    () => allSupplements(customSupplements),
    [customSupplements]
  );

  const list = useMemo(() => {
    return supplements.filter((s) => {
      if (filter !== "all" && s.category !== filter) return false;
      if (pillar !== "all" && !s.pillars?.includes(pillar)) return false;
      return matchesQuery(query, [
        s.name,
        s.summary,
        s.why,
        s.typicalRange,
        s.category,
        ...s.foodSources,
        ...s.forms,
        ...s.pillars,
        s.caution,
      ]);
    });
  }, [filter, pillar, query, supplements]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-sage-900">Catalog</h1>
        <p className="mt-1 text-sm text-sage-600">
          Browse vitamins, minerals, and herbs. Add one to morning or night —
          it shows up under Yours.
        </p>
      </div>
      <SupplementsSubnav />
      <DisclaimerBanner />
      <p className="text-xs text-sage-600">
        <Link href="/foundations" className="font-medium underline">
          Open foundations
        </Link>{" "}
        for circadian, metabolic, gut, and methylation maps.{" "}
        <Link href="/supplements/new" className="font-medium underline">
          Add your bottle
        </Link>
      </p>

      <input
        type="search"
        className="w-full rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm"
        placeholder="Search name, mineral, sleep, methylation…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {cats.map((c) => (
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
      <div className="flex gap-2 overflow-x-auto pb-1">
        {pillars.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setPillar(c.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              pillar === c.id
                ? "bg-terracotta-600 text-white"
                : "bg-cream-100 text-sage-700"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-sage-600">No matches. Try another word.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((s) => {
            const existing = stack.find((x) => x.supplementId === s.id);
            const window = existing
              ? stackWindowForTiming(existing.timing)
              : null;
            return (
              <li key={s.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/supplements/${s.id}`}
                      className="font-semibold text-sage-900"
                    >
                      {s.name}
                    </Link>
                    <p className="mt-1 text-sm text-sage-600 line-clamp-2">
                      {s.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="chip">{s.category}</span>
                      <span className="chip">{timingLabel[s.typicalTiming]}</span>
                      <span className="chip">{s.servingLabel}</span>
                      {s.custom && <span className="chip-terra">Yours</span>}
                      {window && (
                        <span className="chip">
                          In {stackWindowLabel(window).toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/supplements/${s.id}`} className="btn-secondary flex-1">
                    Details
                  </Link>
                  {existing ? (
                    <button
                      type="button"
                      className="btn-secondary flex-1"
                      onClick={() => removeFromStack(s.id)}
                    >
                      Remove
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-primary flex-1"
                        onClick={() =>
                          addToStack(s.id, defaultTimingForWindow("morning"))
                        }
                      >
                        Morning
                      </button>
                      <button
                        type="button"
                        className="btn-secondary flex-1"
                        onClick={() =>
                          addToStack(s.id, defaultTimingForWindow("night"))
                        }
                      >
                        Night
                      </button>
                    </>
                  )}
                </div>
                {existing && window && (
                  <button
                    type="button"
                    className="mt-2 text-xs font-medium text-sage-700 underline"
                    onClick={() =>
                      updateStackTiming(
                        s.id,
                        defaultTimingForWindow(
                          window === "morning" ? "night" : "morning"
                        )
                      )
                    }
                  >
                    Move to {window === "morning" ? "night" : "morning"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-center text-sm">
        <Link href="/stack" className="font-medium text-sage-700 underline">
          Back to your lists
        </Link>
      </p>
    </div>
  );
}
