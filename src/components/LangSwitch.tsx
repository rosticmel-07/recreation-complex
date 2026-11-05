"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { locales, type Locale } from "@/i18n/config";
import { CURTAIN_KEY } from "@/lib/curtain";
import styles from "./LangSwitch.module.css";

const labels: Record<Locale, { short: string; full: string }> = {
  uk: { short: "UA", full: "Українська" },
  en: { short: "EN", full: "English" },
};


export default function LangSwitch({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [active, setActive] = useState<Locale>(locale);

  const hrefFor = (l: Locale) => pathname.replace(/^\/(uk|en)(?=\/|$)/, `/${l}`) + window.location.hash;

  const go = (l: Locale) => {
    if (l === locale) return;
    setActive(l);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      sessionStorage.setItem(CURTAIN_KEY, labels[l].full);
      sessionStorage.setItem(`${CURTAIN_KEY}-y`, String(window.scrollY));
    } catch {}

    const curtain = document.createElement("div");
    curtain.className = "lang-curtain";
    curtain.innerHTML = `<span>${labels[l].full}</span>`;
    document.body.appendChild(curtain);
    requestAnimationFrame(() => curtain.classList.add("is-in"));
    setTimeout(() => window.location.assign(hrefFor(l)), reduce ? 0 : 750);
  };

  return (
    <div
      className={styles.switch}
      data-tone={tone}
      data-active={active}
      role="group"
      aria-label={t.lang.label}
    >
      <span className={styles.thumb} aria-hidden="true" />
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className={styles.option}
          aria-pressed={active === l}
          aria-label={labels[l].full}
          onClick={() => go(l)}
        >
          <span className={styles.roll} data-text={labels[l].short}>
            {labels[l].short}
          </span>
        </button>
      ))}
    </div>
  );
}
