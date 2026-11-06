"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n, formatPrice } from "@/i18n/client";
import { houses, type HouseSlug } from "@/data/houses";
import styles from "./OtherHouses.module.css";

export default function OtherHouses({ slug }: { slug: HouseSlug }) {
  const { t, locale } = useI18n();
  const others = houses.filter((h) => h.slug !== slug);

  return (
    <section className={styles.section} aria-labelledby="other-title">
      <div className="container">
        <h2 id="other-title" className="h2">
          {t.house.other}
        </h2>
        <div className={styles.grid}>
          {others.map((h) => {
            const href = `/${locale}/houses/${h.slug}`;
            return (
              <article key={h.slug} className={styles.card}>
                <Link href={href} className={styles.photo} tabIndex={-1} aria-hidden="true">
                  <Image placeholder="blur" src={h.cover} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" />
                </Link>
                <div className={styles.meta}>
                  <h3>
                    <Link href={href}>{h.name[locale]}</Link>
                  </h3>
                  <p>
                    {t.houses.guests(h.guests)}, {t.houses.from} {formatPrice(h.priceWeekday, locale)} {t.currency}
                  </p>
                </div>
                <div className={styles.actions}>
                  <Link href={`${href}#booking`} className="btn" aria-label={`${t.houses.book}: ${h.name[locale]}`}>
                    {t.houses.book}
                  </Link>
                  <Link href={href} className="btn btn--ghost" aria-label={`${t.houses.details}: ${h.name[locale]}`}>
                    {t.houses.details}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
