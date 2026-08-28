"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { uid } from "@/lib/uid";
import { useNaturaStore } from "@/lib/store";
import type { WorkoutCategory, WorkoutDifficulty, WorkoutStep } from "@/lib/types";

function parseSteps(raw: string): WorkoutStep[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, rest] = line.split("|").map((s) => s.trim());
      const minutes = rest ? Number(rest) : 1;
      return {
        name: name || "Step",
        durationSec: Number.isFinite(minutes) ? Math.round(minutes * 60) : 60,
      };
    });
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const save = useNaturaStore((s) => s.saveCustomWorkout);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<WorkoutCategory>("mobility");
  const [difficulty, setDifficulty] = useState<WorkoutDifficulty>("beginner");
  const [steps, setSteps] = useState("Easy stroll | 5\nBreathing | 2");

  function onSave() {
    const parsed = parseSteps(steps);
    if (!title.trim() || parsed.length === 0) return;
    const durationMin = Math.max(
      1,
      Math.round(parsed.reduce((a, s) => a + (s.durationSec ?? 0), 0) / 60)
    );
    const id = uid("custom-w");
    save({
      id,
      title: title.trim(),
      description: description.trim() || "Your custom session.",
      durationMin,
      difficulty,
      category,
      equipment: "none",
      steps: parsed,
      custom: true,
    });
    router.push(`/fitness/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/fitness" className="text-sm font-medium text-sage-700">
        ← Workouts
      </Link>
      <h1 className="text-2xl font-bold text-sage-900">Custom workout</h1>
      <p className="text-sm text-sage-600">
        One step per line. Use <code>Name | minutes</code>.
      </p>
      <input
        className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm"
        rows={2}
        placeholder="Short description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          className="rounded-xl border border-cream-200 px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value as WorkoutCategory)}
        >
          <option value="walk">Walk</option>
          <option value="mobility">Mobility</option>
          <option value="strength">Strength</option>
          <option value="calisthenics">Calisthenics</option>
          <option value="stretch">Stretch</option>
          <option value="yoga">Yoga</option>
          <option value="breath">Breath</option>
        </select>
        <select
          className="rounded-xl border border-cream-200 px-3 py-2 text-sm"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as WorkoutDifficulty)}
        >
          <option value="beginner">Beginner</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
        </select>
      </div>
      <textarea
        className="w-full rounded-xl border border-cream-200 px-3 py-2.5 font-mono text-sm"
        rows={6}
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
      />
      <button type="button" className="btn-primary w-full" onClick={onSave}>
        Save workout
      </button>
    </div>
  );
}
