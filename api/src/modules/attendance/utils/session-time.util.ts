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

/** 
 * Returns a UTC Date at `date`'s calendar day + HH:mm, 
 * treating the HH:mm as being in the provided `timezone`.
 * 
 * Uses Intl.DateTimeFormat to find the correct UTC offset for the target
 * timezone at that specific calendar day.
 */
export function combineDateAndTimeWithTz(date: Date, hhmm: string, timezone: string): Date {
  const [h, m] = parseHHmmStrict(hhmm, 'time');
  
  // 1. Create a "dummy" UTC date that has the correct clock numbers 
  // (e.g. 08:00 clock time => 08:00 UTC)
  const dummy = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    h,
    m,
    0,
    0
  ));

  // 2. Determine how many milliseconds that specific clock time in the 
  // target timezone is ahead of/behind UTC.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(dummy);
  
  const map: Record<string, string> = {};
  parts.forEach(p => map[p.type] = p.value);
  
  const tzDate = new Date(Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) === 24 ? 0 : Number(map.hour),
    Number(map.minute),
    Number(map.second)
  ));
  
  const offsetMs = tzDate.getTime() - dummy.getTime();
  
  // 3. Subtract the offset to get the real UTC moment
  return new Date(dummy.getTime() - offsetMs);
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
