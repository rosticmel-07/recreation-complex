"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n, formatPrice } from "@/i18n/client";
import { houseBySlug, type HouseSlug } from "@/data/houses";
import { isNightBooked, isValidISO, nightsBetween, overlaps, priceFor, today } from "@/lib/dates";
import RangeCalendar, { type DateValue } from "../RangeCalendar";
import { useAvailability } from "../useAvailability";
import { useMedia } from "../useMedia";
import { useDateLabel } from "../SearchBar";
import styles from "./BookingSection.module.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; id: string; from: string; to: string; total: number } | { kind: "error"; message: string };

export default function BookingSection({ slug }: { slug: HouseSlug }) {
  const { t, locale } = useI18n();
  const house = houseBySlug(slug)!;
  const params = useSearchParams();
  const wide = useMedia("(min-width: 768px)");
  const label = useDateLabel();
  const { data, reload } = useAvailability();
  const booked = data?.houses[slug] ?? [];

  const [dates, setDates] = useState<DateValue>(() => {
    const from = params.get("from");
    const to = params.get("to");
    if (!isValidISO(from) || from < today()) return {};
    return isValidISO(to) && to > from ? { from, to } : { from };
  });
  const [guests, setGuests] = useState(() => {
    const g = Number(params.get("guests"));
    return Number.isInteger(g) && g >= 1 ? Math.min(g, house.guests) : Math.min(2, house.guests);
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // If availability arrives and the preselected dates are already taken, drop them.
  const conflict =
    dates.from &&
    data &&
    (dates.to ? booked.some((r) => overlaps(r, { from: dates.from!, to: dates.to! })) : isNightBooked(dates.from, booked));
  const value: DateValue = conflict ? {} : dates;

  const nights = value.from && value.to ? nightsBetween(value.from, value.to) : 0;
  const total = nights ? priceFor(value.from!, value.to!, house.priceWeekday, house.priceWeekend) : 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!nights) errs.dates = t.booking.errors.dates;
    if (!name.trim()) errs.name = t.booking.errors.name;
    if (phone.replace(/\D/g, "").length < 9) errs.phone = t.booking.errors.phone;
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`field-${Object.keys(errs)[0]}`)?.focus();
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ house: slug, from: value.from, to: value.to, guests, name, phone, comment, locale }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus({ kind: "done", id: json.id, from: value.from!, to: value.to!, total });
        reload();
        document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (json.error === "taken") {
        setDates({});
        reload();
        setStatus({ kind: "error", message: t.booking.errors.taken });
      } else {
        setStatus({ kind: "error", message: t.booking.errors.server });
      }
    } catch {
      setStatus({ kind: "error", message: t.booking.errors.server });
    }
  };

  const reset = () => {
    setDates({});
    setComment("");
    setStatus({ kind: "idle" });
  };

  return (
    <section id="booking" className={styles.section} aria-labelledby="booking-title">
      <div className="container">
        <div className={styles.card}>
          <div className={styles.calendarCol}>
            <h2 id="booking-title" className={styles.title}>
              {t.booking.title}
              <span>{house.name[locale]}</span>
            </h2>
            <RangeCalendar
              booked={booked}
              value={value}
              onChange={(v) => {
                setDates(v);
                setErrors((x) => ({ ...x, dates: "" }));
                if (status.kind === "error") setStatus({ kind: "idle" });
              }}
              months={wide ? 2 : 1}
            />
          </div>

          <div className={styles.formCol}>
            {status.kind === "done" ? (
              <div className={styles.success} role="status">
                <svg className={styles.check} viewBox="0 0 52 52" aria-hidden="true">
                  <circle cx="26" cy="26" r="25" fill="none" />
                  <path fill="none" d="M15 27l7 7 15-15" />
                </svg>
                <h3>{t.booking.successTitle}</h3>
                <p>{t.booking.successText}</p>
                <dl className={styles.summary}>
                  <div>
                    <dt>{t.booking.checkIn}</dt>
                    <dd>{label(status.from)}</dd>
                  </div>
                  <div>
                    <dt>{t.booking.checkOut}</dt>
                    <dd>{label(status.to)}</dd>
                  </div>
                  <div>
                    <dt>{t.booking.total}</dt>
                    <dd>
                      {formatPrice(status.total, locale)} {t.currency}
                    </dd>
                  </div>
                </dl>
                <p className={styles.ref}>№ {status.id}</p>
                <button type="button" className="btn" onClick={reset}>
                  {t.booking.another}
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={submit} noValidate>
                <div className={styles.dates} id="field-dates" tabIndex={-1}>
                  <div>
                    <span>{t.booking.checkIn}</span>
                    <strong data-empty={!value.from || undefined}>{value.from ? label(value.from) : "—"}</strong>
                  </div>
                  <div>
                    <span>{t.booking.checkOut}</span>
                    <strong data-empty={!value.to || undefined}>{value.to ? label(value.to) : "—"}</strong>
                  </div>
                </div>
                {errors.dates && <p className={styles.error}>{errors.dates}</p>}

                <div className={styles.price} aria-live="polite">
                  <span>{nights ? t.booking.nights(nights) : value.from ? t.booking.selectCheckOut : t.booking.selectCheckIn}</span>
                  <strong>
                    {nights ? `${formatPrice(total, locale)} ${t.currency}` : `${t.houses.from} ${formatPrice(house.priceWeekday, locale)} ${t.currency}`}
                  </strong>
                </div>

                <div className={styles.row}>
                  <label className={styles.field}>
                    <span>{t.booking.name}</span>
                    <input
                      id="field-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <em>{errors.name}</em>}
                  </label>
                  <label className={styles.field}>
                    <span>{t.booking.phone}</span>
                    <input
                      id="field-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+380"
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && <em>{errors.phone}</em>}
                  </label>
                </div>

                <div className={styles.field}>
                  <span id="guests-l">{t.booking.guests}</span>
                  <div className={styles.guests} role="group" aria-labelledby="guests-l">
                    {Array.from({ length: house.guests }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={guests === n}
                        onClick={() => setGuests(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <label className={styles.field}>
                  <span>{t.booking.comment}</span>
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t.booking.commentHint}
                  />
                </label>

                {status.kind === "error" && (
                  <p className={styles.alert} role="alert">
                    {status.message}
                  </p>
                )}

                <button type="submit" className="btn btn--block" disabled={status.kind === "sending"}>
                  {status.kind === "sending" ? t.booking.sending : t.booking.submit}
                </button>
                <p className={styles.note}>{t.booking.note}</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
