"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useI18n } from "@/i18n/client";
import { photos } from "@/data/houses";
import SearchBar from "./SearchBar";
import styles from "./Hero.module.css";

const SEEN_KEY = "tysha-intro-seen";

export default function Hero() {
  const { t, locale } = useI18n();
  const root = useRef<HTMLElement>(null);
  const word = locale === "uk" ? "ТИША" : "TYSHA";

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const html = document.documentElement;

    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1" || html.hasAttribute("data-swap");
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const finalState = () => {
        gsap.set(q(`.${styles.mask}`), { autoAlpha: 0 });
        gsap.set(q(`.${styles.photo}`), { scale: 1 });
        gsap.set(q("[data-hero-line]"), { yPercent: 0 });
        gsap.set(q("[data-hero-fade]"), { autoAlpha: 1, y: 0 });
      };

      if (seen || reduce) {
        finalState();
        // Slow drift keeps the first screen alive without a full intro.
        if (!reduce) gsap.fromTo(q(`.${styles.photo}`), { scale: 1.08 }, { scale: 1, duration: 2.4, ease: "power2.out" });
        return;
      }

      /** Zoom into the middle stem of «Ш» / the crossbar of «H», so the screen fills with the photo. */
      const flyOrigin = () => {
        const text = el.querySelector<SVGTextElement>(`.${styles.word}`)!;
        const i = Math.max(0, text.textContent!.search(/[ШH]/));
        const r = text.getExtentOfChar(i);
        return `${r.x + r.width / 2} ${r.y + r.height * 0.55}`;
      };

      html.setAttribute("data-intro", "");
      gsap.set(q("[data-hero-line]"), { yPercent: 110 });
      gsap.set(q("[data-hero-fade]"), { autoAlpha: 0, y: 24 });
      gsap.set(q(`.${styles.photo}`), { scale: 1.3 });
      gsap.set(q(`.${styles.word}`), { autoAlpha: 0, y: 40 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onComplete: () => {
          try {
            sessionStorage.setItem(SEEN_KEY, "1");
          } catch {}
        },
      });

      tl.to(q(`.${styles.word}`), { autoAlpha: 1, y: 0, duration: 1.2 })
        .from(q(`.${styles.place}`), { autoAlpha: 0, y: 12, duration: 0.8 }, "-=0.7")
        .to(q(`.${styles.photo}`), { scale: 1.18, duration: 1.4, ease: "none" }, 0)
        // Fly through the letters into the landscape.
        .addLabel("fly", "+=0.35")
        .to(q(`.${styles.place}`), { autoAlpha: 0, duration: 0.4 }, "fly")
        .to(q(`.${styles.word}`), { scale: 150, svgOrigin: flyOrigin, duration: 1.8, ease: "expo.in" }, "fly")
        .to(q(`.${styles.veil}`), { opacity: 0, duration: 0.5, ease: "power1.in" }, "fly+=1.3")
        .to(q(`.${styles.photo}`), { scale: 1, duration: 2.4, ease: "expo.out" }, "fly+=1.2")
        .set(q(`.${styles.mask}`), { autoAlpha: 0 })
        .call(() => html.removeAttribute("data-intro"), [], "fly+=1.6")
        .to(q("[data-hero-line]"), { yPercent: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" }, "fly+=1.65")
        .to(q("[data-hero-fade]"), { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, "fly+=1.9");

      // Start once the font and the photo are ready, but never wait longer than 2.5 s.
      const img = el.querySelector("img");
      const imgReady = img?.complete
        ? Promise.resolve()
        : new Promise<void>((r) => img?.addEventListener("load", () => r(), { once: true }));
      Promise.race([
        Promise.all([document.fonts.ready, imgReady]),
        new Promise((r) => setTimeout(r, 2500)),
      ]).then(() => tl.play());
    }, el);

    return () => {
      ctx.revert();
      html.removeAttribute("data-intro");
    };
  }, []);

  return (
    <section ref={root} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media}>
        <Image
          className={styles.photo}
          src={photos.hero}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="100vw"
        />
        <div className={styles.shade} />
      </div>

      <svg className={styles.mask} aria-hidden="true">
        <defs>
          <mask id="hero-word-mask" maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="white" />
            <text
              className={styles.word}
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="black"
            >
              {word}
            </text>
          </mask>
        </defs>
        <rect className={styles.veil} width="100%" height="100%" mask="url(#hero-word-mask)" />
      </svg>

      <p className={styles.place} aria-hidden="true">
        {t.hero.place}
      </p>

      <div className={`container ${styles.content}`}>
        <p className={styles.kicker} data-hero-fade>
          {t.hero.place}
        </p>
        <h1 id="hero-title" className={styles.title}>
          {t.hero.title.map((line) => (
            <span key={line} className={styles.line}>
              <span data-hero-line>{line}</span>
            </span>
          ))}
        </h1>
        <div data-hero-fade>
          <SearchBar />
        </div>
      </div>

      <a href={`/${locale}#intro`} className={styles.scroll} data-hero-fade aria-label={t.hero.scroll}>
        <span />
      </a>
    </section>
  );
}
