import type { DoseTiming, HabitId } from "@/lib/types";

export const HABITS: {
  id: HabitId;
  label: string;
  detail: string;
  window: "morning" | "midday" | "evening";
}[] = [
  {
    id: "morning-light",
    label: "Morning light",
    detail: "5–20 minutes outdoors after waking, no sunglasses if safe.",
    window: "morning",
  },
  {
    id: "delay-caffeine",
    label: "Delay caffeine",
    detail: "Water and light first. Coffee after you have been up 60–90 minutes.",
    window: "morning",
  },
  {
    id: "meal-walk",
    label: "Post-meal walk",
    detail: "About 10 easy minutes after your biggest meal.",
    window: "midday",
  },
  {
    id: "evening-dim",
    label: "Evening dim light",
    detail: "Dim screens and overheads in the last hour before bed.",
    window: "evening",
  },
];

export function habitById(id: HabitId) {
  return HABITS.find((h) => h.id === id)!;
}

export function currentWindows(hour: number): Array<"morning" | "midday" | "evening"> {
  if (hour < 11) return ["morning"];
  if (hour < 17) return ["midday"];
  return ["evening"];
}

export function dueTimings(hour: number): DoseTiming[] {
  if (hour < 11) return ["morning", "anytime"];
  if (hour < 17) return ["with_food", "anytime"];
  return ["evening", "anytime"];
}

export function timingLabel(timing: DoseTiming): string {
  switch (timing) {
    case "morning":
      return "Morning";
    case "with_food":
      return "With food";
    case "evening":
      return "Evening";
    default:
      return "Anytime";
  }
}
