"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n/client";
import { photos } from "@/data/houses";
import styles from "./DayStory.module.css";

const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

const frames = [
  u("1560793143-8baa3a5238c0"),
  u("1579904380653-bca3242e4594"),
  u("1594218465207-e7f4d2503ebb"),
  photos.sauna,
  photos.firepit,
  u("1483737489035-78c01af155f1"),
];

/**
 * The closing story: the section is several screens tall, its stage stays on screen (CSS sticky,
 * no GSAP pin) and the scroll position picks the moment of the day.
 */
export default function DayStory() {
  const { t, locale } = useI18n();
  const section = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const moments = t.day.moments;
  const last = moments.length - 1;

  useEffect(() => {
    const el = section.current!;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(
        1,
        Math.max(0, -r.top / (r.height - window.innerHeight)),
      );
      el.style.setProperty("--p", p.toFixed(4));
      setIndex(Math.min(last, Math.floor(p * moments.length * 0.999)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [last, moments.length]);

  /** Clicking a time on the ruler scrolls to that moment. */
  const jump = (i: number) => {
    const el = section.current!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y =
      top +
      ((el.offsetHeight - window.innerHeight) * (i + 0.5)) / moments.length;
    if (window.__lenis) window.__lenis.scrollTo(y);
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section
      ref={section}
      className={styles.section}
      style={{ ["--count" as string]: moments.length }}
      aria-labelledby="day-title"
    >
      <div className={styles.stage}>
        <div className={styles.frames} aria-hidden="true">
          {frames.map((src, i) => (
            <div
              key={src}
              className={styles.frame}
              data-state={i < index ? "past" : i === index ? "active" : "next"}
            >
              <Image src={src} alt="" fill sizes="100vw" loading="eager" />
            </div>
          ))}
          <div className={styles.shade} />
        </div>

        <div className={`container ${styles.content}`}>
          <h2 id="day-title" className={styles.title}>
            {t.day.title}
          </h2>

          <div className={styles.moment} aria-live="polite">
            <p className={styles.time} key={`t${index}`}>
              {moments[index].time.split("").map((ch, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.04}s` }}>
                  {ch}
                </span>
              ))}
            </p>
            <div key={`m${index}`} className={styles.copy}>
              <h3>{moments[index].title}</h3>
              <p>{moments[index].text}</p>
            </div>
            <div
              className={styles.cta}
              data-visible={index === last || undefined}
            >
              <a
                href={`/${locale}#availability`}
                className="btn btn--light"
                tabIndex={index === last ? 0 : -1}
              >
                {t.day.cta}
              </a>
            </div>
          </div>

          <div className={styles.rulerWrap}>
            <span className={styles.progress} aria-hidden="true" />
            <ol className={styles.ruler}>
              {moments.map((m, i) => (
                <li
                  key={m.time}
                  data-state={
                    i < index ? "past" : i === index ? "active" : "next"
                  }
                >
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    aria-current={i === index ? "step" : undefined}
                  >
                    <i aria-hidden="true" />
                    <span>{m.time}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
