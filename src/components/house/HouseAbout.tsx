"use client";

import { useI18n, formatPrice } from "@/i18n/client";
import { houseBySlug, type HouseSlug } from "@/data/houses";
import styles from "./HouseAbout.module.css";

export default function HouseAbout({ slug }: { slug: HouseSlug }) {
  const { t, locale } = useI18n();
  const house = houseBySlug(slug)!;

  return (
    <section className={styles.section} aria-labelledby="about-title">
      <div className={`container ${styles.grid}`}>
        <h2 id="about-title" className={styles.label}>
          {t.house.about}
        </h2>
        <div className={styles.text}>
          {house.description.map((p, i) => (
            <p key={i} className={i === 0 ? styles.first : undefined}>
              {p[locale]}
            </p>
          ))}
        </div>

        <h2 className={styles.label}>{t.house.amenities}</h2>
        <div className={styles.side}>
          <ul className={styles.amenities}>
            {house.amenities.map((a) => (
              <li key={a.en}>{a[locale]}</li>
            ))}
          </ul>
          <dl className={styles.prices}>
            <div>
              <dt>{t.house.weekday}</dt>
              <dd>
                {formatPrice(house.priceWeekday, locale)} {t.currency}
              </dd>
            </div>
            <div>
              <dt>{t.house.weekend}</dt>
              <dd>
                {formatPrice(house.priceWeekend, locale)} {t.currency}
              </dd>
            </div>
          </dl>
          <p className={styles.times}>{t.house.checkTimes}</p>
        </div>
      </div>
    </section>
  );
}
