"use client";

import { useState } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n/client";
import { photos } from "@/data/houses";
import styles from "./Territory.module.css";

const images = [
  photos.tub,
  photos.sauna,
  photos.firepit,
  photos.trail,
  photos.winter,
];

export default function Territory() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);

  return (
    <section id="territory" className={styles.section} aria-labelledby="territory-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.head}>
          <h2 id="territory-title" className="h2">
            {t.territory.title}
          </h2>
          <p className={styles.lead}>{t.territory.lead}</p>
        </div>

        <div className={styles.stage} aria-hidden="true">
          {images.map((src, i) => (
            <div key={src} className={styles.frame} data-active={i === active || undefined}>
              <Image src={src} alt="" fill sizes="(min-width: 1200px) 44vw, 0px" />
            </div>
          ))}
        </div>

        <ul className={styles.list}>
          {t.territory.items.map((item, i) => (
            <li
              key={item.title}
              className={styles.item}
              data-active={i === active || undefined}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              tabIndex={0}
            >
              <div className={styles.thumb}>
                <Image src={images[i]} alt="" fill sizes="(min-width: 1200px) 0px, (min-width: 768px) 40vw, 92vw" />
              </div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
