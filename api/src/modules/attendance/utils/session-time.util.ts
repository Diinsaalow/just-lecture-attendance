/**
 * Time utilities for combining a `scheduledDate` (stored as UTC midnight)
 * with a `HH:mm` string time into a fully-qualified UTC `Date`.
 *
 * All comparisons in the attendance engine use these helpers so check-in
 * windows behave consistently across deployment timezones.
 */

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseHHmmStrict(value: string, field: string): [number, number] {
  const m = TIME_RE.exec(value);
  if (!m) {
    throw new Error(`${field} must be HH:mm format`);
  }
  return [Number(m[1]), Number(m[2])];
}

/** Returns a UTC Date at `date`'s calendar day + HH:mm. */
export function combineUtcDateAndTime(date: Date, hhmm: string): Date {
  const [h, m] = parseHHmmStrict(hhmm, 'time');
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      h,
      m,
      0,
      0,
    ),
  );
}

/** UTC midnight of the given date. */
export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** True iff the two dates fall on the same UTC calendar day. */
export function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
