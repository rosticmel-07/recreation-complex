"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { useI18n, formatPrice } from "@/i18n/client";
import { houseBySlug, type HouseSlug } from "@/data/houses";
import styles from "./HouseHero.module.css";

export default function HouseHero({ slug }: { slug: HouseSlug }) {
  const { t, locale } = useI18n();
  const house = houseBySlug(slug)!;
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const q = gsap.utils.selector(root);
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(q(`.${styles.photo}`), { scale: 1.2, duration: 2.2 })
        .from(q(`.${styles.media}`), { clipPath: "inset(12% 8% 0% 8%)", duration: 1.6 }, 0)
        .from(q("[data-line]"), { yPercent: 110, duration: 1.3, stagger: 0.08 }, 0.35)
        .from(q("[data-fade]"), { autoAlpha: 0, y: 20, duration: 1, stagger: 0.06 }, 0.6);

      gsap.to(q(`.${styles.photo}`), {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const facts = [
    { label: t.house.facts.guests, value: String(house.guests) },
    { label: t.house.facts.bedrooms, value: String(house.bedrooms) },
    { label: t.house.facts.area, value: t.houses.area(house.area) },
    { label: t.house.facts.price, value: `${t.houses.from} ${formatPrice(house.priceWeekday, locale)} ${t.currency}` },
  ];

  return (
    <section ref={root} className={styles.hero}>
      <div className={styles.media}>
        <Image className={styles.photo} src={house.cover} alt="" fill priority sizes="100vw" />
        <div className={styles.shade} />
      </div>

      <div className={`container ${styles.content}`}>
        <Link href={`/${locale}#houses`} className={styles.back} data-fade>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {t.house.back}
        </Link>

        <h1 className={styles.name}>
          <span className={styles.line}>
            <span data-line>{house.name[locale]}</span>
          </span>
        </h1>
        <p className={styles.tagline} data-fade>
          {house.tagline[locale]}
        </p>

        <dl className={styles.facts}>
          {facts.map((f) => (
            <div key={f.label} className={styles.fact} data-fade>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
