"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { RdiBar } from "@/components/RdiBar";
import { pillarLabels } from "@/data/protocols";
import { notesForIds } from "@/data/interactions";
import { findSupplement } from "@/lib/catalog";
import { formatAmount, getNutrient, rdiFor } from "@/lib/nutrients";
import { SupplementsSubnav } from "@/components/SupplementsSubnav";
import {
  defaultTimingForWindow,
  stackWindowForTiming,
  stackWindowLabel,
  stackWindowPath,
} from "@/lib/stackWindows";
import { useNaturaStore } from "@/lib/store";

export default function SupplementDetailPage() {
  const id = String(useParams().id);
  const customSupplements = useNaturaStore((s) => s.customSupplements);
  const supp = findSupplement(id, customSupplements);
  const stack = useNaturaStore((s) => s.stack);
  const removeCustom = useNaturaStore((s) => s.removeCustomSupplement);
  const rdiProfile = useNaturaStore((s) => s.rdiProfile);
  const addToStack = useNaturaStore((s) => s.addToStack);
  const removeFromStack = useNaturaStore((s) => s.removeFromStack);

  if (!supp) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p>Supplement not found.</p>
        <Link href="/supplements" className="btn-secondary inline-flex">
          Back
        </Link>
      </div>
    );
  }

  const stacked = stack.find((x) => x.supplementId === supp.id);
  const inStack = Boolean(stacked);
  const notes = notesForIds([
    supp.id,
    ...stack.map((s) => s.supplementId),
  ]).filter((n) => n.a === supp.id || n.b === supp.id);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SupplementsSubnav />
      <Link href="/supplements" className="text-sm font-medium text-sage-700">
        ← Catalog
      </Link>
      <div>
        <div className="flex flex-wrap gap-2">
          <span className="chip">{supp.category}</span>
          {supp.pillars.map((p) => (
            <span key={p} className="chip-terra">
              {pillarLabels[p]}
            </span>
          ))}
        </div>
        <h1 className="mt-2 text-2xl font-bold text-sage-900">{supp.name}</h1>
        <p className="mt-1 text-sm text-sage-600">{supp.summary}</p>
      </div>
      <DisclaimerBanner />
      {notes.length > 0 && (
        <section className="card space-y-2 p-4">
          <h2 className="text-xs font-semibold uppercase text-sage-500">
            Notes with your supplements
          </h2>
          <ul className="space-y-2 text-sm text-sage-800">
            {notes.map((n) => (
              <li key={`${n.a}-${n.b}`}>{n.note}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card space-y-2 p-4 text-sm">
        <h2 className="text-xs font-semibold uppercase text-sage-500">
          Typical serving (this catalog)
        </h2>
        <p className="text-lg font-semibold text-sage-900">
          {formatAmount(supp.servingAmount, supp.servingUnit)}
        </p>
        <p className="text-sage-700">{supp.servingLabel}</p>
        <p className="text-sage-700">{supp.typicalRange}</p>
      </section>

      {supp.nutrients.length > 0 && (
        <section className="card space-y-3 p-4">
          <h2 className="text-xs font-semibold uppercase text-sage-500">
            This serving vs adult RDI ({rdiProfile})
          </h2>
          <ul className="space-y-2">
            {supp.nutrients.map((c) => {
              const n = getNutrient(c.nutrientId);
              if (!n) return null;
              const rdi = rdiFor(n, rdiProfile);
              const pct = rdi > 0 ? (c.amount / rdi) * 100 : 0;
              const overUl = n.ul != null && c.amount > n.ul;
              return (
                <li key={c.nutrientId}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{n.name}</span>
                    <span className={overUl ? "text-terracotta-700" : "text-sage-600"}>
                      {formatAmount(c.amount, n.unit)} · {Math.round(pct)}%
                      {n.official ? " RDI" : " ref"}
                    </span>
                  </div>
                  <RdiBar pct={pct} overUl={overUl} />
                  {n.note && (
                    <p className="mt-0.5 text-[11px] text-sage-500">{n.note}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="card space-y-3 p-4 text-sm">
        <div>
          <h2 className="text-xs font-semibold uppercase text-sage-500">
            Why it shows up in this style of work
          </h2>
          <p className="mt-1 text-sage-800">{supp.why}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-sage-500">How to take</h2>
          <p className="mt-1 text-sage-800">{supp.howToTake}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-sage-500">Forms</h2>
          <p className="mt-1 text-sage-800">{supp.forms.join(" · ")}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-sage-500">Food sources</h2>
          <p className="mt-1 text-sage-800">{supp.foodSources.join(", ")}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-sage-500">Caution</h2>
          <p className="mt-1 text-sage-800">{supp.caution}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-sage-500">
            See a clinician if
          </h2>
          <p className="mt-1 text-sage-800">{supp.seeDoctorIf}</p>
        </div>
      </section>

      {inStack ? (
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => removeFromStack(supp.id)}
        >
          Remove from{" "}
          {stacked
            ? stackWindowLabel(stackWindowForTiming(stacked.timing)).toLowerCase()
            : "supplements"}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              addToStack(supp.id, defaultTimingForWindow("morning"))
            }
          >
            Add to morning
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => addToStack(supp.id, defaultTimingForWindow("night"))}
          >
            Add to night
          </button>
        </div>
      )}
      <Link
        href={
          stacked
            ? stackWindowPath(stackWindowForTiming(stacked.timing))
            : "/stack"
        }
        className="block text-center text-sm font-medium text-sage-700"
      >
        Adjust the exact amount
      </Link>
      {supp.custom && (
        <button
          type="button"
          className="w-full text-sm text-terracotta-700 underline"
          onClick={() => {
            removeCustom(supp.id);
            window.location.href = "/supplements";
          }}
        >
          Delete this custom bottle
        </button>
      )}
    </div>
  );
}
