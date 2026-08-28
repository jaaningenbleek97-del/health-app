"use client";

import { useMemo } from "react";
import { useNaturaStore } from "@/lib/store";

const SCALE = [1, 2, 3, 4, 5] as const;

export function VitalsCard() {
  const checkins = useNaturaStore((s) => s.checkins);
  const getTodayCheckin = useNaturaStore((s) => s.getTodayCheckin);
  const setTodayVitals = useNaturaStore((s) => s.setTodayVitals);
  const vitals = useMemo(() => {
    void checkins;
    return getTodayCheckin().vitals ?? {};
  }, [checkins, getTodayCheckin]);

  return (
    <section className="card space-y-3 p-4">
      <div>
        <h2 className="font-semibold text-sage-900">How you feel</h2>
        <p className="text-xs text-sage-500">
          Subjective check-in for today. Not a diagnosis.
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-sage-600">Sleep hours</span>
        <input
          type="number"
          min={0}
          max={14}
          step={0.5}
          inputMode="decimal"
          className="mt-1 w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm"
          value={vitals.sleepHours ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            setTodayVitals({
              sleepHours: raw === "" ? undefined : Number(raw),
            });
          }}
        />
      </label>

      <ScaleRow
        label="Energy"
        value={vitals.energy}
        selectedClass="bg-sage-600 text-white"
        onPick={(n) =>
          setTodayVitals({ energy: vitals.energy === n ? undefined : n })
        }
      />
      <ScaleRow
        label="Stress"
        value={vitals.stress}
        selectedClass="bg-terracotta-600 text-white"
        onPick={(n) =>
          setTodayVitals({ stress: vitals.stress === n ? undefined : n })
        }
      />

      <label className="block">
        <span className="text-xs font-medium text-sage-600">
          Resting heart rate (optional)
        </span>
        <input
          type="number"
          min={30}
          max={220}
          inputMode="numeric"
          className="mt-1 w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm"
          placeholder="bpm"
          value={vitals.restingHr ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            setTodayVitals({
              restingHr: raw === "" ? undefined : Number(raw),
            });
          }}
        />
      </label>
    </section>
  );
}

function ScaleRow({
  label,
  value,
  selectedClass,
  onPick,
}: {
  label: string;
  value?: number;
  selectedClass: string;
  onPick: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-sage-600">{label}</div>
      <div className="flex gap-1.5">
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPick(n)}
            className={`h-9 flex-1 rounded-xl text-sm font-semibold ${
              value === n
                ? selectedClass
                : "bg-cream-100 text-sage-800"
            }`}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
