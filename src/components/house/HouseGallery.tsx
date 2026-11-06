"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useI18n } from "@/i18n/client";
import { houseBySlug, type HouseSlug } from "@/data/houses";
import Parallax from "../Parallax";
import styles from "./HouseGallery.module.css";

export default function HouseGallery({ slug }: { slug: HouseSlug }) {
  const { t, locale } = useI18n();
  const house = houseBySlug(slug)!;
  const images = house.gallery;
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const label = (i: number) => `${house.name[locale]}, ${t.house.gallery.toLowerCase()} ${i + 1} / ${images.length}`;

  return (
    <section className={styles.section} aria-labelledby="gallery-title">
      <div className="container">
        <h2 id="gallery-title" className="visually-hidden">
          {t.house.gallery}
        </h2>
        <div className={styles.grid}>
          {images.map((src, i) => (
            <button key={src.src} type="button" className={styles.item} onClick={() => setOpen(i)} aria-label={label(i)}>
              <Parallax className={styles.frame} amount={10}>
                <Image src={src} alt="" fill sizes="(min-width: 1200px) 50vw, 100vw" placeholder="blur" />
              </Parallax>
            </button>
          ))}
        </div>
      </div>

      {open !== null &&
        createPortal(
          <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={label(open)}>
            <button type="button" className={styles.backdrop} onClick={close} aria-label={t.nav.close} />
            <div className={styles.stage}>
              <Image placeholder="blur" key={images[open].src} src={images[open]} alt="" fill sizes="100vw" className={styles.big} />
            </div>
            <div className={styles.controls}>
              <span className={styles.counter}>
                {open + 1} / {images.length}
              </span>
              <div className={styles.buttons}>
                <button type="button" onClick={() => step(-1)} aria-label={t.booking.prev}>
                  <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                <button type="button" onClick={() => step(1)} aria-label={t.booking.next}>
                  <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                <button type="button" onClick={close} aria-label={t.nav.close} autoFocus>
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                    <path d="M3 3l12 12M15 3 3 15" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
