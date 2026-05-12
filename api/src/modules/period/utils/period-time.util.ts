import { BadRequestException } from '@nestjs/common';

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Convert an `HH:mm` string into a minutes-of-day integer; throws on malformed input. */
export function parseHHmm(value: string, field: string): number {
  const m = TIME_RE.exec(value);
  if (!m) {
    throw new BadRequestException(`${field} must be in HH:mm 24-hour format`);
  }
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * Returns true iff the half-open intervals [aStart, aEnd) and [bStart, bEnd) overlap.
 * All values are minutes-of-day.
 */
export function timeWindowsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
