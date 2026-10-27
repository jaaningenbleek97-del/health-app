import type { ThemeMode } from "@/lib/types";

export function normalizeTheme(raw: unknown): ThemeMode {
  return raw === "light" ? "light" : "dark";
}

export function applyThemeClass(theme: ThemeMode): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#121612" : "#FBF8F1");
  }
}
