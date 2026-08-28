"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { RdiBar } from "@/components/RdiBar";
import { notesForIds } from "@/data/interactions";
import { allSupplements } from "@/lib/catalog";
import { dueTimings, timingLabel } from "@/lib/habits";
import { formatAmount, stackNutrientTotals } from "@/lib/nutrients";
import { todayPlan } from "@/lib/schedule";
import {
  itemsInWindow,
  stackWindowLabel,
  stackWindowPath,
  type StackWindow,
} from "@/lib/stackWindows";
import { useNaturaStore } from "@/lib/store";
import { SupplementsSubnav } from "@/components/SupplementsSubnav";

export default function StackPage() {
  const stack = useNaturaStore((s) => s.stack);
  const rdiProfile = useNaturaStore((s) => s.rdiProfile);
  const customSupplements = useNaturaStore((s) => s.customSupplements);
  const weeklySchedule = useNaturaStore((s) => s.weeklySchedule);
  const toggleStackCheck = useNaturaStore((s) => s.toggleStackCheck);
  const checkStackWindow = useNaturaStore((s) => s.checkStackWindow);
  const isStackCheckedToday = useNaturaStore((s) => s.isStackCheckedToday);
  const leftoverFromYesterday = useNaturaStore((s) => s.leftoverFromYesterday);
  const checkins = useNaturaStore((s) => s.checkins);
  void checkins;

  const catalog = useMemo(
    () => allSupplements(customSupplements),
    [customSupplements]
  );
  const plan = todayPlan(weeklySchedule);
  const hour = new Date().getHours();
  const due = dueTimings(hour);
  const dueItems = stack.filter(
    (item) => due.includes(item.timing) && !isStackCheckedToday(item.supplementId)
  );
  const leftovers = leftoverFromYesterday().filter(
    (item) => !isStackCheckedToday(item.supplementId)
  );
  const checked = stack.filter((s) => isStackCheckedToday(s.supplementId)).length;
  const totals = stackNutrientTotals(stack, rdiProfile, customSupplements);
  const official = totals.filter((t) => t.nutrient.official);
  const atRdi = official.filter((t) => t.pct >= 100).length;
  const notes = notesForIds(stack.map((s) => s.supplementId));

  function nameFor(id: string) {
    return catalog.find((s) => s.id === id)?.name ?? id;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-sage-900">Supplements</h1>
        <p className="mt-1 text-sm text-sage-600">
          What you take. Use Catalog to browse vitamins and herbs, then add
          them here.
        </p>
      </div>
      <SupplementsSubnav />
      <DisclaimerBanner compact />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <WindowCard
          window="morning"
          time={plan.stackMorningTime}
          names={itemsInWindow(stack, "morning").map((item) =>
            nameFor(item.supplementId)
          )}
          left={itemsInWindow(stack, "morning").some(
            (item) => !isStackCheckedToday(item.supplementId)
          )}
          onTake={() => checkStackWindow("morning")}
        />
        <WindowCard
          window="night"
          time={plan.stackEveningTime}
          names={itemsInWindow(stack, "night").map((item) =>
            nameFor(item.supplementId)
          )}
          left={itemsInWindow(stack, "night").some(
            (item) => !isStackCheckedToday(item.supplementId)
          )}
          onTake={() => checkStackWindow("night")}
        />
      </div>

      {dueItems.length > 0 && (
        <section className="card space-y-2 p-4">
          <h2 className="font-semibold text-sage-900">Due now</h2>
          <p className="text-xs text-sage-500">
            {due.map(timingLabel).join(" · ")}
          </p>
          <ul className="space-y-2">
            {dueItems.map((item) => (
              <DueRow
                key={item.supplementId}
                name={nameFor(item.supplementId)}
                on={isStackCheckedToday(item.supplementId)}
                onToggle={() => toggleStackCheck(item.supplementId)}
              />
            ))}
          </ul>
        </section>
      )}

      {leftovers.length > 0 && (
        <section className="card space-y-2 p-4">
          <h2 className="font-semibold text-sage-900">Leftover from yesterday</h2>
          <p className="text-xs text-sage-600">
            These were not checked yesterday. Mark them if you still want to
            take them — not medical advice.
          </p>
          <ul className="space-y-2">
            {leftovers.map((item) => (
              <DueRow
                key={item.supplementId}
                name={nameFor(item.supplementId)}
                on={isStackCheckedToday(item.supplementId)}
                onToggle={() => toggleStackCheck(item.supplementId)}
              />
            ))}
          </ul>
        </section>
      )}

      {notes.length > 0 && (
        <section className="card space-y-2 p-4">
          <h2 className="font-semibold text-sage-900">Interaction notes</h2>
          <p className="text-xs text-sage-600">
            Education only. Not a complete interaction checker and not a reason
            to start or stop anything.
          </p>
          <ul className="space-y-2">
            {notes.map((n) => (
              <li
                key={`${n.a}-${n.b}-${n.note.slice(0, 24)}`}
                className="rounded-xl bg-cream-50 px-3 py-2 text-sm text-sage-800"
              >
                <span
                  className={`mr-2 text-[10px] font-semibold uppercase ${
                    n.level === "caution"
                      ? "text-terracotta-700"
                      : "text-sage-500"
                  }`}
                >
                  {n.level}
                </span>
                {n.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {stack.length > 0 && (
        <section className="card space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-sage-900">RDI from these supplements</h2>
            <Link href="/settings" className="text-xs font-medium text-sage-700">
              Change profile
            </Link>
          </div>
          <p className="text-xs text-sage-600">
            {checked} of {stack.length} checked today · {atRdi} of{" "}
            {official.length} official nutrients at or above RDI.
          </p>
          {totals.length === 0 ? (
            <p className="text-sm text-sage-600">
              Herbs and aminos in your list don’t have an official RDI — that’s
              expected.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {totals.map((row) => (
                <li key={row.nutrient.id}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-medium text-sage-900">
                      {row.nutrient.name}
                    </span>
                    <span
                      className={
                        row.overUl
                          ? "font-semibold text-terracotta-700"
                          : "text-sage-600"
                      }
                    >
                      {formatAmount(row.amount, row.nutrient.unit)} ·{" "}
                      {Math.round(row.pct)}%
                      {row.nutrient.official ? " RDI" : " ref"}
                      {row.overUl ? " · over UL" : ""}
                    </span>
                  </div>
                  <RdiBar pct={row.pct} overUl={row.overUl} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {stack.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-sage-700">No supplements yet.</p>
          <Link href="/supplements" className="btn-primary mt-4 inline-flex">
            Browse catalog
          </Link>
        </div>
      )}

      <Link href="/supplements" className="btn-secondary w-full">
        Browse catalog
      </Link>
      <Link
        href="/supplements/new"
        className="block text-center text-sm font-medium text-sage-700"
      >
        Add a custom bottle
      </Link>
    </div>
  );
}

function WindowCard({
  window,
  time,
  names,
  left,
  onTake,
}: {
  window: StackWindow;
  time: string;
  names: string[];
  left: boolean;
  onTake: () => void;
}) {
  return (
    <section className="card flex flex-col p-4">
      <Link href={stackWindowPath(window)} className="block min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold text-sage-900">
            {stackWindowLabel(window)}
          </h2>
          <span className="text-xs font-medium text-sage-700">Edit →</span>
        </div>
        <p className="mt-1 text-xs text-sage-500">{time || "No time set"}</p>
        <p className="mt-2 text-sm text-sage-700">
          {names.length === 0
            ? "Empty — tap to add"
            : names.slice(0, 3).join(" · ")}
          {names.length > 3 ? ` · +${names.length - 3}` : ""}
        </p>
      </Link>
      {left && (
        <button
          type="button"
          className="btn-secondary mt-3 w-full"
          onClick={onTake}
        >
          Took {window === "morning" ? "morning" : "night"} supplements
        </button>
      )}
    </section>
  );
}

function DueRow({
  name,
  on,
  onToggle,
}: {
  name: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-xl bg-cream-50 px-3 py-2 text-left"
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-md border text-sm ${
            on ? "border-sage-600 bg-sage-600 text-white" : "border-sage-300"
          }`}
        >
          {on ? "✓" : ""}
        </span>
        <span className="text-sm font-medium">{name}</span>
      </button>
    </li>
  );
}
