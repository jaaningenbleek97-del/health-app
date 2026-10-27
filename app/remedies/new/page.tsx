"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { uid } from "@/lib/uid";
import { useNaturaStore } from "@/lib/store";
import type { RemedyCategory } from "@/lib/types";

export default function NewRemedyPage() {
  const router = useRouter();
  const save = useNaturaStore((s) => s.saveCustomRemedy);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<RemedyCategory>("energy");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [safety, setSafety] = useState("");

  function onSave() {
    if (!title.trim()) return;
    const id = uid("custom-r");
    const stepList = steps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    save({
      id,
      title: title.trim(),
      category,
      summary: summary.trim() || "A custom comfort practice you added.",
      ingredients: ingredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      steps: stepList.length ? stepList : ["Follow your own notes."],
      howToUse: "Your notes. Not medical advice.",
      safety:
        safety.trim() ||
        "Home remedies are not treatments. Stop if anything feels wrong.",
      seeDoctorIf: "Symptoms persist or you take medications.",
      custom: true,
    });
    router.push(`/remedies/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/remedies" className="text-sm font-medium text-sage-700">
        ← Remedies
      </Link>
      <h1 className="text-2xl font-bold text-sage-900">Custom remedy</h1>
      <input
        className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2.5 text-sm"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2.5 text-sm"
        rows={2}
        placeholder="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <select
        className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2 text-sm"
        value={category}
        onChange={(e) => setCategory(e.target.value as RemedyCategory)}
      >
        <option value="circadian">Circadian</option>
        <option value="sleep">Sleep</option>
        <option value="metabolic">Metabolic</option>
        <option value="stress">Stress</option>
        <option value="recovery">Recovery</option>
        <option value="digestion">Digestion</option>
        <option value="energy">Energy</option>
        <option value="immunity">Immunity</option>
        <option value="skin">Skin</option>
      </select>
      <input
        className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2.5 text-sm"
        placeholder="Ingredients, comma separated"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />
      <textarea
        className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2.5 text-sm"
        rows={4}
        placeholder="Steps, one per line"
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
      />
      <textarea
        className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2.5 text-sm"
        rows={2}
        placeholder="Safety note"
        value={safety}
        onChange={(e) => setSafety(e.target.value)}
      />
      <button type="button" className="btn-primary w-full" onClick={onSave}>
        Save remedy
      </button>
    </div>
  );
}
