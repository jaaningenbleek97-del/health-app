"use client";

import { useEffect } from "react";
import { applyThemeClass } from "@/lib/theme";
import { useNaturaStore } from "@/lib/store";

export function ThemeSync() {
  const theme = useNaturaStore((s) => s.theme);

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  return null;
}
