"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { allSupplements } from "@/lib/catalog";
import { matchesQuery } from "@/lib/search";
import { unitOptions } from "@/lib/stackDose";
import {
  defaultTimingForWindow,
  itemsInWindow,
  stackWindowLabel,
  stackWindowPath,
  type StackWindow,
} from "@/lib/stackWindows";
import { useNaturaStore } from "@/lib/store";
import type { DoseTiming, DoseUnit } from "@/lib/types";

const morningWhen: { timing: DoseTiming; label: string }[] = [
  { timing: "morning", label: "Morning" },
  { timing: "with_food", label: "With food" },
  { timing: "anytime", label: "Anytime" },
];

export function StackWindowEditor({ window }: { window: StackWindow }) {
  const stack = useNaturaStore((s) => s.stack);
  const rdiProfile = useNaturaStore((s) => s.rdiProfile);
  const customSupplements = useNaturaStore((s) => s.customSupplements);
  const addToStack = useNaturaStore((s) => s.addToStack);
  const removeFromStack = useNaturaStore((s) => s.removeFromStack);
  const updateStackTiming = useNaturaStore((s) => s.updateStackTiming);
  const updateStackNote = useNaturaStore((s) => s.updateStackNote);
  const updateStackDose = useNaturaStore((s) => s.updateStackDose);
  const toggleStackCheck = useNaturaStore((s) => s.toggleStackCheck);
  const checkStackWindow = useNaturaStore((s) => s.checkStackWindow);
  const isStackCheckedToday = useNaturaStore((s) => s.isStackCheckedToday);

  const [query, setQuery] = useState("");
  const catalog = useMemo(
    () => allSupplements(customSupplements),
    [customSupplements]
  );
  const items = itemsInWindow(stack, window);
  const other: StackWindow = window === "morning" ? "night" : "morning";
  const defaultTiming = defaultTimingForWindow(window);
  const title = stackWindowLabel(window);
  const leftover = items.filter((item) => !isStackCheckedToday(item.supplementId));

  const matches = catalog.filter((supp) =>
    matchesQuery(query, [supp.name, supp.summary, supp.category, ...supp.forms])
  );

  function placeInThisWindow(supplementId: string) {
    if (stack.some((item) => item.supplementId === supplementId)) {
      updateStackTiming(supplementId, defaultTiming);
      return;
    }
    addToStack(supplementId, defaultTiming);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link href="/stack" className="text-sm font-medium text-sage-700">
          ← Supplements
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-sage-900">{title}</h1>
        <p className="mt-1 text-sm text-sage-600">
          {window === "morning"
            ? "Edit what you take in the morning. Move anything to night if it belongs there."
            : "Edit what you take in the evening. Move anything to morning if it belongs there."}
        </p>
      </div>
      <DisclaimerBanner compact />

      {leftover.length > 0 && (
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => checkStackWindow(window)}
        >
          Took {window === "morning" ? "morning" : "night"} supplements
        </button>
      )}

      {items.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-sage-700">Nothing in this list yet.</p>
          <p className="mt-1 text-sm text-sage-600">
            Search below or browse the catalog.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const supp = catalog.find((s) => s.id === item.supplementId);
            if (!supp) return null;
            const on = isStackCheckedToday(item.supplementId);
            return (
              <li key={item.supplementId} className="card p-3">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleStackCheck(item.supplementId)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm ${
                      on
                        ? "border-sage-600 bg-sage-600 text-white"
                        : "border-sage-300"
                    }`}
                    aria-pressed={on}
                    aria-label={`Mark ${supp.name} ${on ? "incomplete" : "done"}`}
                  >
                    {on ? "✓" : ""}
                  </button>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/supplements/${supp.id}`}
                      className="font-medium text-sage-900"
                    >
                      {supp.name}
                    </Link>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="number"
                        min={0}
                        step="any"
                        className="w-24 rounded-lg border border-cream-200 bg-cream-50 px-2 py-1.5 text-xs"
                        value={item.amount}
                        onChange={(e) =>
                          updateStackDose(
                            item.supplementId,
                            Number(e.target.value),
                            item.unit
                          )
                        }
                        aria-label={`${supp.name} amount`}
                      />
                      <select
                        className="rounded-lg border border-cream-200 bg-cream-50 px-2 py-1.5 text-xs"
                        value={item.unit}
                        onChange={(e) =>
                          updateStackDose(
                            item.supplementId,
                            item.amount,
                            e.target.value as DoseUnit
                          )
                        }
                      >
                        {unitOptions(supp).map((u) => (
                          <option key={u} value={u}>
                            {u === "billion-CFU" ? "B CFU" : u}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      className="mt-2 w-full rounded-lg border border-cream-200 bg-cream-50 px-2 py-1.5 text-xs"
                      placeholder="Note — e.g. glycinate, with breakfast"
                      value={item.note ?? ""}
                      onChange={(e) =>
                        updateStackNote(item.supplementId, e.target.value)
                      }
                    />
                    {window === "morning" && (
                      <select
                        className="mt-2 w-full rounded-lg border border-cream-200 bg-cream-50 px-2 py-1.5 text-xs"
                        value={item.timing}
                        onChange={(e) =>
                          updateStackTiming(
                            item.supplementId,
                            e.target.value as DoseTiming
                          )
                        }
                      >
                        {morningWhen.map((option) => (
                          <option key={option.timing} value={option.timing}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="text-xs font-medium text-sage-700 underline"
                        onClick={() =>
                          updateStackTiming(
                            item.supplementId,
                            defaultTimingForWindow(other)
                          )
                        }
                      >
                        Move to {other}
                      </button>
                      <button
                        type="button"
                        className="text-xs text-terracotta-700"
                        onClick={() => removeFromStack(item.supplementId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold text-sage-900">Add to {title.toLowerCase()}</h2>
        <input
          type="search"
          className="w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm"
          placeholder="Search vitamins & herbs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {matches.slice(0, 16).map((supp) => {
            const existing = stack.find((item) => item.supplementId === supp.id);
            const here = items.some((item) => item.supplementId === supp.id);
            return (
              <li key={supp.id}>
                <button
                  type="button"
                  disabled={here}
                  onClick={() => placeInThisWindow(supp.id)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-cream-50 disabled:text-sage-400"
                >
                  <span>
                    {supp.name}
                    {existing && !here && (
                      <span className="ml-2 text-xs text-sage-500">
                        in {stackWindowLabel(other).toLowerCase()}
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-medium">
                    {here ? "Added" : existing ? "Move here" : "Add"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col gap-2 pt-1 text-center text-sm">
          <Link href="/supplements" className="font-medium text-sage-700 underline">
            Browse full catalog
          </Link>
          <Link href="/supplements/new" className="font-medium text-sage-700">
            Add a custom bottle
          </Link>
          <Link
            href={stackWindowPath(other)}
            className="font-medium text-sage-700"
          >
            Edit {stackWindowLabel(other).toLowerCase()}
          </Link>
        </div>
      </section>
      <p className="text-center text-xs text-sage-500">
        RDI bars for this device profile ({rdiProfile}) are on the main
        Supplements page.
      </p>
    </div>
  );
}
