/** Map weekday name (any casing) to JavaScript `Date#getUTCDay()` (Sun=0 … Sat=6). */
export function utcDayIndexFromWeekdayName(day: string): number | null {
  const key = day.trim().toLowerCase();
  const map: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return map[key] ?? null;
}

export function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

/** Every calendar day from `start` through `end` inclusive, as UTC midnight dates. */
export function eachUtcCalendarDayInclusive(start: Date, end: Date): Date[] {
  const s = startOfUtcDay(start);
  const e = startOfUtcDay(end);
  const out: Date[] = [];
  for (let t = s.getTime(); t <= e.getTime(); t += 86400000) {
    out.push(new Date(t));
  }
  return out;
}
