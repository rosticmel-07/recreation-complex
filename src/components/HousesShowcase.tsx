"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n, formatPrice } from "@/i18n/client";
import { houses } from "@/data/houses";
import styles from "./HousesShowcase.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function HousesShowcase() {
  const { t, locale } = useI18n();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Layout effect: its cleanup un-pins the section before React removes it from the page.
  // GSAP wraps a pinned element in its own "pin-spacer"; without the revert, leaving the page
  // makes React try to remove the section from a parent it no longer owns.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mm = gsap.matchMedia();

    // Desktop: the section pins and the houses slide past horizontally.
    mm.add("(min-width: 1200px)", () => {
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth;
      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      gsap.utils
        .toArray<HTMLElement>(`.${styles.photo} img`, section.current)
        .forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: img.closest(`.${styles.card}`),
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });
    });

    return () => mm.revert();
  }, []);

  /** A label that follows the pointer over a photo. */
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    // The wrapper belongs to React; GSAP's pin-spacer is created inside it, around the section.
    <div>
      <section
        ref={section}
        id="houses"
        className={styles.section}
        aria-labelledby="houses-title"
      >
        <div ref={track} className={styles.track}>
          <header className={styles.intro}>
            <h2 id="houses-title" className="h2">
              {t.houses.title}
            </h2>
            <p className={styles.lead}>{t.houses.lead}</p>
          </header>

          {houses.map((h) => (
            <article key={h.slug} className={styles.card}>
              <Link
                href={`/${locale}/houses/${h.slug}`}
                className={styles.photo}
                onPointerMove={onMove}
                aria-label={`${t.houses.open}: ${h.name[locale]}`}
              >
                <Image
                  src={h.cover}
                  alt=""
                  fill
                  sizes="(min-width: 1200px) 56vw, 92vw"
                />
                <span className={styles.cursor} aria-hidden="true">
                  {t.houses.open}
                </span>
              </Link>
              <div className={styles.meta}>
                <h3 className={styles.name}>
                  <Link href={`/${locale}/houses/${h.slug}`}>
                    {h.name[locale]}
                  </Link>
                </h3>
                <p className={styles.tagline}>{h.tagline[locale]}</p>
                <ul className={styles.specs}>
                  <li>{t.houses.guests(h.guests)}</li>
                  <li>{t.houses.bedrooms(h.bedrooms)}</li>
                  <li>{t.houses.area(h.area)}</li>
                </ul>
                <p className={styles.price}>
                  {t.houses.from}{" "}
                  <strong>{formatPrice(h.priceWeekday, locale)}</strong>{" "}
                  {t.currency} <span>{t.houses.perNight}</span>
                </p>
                <div className={styles.actions}>
                  <Link
                    href={`/${locale}/houses/${h.slug}#booking`}
                    className="btn btn--light"
                    aria-label={`${t.houses.book}: ${h.name[locale]}`}
                  >
                    {t.houses.book}
                  </Link>
                  <Link
                    href={`/${locale}/houses/${h.slug}`}
                    className="btn btn--ghost"
                    aria-label={`${t.houses.details}: ${h.name[locale]}`}
                  >
                    {t.houses.details}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
