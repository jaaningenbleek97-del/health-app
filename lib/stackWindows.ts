import type { DoseTiming, StackItem } from "@/lib/types";

export type StackWindow = "morning" | "night";

export function timingsForWindow(window: StackWindow): DoseTiming[] {
  return window === "night"
    ? ["evening"]
    : ["morning", "with_food", "anytime"];
}

export function stackWindowForTiming(timing: DoseTiming): StackWindow {
  return timing === "evening" ? "night" : "morning";
}

export function itemsInWindow(
  stack: StackItem[],
  window: StackWindow
): StackItem[] {
  const timings = new Set(timingsForWindow(window));
  return stack.filter((item) => timings.has(item.timing));
}

export function defaultTimingForWindow(window: StackWindow): DoseTiming {
  return window === "night" ? "evening" : "morning";
}

export function stackWindowPath(window: StackWindow): string {
  return window === "night" ? "/stack/night" : "/stack/morning";
}

export function stackWindowLabel(window: StackWindow): string {
  return window === "night" ? "Night supplements" : "Morning supplements";
}
