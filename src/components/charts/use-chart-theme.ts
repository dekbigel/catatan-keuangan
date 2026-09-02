"use client";

import { useEffect, useState } from "react";

type ChartTheme = {
  primary: string;
  income: string;
  expense: string;
  border: string;
  mutedForeground: string;
};

const FALLBACK: ChartTheme = {
  primary: "#0e9f6e",
  income: "#059669",
  expense: "#dc2626",
  border: "#e2e8e5",
  mutedForeground: "#61716a",
};

/**
 * Membaca token warna CSS variable secara runtime agar chart Recharts
 * selalu sinkron dengan tema (light/dark) aktif.
 */
export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(FALLBACK);

  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      const pick = (name: string, fallback: string) =>
        styles.getPropertyValue(name).trim() || fallback;

      setTheme({
        primary: pick("--primary", FALLBACK.primary),
        income: pick("--status-income", FALLBACK.income),
        expense: pick("--status-expense", FALLBACK.expense),
        border: pick("--border", FALLBACK.border),
        mutedForeground: pick("--muted-foreground", FALLBACK.mutedForeground),
      });
    };

    read();

    // Re-read ketika class tema berubah (toggle dark/light)
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
