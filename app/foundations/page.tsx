"use client";

import Link from "next/link";
import { useState } from "react";
import { CircadianSettings } from "@/components/CircadianSettings";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { pillarLabels, protocols } from "@/data/protocols";
import { getRemedy } from "@/data/remedies";
import { getSupplement } from "@/data/supplements";
import { getWorkout } from "@/data/workouts";
import { useNaturaStore } from "@/lib/store";
import type { ApproachPillar } from "@/lib/types";

export default function FoundationsPage() {
  const applyFoundation = useNaturaStore((s) => s.applyFoundation);
  const appliedId = useNaturaStore((s) => s.weeklySchedule.appliedFoundationId);
  const [justApplied, setJustApplied] = useState<ApproachPillar | null>(null);

  function onApply(id: ApproachPillar) {
    applyFoundation(id);
    setJustApplied(id);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-sage-900">Foundations</h1>
        <p className="mt-1 text-sm text-sage-600">
          Functional and performance-wellness maps: light, sleep, food, gut,
          minerals, stress. Inspired by ideas popularized by people like
          Huberman, Brecka, and Hyman — not affiliated, not a protocol from
          them.
        </p>
        {appliedId && (
          <p className="mt-2 text-sm text-sage-700">
            On this week:{" "}
            <span className="font-semibold">{pillarLabels[appliedId]}</span>
            .{" "}
            <Link href="/plan" className="underline">
              Open Plan
            </Link>
          </p>
        )}
      </div>
      <DisclaimerBanner />
      <CircadianSettings />

      <ul className="space-y-4">
        {protocols.map((p) => (
          <li key={p.id} className="card space-y-3 p-4">
            <div>
              <span className="chip">{pillarLabels[p.id]}</span>
              <h2 className="mt-2 font-semibold text-sage-900">{p.title}</h2>
              <p className="mt-1 text-sm text-sage-600">{p.summary}</p>
              <p className="mt-2 text-xs text-sage-500">{p.why}</p>
            </div>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-sage-800">
              {p.daily.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2">
              {p.supplementIds.map((id) => {
                const s = getSupplement(id);
                if (!s) return null;
                return (
                  <Link
                    key={id}
                    href={`/supplements/${id}`}
                    className="rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-sage-800"
                  >
                    {s.name}
                  </Link>
                );
              })}
              {p.remedyIds.map((id) => {
                const r = getRemedy(id);
                if (!r) return null;
                return (
                  <Link
                    key={id}
                    href={`/remedies/${id}`}
                    className="rounded-full bg-sage-100 px-2.5 py-1 text-xs font-medium text-sage-800"
                  >
                    {r.title}
                  </Link>
                );
              })}
              {p.workoutIds.map((id) => {
                const w = getWorkout(id);
                if (!w) return null;
                return (
                  <Link
                    key={id}
                    href={`/fitness/${id}`}
                    className="rounded-full bg-terracotta-100 px-2.5 py-1 text-xs font-medium text-terracotta-800"
                  >
                    {w.title}
                  </Link>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={() => onApply(p.id)}
              >
                {appliedId === p.id ? "Update this week" : "Add to this week"}
              </button>
              {justApplied === p.id && (
                <Link href="/plan" className="text-sm font-medium text-sage-700 underline">
                  Added to Plan
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
