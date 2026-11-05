"use client";

import { useEffect, useState } from "react";
import { useI18n, formatPrice } from "@/i18n/client";
import { houseBySlug, type HouseSlug } from "@/data/houses";
import styles from "./MobileBookBar.module.css";

/** Phones and tablets: a price and a booking button stay at the bottom until the booking form is on screen. */
export default function MobileBookBar({ slug }: { slug: HouseSlug }) {
  const { t, locale } = useI18n();
  const house = houseBySlug(slug)!;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const booking = document.getElementById("booking");
    let bookingInView = false;
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.6 && !bookingInView);
    const io = new IntersectionObserver(([e]) => {
      bookingInView = e.isIntersecting;
      update();
    });
    if (booking) io.observe(booking);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div className={styles.bar} data-visible={visible || undefined} aria-hidden={!visible}>
      <p>
        <strong>
          {t.houses.from} {formatPrice(house.priceWeekday, locale)} {t.currency}
        </strong>
        <span>{t.houses.perNight}</span>
      </p>
      <a href="#booking" className="btn" tabIndex={visible ? 0 : -1}>
        {t.search.chooseDates}
      </a>
    </div>
  );
}
