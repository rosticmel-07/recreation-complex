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
          {others.map((h) => (
            <Link key={h.slug} href={`/${locale}/houses/${h.slug}`} className={styles.card}>
              <div className={styles.photo}>
                <Image src={h.cover} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" />
              </div>
              <div className={styles.meta}>
                <h3>{h.name[locale]}</h3>
                <p>
                  {t.houses.guests(h.guests)}, {t.houses.from} {formatPrice(h.priceWeekday, locale)} {t.currency}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
