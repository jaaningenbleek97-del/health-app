"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { nutrients } from "@/lib/nutrients";
import { uid } from "@/lib/uid";
import { SupplementsSubnav } from "@/components/SupplementsSubnav";
import { useNaturaStore } from "@/lib/store";
import type {
  DoseTiming,
  DoseUnit,
  SupplementCategory,
} from "@/lib/types";

export default function NewSupplementPage() {
  const router = useRouter();
  const save = useNaturaStore((s) => s.saveCustomSupplement);
  const addToStack = useNaturaStore((s) => s.addToStack);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<SupplementCategory>("other");
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState<DoseUnit>("mg");
  const [timing, setTiming] = useState<DoseTiming>("anytime");
  const [nutrientId, setNutrientId] = useState("");
  const [nutrientAmount, setNutrientAmount] = useState(0);

  function onSave() {
    if (!name.trim()) return;
    const id = uid("custom-s");
    save({
      id,
      name: name.trim(),
      category,
      summary: summary.trim() || "Your bottle. Amount is what you type on Supplements.",
      foodSources: [],
      typicalTiming: timing,
      caution: "You added this item. Check the label and a clinician if unsure.",
      seeDoctorIf: "You take medications or have a health condition.",
      pillars: [],
      forms: ["Your bottle"],
      servingAmount: amount || 1,
      servingUnit: unit,
      servingLabel: `per ${amount || 1} ${unit}`,
      typicalRange: "As on your label.",
      why: "Custom item you added on this device.",
      howToTake: "Follow the label and your clinician.",
      nutrients:
        nutrientId && nutrientAmount > 0
          ? [{ nutrientId, amount: nutrientAmount }]
          : [],
      custom: true,
    });
    addToStack(id, timing, undefined, amount || 1, unit);
    router.push("/stack");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <SupplementsSubnav />
      <Link href="/supplements" className="text-sm font-medium text-sage-700">
        ← Catalog
      </Link>
      <h1 className="text-2xl font-bold text-sage-900">Custom bottle</h1>
      <p className="text-sm text-sage-600">
        Add something that is not in the catalog. Optional RDI mapping if you
        know the nutrient amount on the label.
      </p>
      <input
        className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm"
        placeholder="Name on the bottle"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm"
        rows={2}
        placeholder="Optional note"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          className="rounded-xl border border-cream-200 px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value as SupplementCategory)}
        >
          <option value="vitamin">Vitamin</option>
          <option value="mineral">Mineral</option>
          <option value="amino">Amino</option>
          <option value="herb">Herb</option>
          <option value="other">Other</option>
        </select>
        <select
          className="rounded-xl border border-cream-200 px-3 py-2 text-sm"
          value={timing}
          onChange={(e) => setTiming(e.target.value as DoseTiming)}
        >
          <option value="morning">Morning</option>
          <option value="with_food">With food</option>
          <option value="evening">Evening</option>
          <option value="anytime">Anytime</option>
        </select>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          step="any"
          className="w-28 rounded-xl border border-cream-200 px-3 py-2 text-sm"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <select
          className="rounded-xl border border-cream-200 px-3 py-2 text-sm"
          value={unit}
          onChange={(e) => setUnit(e.target.value as DoseUnit)}
        >
          <option value="mg">mg</option>
          <option value="mcg">mcg</option>
          <option value="g">g</option>
          <option value="IU">IU</option>
          <option value="billion-CFU">B CFU</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-sage-500">
          Optional RDI nutrient
        </label>
        <select
          className="w-full rounded-xl border border-cream-200 px-3 py-2 text-sm"
          value={nutrientId}
          onChange={(e) => setNutrientId(e.target.value)}
        >
          <option value="">None</option>
          {nutrients.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name} ({n.unit})
            </option>
          ))}
        </select>
        {nutrientId && (
          <input
            type="number"
            min={0}
            step="any"
            className="mt-2 w-full rounded-xl border border-cream-200 px-3 py-2 text-sm"
            placeholder="Amount of that nutrient in one serving"
            value={nutrientAmount || ""}
            onChange={(e) => setNutrientAmount(Number(e.target.value))}
          />
        )}
      </div>
      <button type="button" className="btn-primary w-full" onClick={onSave}>
        Save and add to supplements
      </button>
    </div>
  );
}
