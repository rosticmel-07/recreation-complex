"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import { addDays, fromISO, isNightBooked, toISO, today, type ISODate, type Range } from "@/lib/dates";
import styles from "./RangeCalendar.module.css";

export type DateValue = { from?: ISODate; to?: ISODate };

type Props = {
  booked: Range[];
  value: DateValue;
  onChange: (v: DateValue) => void;
  months?: 1 | 2;
  maxNights?: number;
};

const MAX_MONTHS_AHEAD = 12;

function monthStart(iso: ISODate) {
  const d = fromISO(iso);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function RangeCalendar({ booked, value, onChange, months = 2, maxNights = 30 }: Props) {
  const { t, locale } = useI18n();
  const now = today();
  const firstMonth = monthStart(now);
  const [view, setView] = useState<Date>(() => monthStart(value.from ?? now));
  const [hover, setHover] = useState<ISODate | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);

  const { from, to } = value;
  const selectingOut = Boolean(from && !to);

  /** The latest possible check-out for the chosen check-in: the next booked night or the stay limit. */
  const maxOut = useMemo(() => {
    if (!from) return null;
    const limit = addDays(from, maxNights);
    const next = booked
      .filter((r) => r.from > from)
      .map((r) => r.from)
      .sort()[0];
    return next && next < limit ? next : limit;
  }, [booked, from, maxNights]);

  const canGoBack = view > firstMonth;
  const lastMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + MAX_MONTHS_AHEAD - months + 1, 1);
  const canGoForward = view < lastMonth;

  const shift = (n: 1 | -1) => {
    setDir(n);
    setView((v) => new Date(v.getFullYear(), v.getMonth() + n, 1));
  };

  const pick = (d: ISODate) => {
    const nightFree = d >= now && !isNightBooked(d, booked);
    if (selectingOut && from && maxOut) {
      if (d > from && d <= maxOut) return onChange({ from, to: d });
      if (nightFree) return onChange({ from: d });
      return;
    }
    if (nightFree) onChange({ from: d });
  };

  const previewTo = selectingOut && hover && from && maxOut && hover > from && hover <= maxOut ? hover : null;
  const rangeEnd = to ?? previewTo;

  const fmt = new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const renderMonth = (start: Date) => {
    const y = start.getFullYear();
    const m = start.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const lead = (new Date(y, m, 1).getDay() + 6) % 7;
    const cells: (ISODate | null)[] = [
      ...Array<null>(lead).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => toISO(new Date(y, m, i + 1))),
    ];

    return (
      <div className={styles.month} key={`${y}-${m}`}>
        <p className={styles.monthTitle}>
          {t.months[m]} <span>{y}</span>
        </p>
        <div className={styles.grid} role="grid">
          {t.weekdays.map((w) => (
            <span key={w} className={styles.weekday} aria-hidden="true">
              {w}
            </span>
          ))}
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />;
            const past = d < now;
            const bookedNight = isNightBooked(d, booked);
            const inOutWindow = selectingOut && from && maxOut ? d > from && d <= maxOut : false;
            const disabled = past || (selectingOut ? !inOutWindow && bookedNight : bookedNight);
            const isStart = d === from;
            const isEnd = d === rangeEnd;
            const inRange = Boolean(from && rangeEnd && d > from && d < rangeEnd);
            const outOfWindow = selectingOut && from && maxOut && d > maxOut && !past;

            const status = bookedNight && !inOutWindow ? ` — ${t.booking.legend.booked}` : "";
            return (
              <button
                key={d}
                type="button"
                className={styles.day}
                data-past={past || undefined}
                data-booked={(bookedNight && !past && !inOutWindow) || undefined}
                data-dim={outOfWindow || undefined}
                data-start={isStart || undefined}
                data-end={isEnd || undefined}
                data-range={inRange || undefined}
                data-preview={(!to && (inRange || isEnd)) || undefined}
                data-today={d === now || undefined}
                disabled={disabled}
                aria-pressed={isStart || isEnd}
                aria-label={`${fmt.format(fromISO(d))}${status}`}
                onClick={() => pick(d)}
                onMouseEnter={() => setHover(d)}
                onFocus={() => setHover(d)}
              >
                <span>{fromISO(d).getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const visible = Array.from({ length: months }, (_, i) => new Date(view.getFullYear(), view.getMonth() + i, 1));

  return (
    <div className={styles.calendar} onMouseLeave={() => setHover(null)}>
      <div className={styles.head}>
        <p className={styles.hint} aria-live="polite">
          {selectingOut ? t.booking.selectCheckOut : t.booking.selectCheckIn}
        </p>
        <div className={styles.navs}>
          <button type="button" className={styles.nav} onClick={() => shift(-1)} disabled={!canGoBack} aria-label={t.booking.prev}>
            <Chevron dir="left" />
          </button>
          <button type="button" className={styles.nav} onClick={() => shift(1)} disabled={!canGoForward} aria-label={t.booking.next}>
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      <div className={styles.months} data-count={months} key={view.toISOString()} data-dir={dir}>
        {visible.map(renderMonth)}
      </div>

      <div className={styles.foot}>
        <span className={styles.legend}>
          <i className={styles.legendBooked} /> {t.booking.legend.booked}
        </span>
        <span className={styles.legend}>
          <i className={styles.legendSelected} /> {t.booking.legend.selected}
        </span>
        {(from || to) && (
          <button type="button" className={styles.clear} onClick={() => onChange({})}>
            {t.booking.clear}
          </button>
        )}
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
