"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { houses } from "@/data/houses";
import { addDays, fromISO, isNightBooked, today } from "@/lib/dates";
import { useAvailability } from "./useAvailability";
import styles from "./AvailabilityStrip.module.css";

const DAYS = 28;

export default function AvailabilityStrip() {
  const { t, locale } = useI18n();
  const { data, error } = useAvailability();
  const start = today();
  const days = Array.from({ length: DAYS }, (_, i) => addDays(start, i));

  const time = data
    ? new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
        new Date(data.updatedAt),
      )
    : "";

  return (
    <section id="availability" className={styles.section} aria-labelledby="availability-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="availability-title" className="h2">
            {t.availability.title}
          </h2>
          <div className={styles.headSide}>
            <p className={styles.lead}>{t.availability.lead}</p>
            <p className={styles.status} data-live={data?.source === "sheets" || undefined}>
              <i aria-hidden="true" />
              {data
                ? `${data.source === "sheets" ? t.availability.live : t.availability.demo}. ${t.availability.updated} ${time}`
                : error
                  ? t.availability.error
                  : t.availability.loading}
            </p>
          </div>
        </div>

        <div className={styles.board} data-lenis-prevent-horizontal>
          <div className={styles.table} role="table" aria-label={t.availability.title} style={{ ["--days" as string]: DAYS }}>
            <div className={styles.row} role="row">
              <span className={styles.corner} role="columnheader" />
              {days.map((d) => {
                const x = fromISO(d);
                const wd = (x.getDay() + 6) % 7;
                return (
                  <span key={d} className={styles.dayHead} role="columnheader" data-weekend={wd >= 5 || undefined}>
                    <small>{x.getDate() === 1 || d === start ? t.monthsShort[x.getMonth()] : t.weekdays[wd]}</small>
                    {x.getDate()}
                  </span>
                );
              })}
            </div>

            {houses.map((h) => {
              const booked = data?.houses[h.slug] ?? [];
              return (
                <div key={h.slug} className={styles.row} role="row">
                  <Link href={`/${locale}/houses/${h.slug}`} className={styles.house} role="rowheader">
                    {h.name[locale]}
                    <small>{t.houses.guests(h.guests)}</small>
                  </Link>
                  {days.map((d) => {
                    const busy = isNightBooked(d, booked);
                    const label = `${h.name[locale]}, ${fromISO(d).getDate()} ${t.monthsShort[fromISO(d).getMonth()]}: ${busy ? t.availability.booked : t.availability.free}`;
                    return busy || !data ? (
                      <span key={d} role="cell" className={styles.cell} data-busy={busy || undefined} data-loading={!data || undefined} aria-label={label} />
                    ) : (
                      <Link
                        key={d}
                        role="cell"
                        href={`/${locale}/houses/${h.slug}?from=${d}#booking`}
                        className={styles.cell}
                        aria-label={label}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.legend}>
          <span>
            <i className={styles.legendFree} /> {t.availability.free}
          </span>
          <span>
            <i className={styles.legendBusy} /> {t.availability.booked}
          </span>
          <span className={styles.pick}>{t.availability.pick}</span>
        </div>
      </div>
    </section>
  );
}
