"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { houses } from "@/data/houses";
import { Logo } from "./Header";
import styles from "./Footer.module.css";

export default function Footer() {
  const { locale, t } = useI18n();
  const home = `/${locale}`;

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.col}>
            <h2 className={styles.heading}>{t.footer.contacts}</h2>
            <a className={styles.big} href={`tel:${t.footer.phone.replace(/\s/g, "")}`}>
              {t.footer.phone}
            </a>
            <a className={styles.big} href={`mailto:${t.footer.email}`}>
              {t.footer.email}
            </a>
            <p className={styles.muted}>{t.footer.address}</p>
          </div>

          <div className={styles.col}>
            <h2 className={styles.heading}>{t.nav.houses}</h2>
            {houses.map((h) => (
              <Link key={h.slug} href={`${home}/houses/${h.slug}`} className={styles.link}>
                {h.name[locale]}
              </Link>
            ))}
          </div>

          <div className={styles.col}>
            <h2 className={styles.heading}>{t.footer.social}</h2>
            <a className={styles.link} href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a className={styles.link} href="https://t.me" target="_blank" rel="noreferrer">
              Telegram
            </a>
            <a className={styles.link} href="https://facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>

        <p className={styles.wordmark} aria-hidden="true">
          {locale === "uk" ? "Тиша" : "Tysha"}
        </p>

        <div className={styles.bottom}>
          <span className={styles.mark}>
            <Logo />
            © {new Date().getFullYear()} {t.footer.rights}
          </span>
          <span>{t.footer.demo}</span>
        </div>
      </div>
    </footer>
  );
}
