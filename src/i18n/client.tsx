"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

const I18nContext = createContext<{ locale: Locale; t: Dictionary } | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, t: getDictionary(locale) }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export const formatPrice = (n: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-US").format(n).replace(/,/g, " ");
