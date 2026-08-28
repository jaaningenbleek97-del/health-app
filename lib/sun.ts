/** NOAA-style sunrise / sunset from lat/lng. No network. */

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

function rad2deg(r: number): number {
  return (r * 180) / Math.PI;
}

function wrap360(d: number): number {
  return ((d % 360) + 360) % 360;
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((day - start) / 86400000);
}

function utcHoursToLocal(date: Date, utcHours: number): Date {
  const next = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
  );
  next.setUTCMinutes(Math.round(utcHours * 60));
  return next;
}

function solarEvent(date: Date, lat: number, lng: number, rising: boolean): Date | null {
  const day = dayOfYear(date);
  const lngHour = lng / 15;
  const t = rising ? day + (6 - lngHour) / 24 : day + (18 - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(deg2rad(M)) + 0.02 * Math.sin(deg2rad(2 * M)) + 282.634;
  L = wrap360(L);
  let ra = rad2deg(Math.atan(0.91764 * Math.tan(deg2rad(L))));
  ra = wrap360(ra);
  ra += Math.floor(L / 90) * 90 - Math.floor(ra / 90) * 90;
  ra /= 15;
  const sinDec = 0.39782 * Math.sin(deg2rad(L));
  const cosDec = Math.cos(Math.asin(sinDec));
  const zenith = 90.833;
  const cosH =
    (Math.cos(deg2rad(zenith)) - sinDec * Math.sin(deg2rad(lat))) /
    (cosDec * Math.cos(deg2rad(lat)));
  if (cosH > 1 || cosH < -1) return null;
  let H = rising ? 360 - rad2deg(Math.acos(cosH)) : rad2deg(Math.acos(cosH));
  H /= 15;
  const T = H + ra - 0.06571 * t - 6.622;
  let ut = (T - lngHour) % 24;
  if (ut < 0) ut += 24;
  return utcHoursToLocal(date, ut);
}

export function sunTimes(
  date: Date,
  lat: number,
  lng: number
): { sunrise: Date; sunset: Date } | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 89) return null;
  const sunrise = solarEvent(date, lat, lng, true);
  const sunset = solarEvent(date, lat, lng, false);
  if (!sunrise || !sunset) return null;
  return { sunrise, sunset };
}

export function formatLocalHm(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function addMinutesToHm(hm: string, minutes: number): string {
  const [h, m] = hm.split(":").map((n) => Number(n));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hm;
  const total = ((h * 60 + m + minutes) % (24 * 60) + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatClock(hm: string): string {
  const [h, m] = hm.split(":").map((n) => Number(n));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hm;
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
