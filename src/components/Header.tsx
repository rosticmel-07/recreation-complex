"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import LangSwitch from "./LangSwitch";
import styles from "./Header.module.css";

export default function Header() {
  const { locale, t } = useI18n();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 480 && y > lastY.current + 2);
      if (y < lastY.current - 2 || y < 480) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const home = `/${locale}`;
  const links = [
    { href: `${home}#houses`, label: t.nav.houses },
    { href: `${home}#availability`, label: t.nav.availability },
    { href: `${home}#territory`, label: t.nav.territory },
    { href: `${home}#location`, label: t.nav.location },
  ];

  return (
    <>
      <header
        className={styles.header}
        data-solid={solid || undefined}
        data-hidden={(hidden && !open) || undefined}
        data-open={open || undefined}
      >
        <div className={styles.inner}>
          <Link href={home} className={styles.logo} aria-label={t.brand} onClick={() => setOpen(false)}>
            <Logo />
            <span>{locale === "uk" ? "Тиша" : "Tysha"}</span>
          </Link>

          <nav className={styles.nav} aria-label={t.nav.menu}>
            {links.map((l) => (
              <a key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className={styles.actions}>
            <LangSwitch tone={solid && !open ? "dark" : "light"} />
            <a href={`${home}#availability`} className={`btn ${solid ? "" : "btn--light"} ${styles.cta}`}>
              {t.nav.book}
            </a>
            <button
              type="button"
              className={styles.burger}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.nav.close : t.nav.menu}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className={styles.menu} data-open={open || undefined} aria-hidden={!open}>
        <nav className={styles.menuNav}>
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className={styles.menuLink}
              style={{ transitionDelay: open ? `${0.15 + i * 0.06}s` : "0s" }}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className={styles.menuFoot}>
          <a href={`tel:${t.footer.phone.replace(/\s/g, "")}`} tabIndex={open ? 0 : -1}>
            {t.footer.phone}
          </a>
          <a
            href={`${home}#availability`}
            className="btn btn--light"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            {t.nav.book}
          </a>
        </div>
      </div>
    </>
  );
}

/** Two ridgelines: the mark of Tysha. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 24" width="40" height="24" fill="none" aria-hidden="true">
      <path d="M1 22 L13 6 L20 14 L27 4 L39 22" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 22 L14 15 L19 20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity=".55" />
    </svg>
  );
}
