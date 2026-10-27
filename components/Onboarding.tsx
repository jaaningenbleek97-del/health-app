"use client";

import { useState } from "react";
import { supplements } from "@/data/supplements";
import { useNaturaStore } from "@/lib/store";
import type { DoseTiming } from "@/lib/types";
import { DisclaimerBanner } from "./DisclaimerBanner";

const SUGGESTED = ["vitamin-d", "magnesium", "omega-3"] as const;

export function Onboarding() {
  const complete = useNaturaStore((s) => s.onboardingComplete);
  const completeOnboarding = useNaturaStore((s) => s.completeOnboarding);
  const setOnboardingComplete = useNaturaStore((s) => s.setOnboardingComplete);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>([...SUGGESTED]);
  const [addReminder, setAddReminder] = useState(true);
  const [time, setTime] = useState("07:00");

  if (complete) return null;

  function toggle(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function finish() {
    const supplementIds = picked
      .map((id) => supplements.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => ({ id: s.id, timing: s.typicalTiming as DoseTiming }));

    completeOnboarding({
      name,
      supplementIds,
      reminder: addReminder
        ? {
            title: "Time for a workout",
            mode: "clock",
            time,
            days: [1, 2, 3, 4, 5],
            enabled: true,
            kind: "exercise",
          }
        : undefined,
    });
  }

  return (
    <div className="min-h-dvh bg-cream-50 px-4 py-10">
      <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center">
        <div className="card space-y-4 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-sage-500">
            Welcome · {step + 1} of 3
          </div>
          <h1 className="text-2xl font-bold text-sage-900">Terrain</h1>

          {step === 0 && (
            <>
              <p className="text-sm text-sage-600">
                Functional-wellness companion: light, sleep, food, minerals,
                natural remedies. What should we call you?
              </p>
              <input
                className="w-full rounded-xl border border-cream-200 bg-surface px-3 py-2.5 text-sm"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <DisclaimerBanner compact />
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => setStep(1)}
              >
                Continue
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-sage-600">
                Common foundation supplements (D3, magnesium, omega-3). Pick
                what you already use — you’ll set exact doses on Supplements.
              </p>
              <ul className="space-y-2">
                {SUGGESTED.map((id) => {
                  const s = supplements.find((x) => x.id === id);
                  if (!s) return null;
                  const on = picked.includes(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left ${
                          on
                            ? "border-sage-500 bg-sage-50"
                            : "border-cream-200 bg-surface"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
                            on
                              ? "border-sage-600 bg-sage-600 text-white"
                              : "border-sage-300"
                          }`}
                        >
                          {on ? "✓" : ""}
                        </span>
                        <span>
                          <span className="block text-sm font-medium">
                            {s.name}
                          </span>
                          <span className="block text-xs text-sage-600">
                            {s.summary}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setStep(0)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-primary flex-1"
                  onClick={() => setStep(2)}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-sage-600">
                One weekday movement reminder. Alerts work best while Terrain is
                open.
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={addReminder}
                  onChange={(e) => setAddReminder(e.target.checked)}
                />
                Weekday reminder
              </label>
              {addReminder && (
                <label className="block text-sm">
                  Time
                  <input
                    type="time"
                    className="mt-1 w-full rounded-xl border border-cream-200 bg-surface px-3 py-2"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </label>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-primary flex-1"
                  onClick={finish}
                >
                  Start using Terrain
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            className="w-full text-center text-xs font-medium text-sage-600 underline"
            onClick={() => setOnboardingComplete(true)}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
