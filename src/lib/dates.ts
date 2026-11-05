/** Dates are handled as "YYYY-MM-DD" strings in local calendar terms. */
export type ISODate = string;

export type Range = { from: ISODate; to: ISODate };

export const toISO = (d: Date): ISODate => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const fromISO = (s: ISODate): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: ISODate, n: number): ISODate => {
  const d = fromISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const today = (): ISODate => toISO(new Date());

export const isValidISO = (s: unknown): s is ISODate =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && toISO(fromISO(s)) === s;

export const nightsBetween = (from: ISODate, to: ISODate) =>
  Math.round((fromISO(to).getTime() - fromISO(from).getTime()) / 86_400_000);

/** A night is booked when from <= night < to (the check-out day stays free). */
export const isNightBooked = (night: ISODate, ranges: Range[]) =>
  ranges.some((r) => r.from <= night && night < r.to);

export const overlaps = (a: Range, b: Range) => a.from < b.to && b.from < a.to;

/** Friday and Saturday nights are priced as weekend nights. */
export const isWeekendNight = (s: ISODate) => {
  const wd = fromISO(s).getDay();
  return wd === 5 || wd === 6;
};

export const priceFor = (from: ISODate, to: ISODate, weekday: number, weekend: number) => {
  let total = 0;
  for (let d = from; d < to; d = addDays(d, 1)) total += isWeekendNight(d) ? weekend : weekday;
  return total;
};
