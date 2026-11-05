"use client";

import { useCallback, useEffect, useState } from "react";
import type { HouseSlug } from "@/data/houses";
import type { Range } from "@/lib/dates";

export type AvailabilityData = {
  source: "sheets" | "demo";
  updatedAt: string;
  houses: Record<HouseSlug, Range[]>;
};

/**
 * Loads booked dates for all houses and keeps them fresh:
 * refetches every 30 s and whenever the tab regains focus, so a booking
 * entered into the spreadsheet shows up without reloading the page.
 */
export function useAvailability() {
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/availability", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(load);
    const id = setInterval(load, 30_000);
    const onFocus = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  return { data, error, reload: load };
}
