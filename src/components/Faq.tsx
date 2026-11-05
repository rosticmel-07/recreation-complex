"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/client";
import styles from "./Faq.module.css";

export default function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={`container ${styles.grid}`}>
        <h2 id="faq-title" className={`h2 ${styles.title}`}>
          {t.faq.title}
        </h2>
        <div className={styles.list}>
          {t.faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={styles.item} data-open={isOpen || undefined}>
                <h3>
                  <button
                    type="button"
                    className={styles.q}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {item.q}
                    <span className={styles.icon} aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={styles.a}>
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
