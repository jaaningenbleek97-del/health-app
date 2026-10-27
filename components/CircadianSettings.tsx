"use client";

import { useMemo, useState } from "react";
import { CITY_PRESETS, circadianClock, normalizeCircadianPrefs } from "@/lib/circadian";
import { formatClock } from "@/lib/sun";
import { useNaturaStore } from "@/lib/store";

export function CircadianSettings() {
  const rawPrefs = useNaturaStore((s) => s.circadianPrefs);
  const setCircadianPrefs = useNaturaStore((s) => s.setCircadianPrefs);
  const [geoNote, setGeoNote] = useState("");
  const prefs = useMemo(() => normalizeCircadianPrefs(rawPrefs), [rawPrefs]);
  const clock = useMemo(() => circadianClock(prefs), [prefs]);

  function useDevice() {
    if (!navigator.geolocation) {
      setGeoNote("This browser cannot share location.");
      return;
    }
    setGeoNote("Finding you…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCircadianPrefs({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          locationLabel: "This device",
        });
        setGeoNote("Using this device.");
      },
      () => setGeoNote("Location was blocked or failed.")
    );
  }

  return (
    <section className="card space-y-3 p-4">
      <div>
        <h2 className="font-semibold text-sage-900">Circadian clock</h2>
        <p className="mt-1 text-sm text-sage-600">
          Local sunrise and sunset set morning-light and dim-evening pings.
          Nothing leaves this device.
        </p>
      </div>
      <p className="text-sm text-sage-800">
        {prefs.locationLabel}: sunrise {formatClock(clock.sunriseHm)}, sunset{" "}
        {formatClock(clock.sunsetHm)}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {CITY_PRESETS.map((city) => (
          <button
            key={city.label}
            type="button"
            onClick={() =>
              setCircadianPrefs({
                latitude: city.lat,
                longitude: city.lng,
                locationLabel: city.label,
              })
            }
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              prefs.locationLabel === city.label
                ? "bg-sage-600 text-white"
                : "bg-cream-100 text-sage-800"
            }`}
          >
            {city.label}
          </button>
        ))}
        <button
          type="button"
          onClick={useDevice}
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            prefs.locationLabel === "This device"
              ? "bg-sage-600 text-white"
              : "bg-cream-100 text-sage-800"
          }`}
        >
          Use this device
        </button>
      </div>
      {geoNote && <p className="text-xs text-sage-500">{geoNote}</p>}

      <label className="flex items-center gap-2 text-sm text-sage-800">
        <input
          type="checkbox"
          checked={prefs.eatingWindowEnabled}
          onChange={(e) =>
            setCircadianPrefs({ eatingWindowEnabled: e.target.checked })
          }
        />
        Eating window reminders
      </label>
      {prefs.eatingWindowEnabled && (
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-medium text-sage-600">First bite</span>
            <input
              type="time"
              className="mt-1 w-full rounded-lg border border-cream-200 bg-surface px-2 py-1.5 text-sm"
              value={prefs.eatingStart}
              onChange={(e) =>
                setCircadianPrefs({ eatingStart: e.target.value })
              }
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-sage-600">Last bite</span>
            <input
              type="time"
              className="mt-1 w-full rounded-lg border border-cream-200 bg-surface px-2 py-1.5 text-sm"
              value={prefs.eatingEnd}
              onChange={(e) => setCircadianPrefs({ eatingEnd: e.target.value })}
            />
          </label>
        </div>
      )}
    </section>
  );
}
