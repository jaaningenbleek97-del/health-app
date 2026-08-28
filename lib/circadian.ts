import { addMinutesToHm, formatLocalHm, sunTimes } from "@/lib/sun";
import type { CircadianPrefs } from "@/lib/types";

export const CITY_PRESETS: { label: string; lat: number; lng: number }[] = [
  { label: "Auckland", lat: -36.85, lng: 174.76 },
  { label: "Sydney", lat: -33.87, lng: 151.21 },
  { label: "Tokyo", lat: 35.68, lng: 139.69 },
  { label: "Singapore", lat: 1.35, lng: 103.82 },
  { label: "London", lat: 51.51, lng: -0.13 },
  { label: "New York", lat: 40.71, lng: -74.01 },
  { label: "Los Angeles", lat: 34.05, lng: -118.24 },
  { label: "Denver", lat: 39.74, lng: -104.99 },
];

export function cityFromTimeZone(timeZone = guessTimeZone()): {
  label: string;
  lat: number;
  lng: number;
} {
  const zone = timeZone.toLowerCase();
  if (zone.includes("auckland") || zone.includes("chatham")) {
    return CITY_PRESETS[0];
  }
  if (zone.includes("sydney") || zone.includes("melbourne") || zone.includes("brisbane")) {
    return CITY_PRESETS[1];
  }
  if (zone.includes("tokyo") || zone.includes("osaka")) return CITY_PRESETS[2];
  if (zone.includes("singapore") || zone.includes("hong_kong")) return CITY_PRESETS[3];
  if (zone.includes("london") || zone.includes("dublin")) return CITY_PRESETS[4];
  if (zone.includes("new_york") || zone.includes("chicago") || zone.includes("toronto")) {
    return CITY_PRESETS[5];
  }
  if (zone.includes("los_angeles") || zone.includes("vancouver")) {
    return CITY_PRESETS[6];
  }
  if (zone.includes("denver") || zone.includes("phoenix")) return CITY_PRESETS[7];
  const offset = -new Date().getTimezoneOffset() / 60;
  if (offset >= 11) return CITY_PRESETS[0];
  if (offset >= 9) return CITY_PRESETS[2];
  if (offset >= 7) return CITY_PRESETS[3];
  if (Math.abs(offset) < 1) return CITY_PRESETS[4];
  if (offset <= -7) return CITY_PRESETS[6];
  if (offset <= -4) return CITY_PRESETS[5];
  return CITY_PRESETS[4];
}

function guessTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
}

export function defaultCircadianPrefs(): CircadianPrefs {
  const city = cityFromTimeZone();
  return {
    latitude: city.lat,
    longitude: city.lng,
    locationLabel: city.label,
    eatingWindowEnabled: false,
    eatingStart: "08:00",
    eatingEnd: "18:00",
  };
}

export function normalizeCircadianPrefs(
  raw?: Partial<CircadianPrefs> | null
): CircadianPrefs {
  const fallback = defaultCircadianPrefs();
  if (!raw) return fallback;
  return {
    latitude:
      typeof raw.latitude === "number" && Number.isFinite(raw.latitude)
        ? raw.latitude
        : fallback.latitude,
    longitude:
      typeof raw.longitude === "number" && Number.isFinite(raw.longitude)
        ? raw.longitude
        : fallback.longitude,
    locationLabel:
      typeof raw.locationLabel === "string" && raw.locationLabel
        ? raw.locationLabel
        : fallback.locationLabel,
    eatingWindowEnabled: Boolean(raw.eatingWindowEnabled),
    eatingStart:
      typeof raw.eatingStart === "string" && raw.eatingStart
        ? raw.eatingStart
        : fallback.eatingStart,
    eatingEnd:
      typeof raw.eatingEnd === "string" && raw.eatingEnd
        ? raw.eatingEnd
        : fallback.eatingEnd,
  };
}

export function todaySun(prefs: CircadianPrefs, now = new Date()) {
  return sunTimes(now, prefs.latitude, prefs.longitude);
}

export function circadianClock(
  prefs: CircadianPrefs,
  now = new Date()
): {
  sunriseHm: string;
  sunsetHm: string;
  lightHm: string;
  dimHm: string;
  morningStackHm: string;
  eveningStackHm: string;
} {
  const sun = todaySun(prefs, now);
  const sunriseHm = sun ? formatLocalHm(sun.sunrise) : "07:00";
  const sunsetHm = sun ? formatLocalHm(sun.sunset) : "17:30";
  return {
    sunriseHm,
    sunsetHm,
    lightHm: sunriseHm,
    dimHm: addMinutesToHm(sunsetHm, -60),
    morningStackHm: addMinutesToHm(sunriseHm, 45),
    eveningStackHm: addMinutesToHm(sunsetHm, -30),
  };
}
