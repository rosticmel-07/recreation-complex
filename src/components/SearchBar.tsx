"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { houses, type HouseSlug } from "@/data/houses";
import { fromISO, nightsBetween, type ISODate } from "@/lib/dates";
import RangeCalendar, { type DateValue } from "./RangeCalendar";
import Sheet from "./Sheet";
import { useAvailability } from "./useAvailability";
import { useMedia } from "./useMedia";
import styles from "./SearchBar.module.css";

export function useDateLabel() {
  const { t } = useI18n();
  return (d?: ISODate) => {
    if (!d) return "";
    const x = fromISO(d);
    return `${x.getDate()} ${t.monthsShort[x.getMonth()]}`;
  };
}

export default function SearchBar({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const label = useDateLabel();
  const wide = useMedia("(min-width: 768px)");
  const { data } = useAvailability();

  const [house, setHouse] = useState<HouseSlug>("smereka");
  const [dates, setDates] = useState<DateValue>({});
  const [guests, setGuests] = useState(2);
  const [open, setOpen] = useState(false);

  const maxGuests = houses.find((h) => h.slug === house)!.guests;
  const booked = data?.houses[house] ?? [];

  const changeHouse = (slug: HouseSlug) => {
    setHouse(slug);
    setDates({});
    setGuests((g) => Math.min(g, houses.find((h) => h.slug === slug)!.guests));
  };

  const submit = () => {
    const q = new URLSearchParams({ guests: String(guests) });
    if (dates.from && dates.to) {
      q.set("from", dates.from);
      q.set("to", dates.to);
    }
    router.push(`/${locale}/houses/${house}?${q}#booking`);
  };

  const dateText =
    dates.from && dates.to
      ? `${label(dates.from)} – ${label(dates.to)}`
      : dates.from
        ? `${label(dates.from)} – …`
        : t.search.chooseDates;

  return (
    <>
      <div className={`${styles.bar} ${className ?? ""}`}>
        <label className={styles.field}>
          <span className={styles.label}>{t.search.house}</span>
          <select
            className={styles.select}
            value={house}
            onChange={(e) => changeHouse(e.target.value as HouseSlug)}
          >
            {houses.map((h) => (
              <option key={h.slug} value={h.slug}>
                {h.name[locale]}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className={styles.field} onClick={() => setOpen(true)}>
          <span className={styles.label}>{t.search.dates}</span>
          <span className={styles.value} data-empty={!dates.from || undefined}>
            {dateText}
          </span>
        </button>

        <div className={styles.field}>
          <span className={styles.label} id="guests-label">
            {t.search.guests}
          </span>
          <div className={styles.stepper} role="group" aria-labelledby="guests-label">
            <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label="−">
              −
            </button>
            <output aria-live="polite">{guests}</output>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
              disabled={guests >= maxGuests}
              aria-label="+"
            >
              +
            </button>
          </div>
        </div>

        <button type="button" className={`btn ${styles.submit}`} onClick={submit}>
          {t.search.submit}
        </button>
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={houses.find((h) => h.slug === house)!.name[locale]}
        footer={
          <div className={styles.sheetFoot}>
            <span>
              {dates.from && dates.to ? `${dateText}, ${t.booking.nights(nightsBetween(dates.from, dates.to))}` : ""}
            </span>
            <button
              type="button"
              className="btn"
              disabled={!dates.from || !dates.to}
              onClick={() => setOpen(false)}
            >
              {t.search.done}
            </button>
          </div>
        }
      >
        <RangeCalendar booked={booked} value={dates} onChange={setDates} months={wide ? 2 : 1} />
      </Sheet>
    </>
  );
}
