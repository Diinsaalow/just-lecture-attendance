import { BadRequestException } from '@nestjs/common';
import { parseHHmm, timeWindowsOverlap } from './period-time.util';

describe('period-time util', () => {
  it('parseHHmm rejects invalid input', () => {
    expect(() => parseHHmm('bad', 'from')).toThrow(BadRequestException);
    expect(() => parseHHmm('24:00', 'from')).toThrow(BadRequestException);
  });

  it('parseHHmm returns minutes-of-day', () => {
    expect(parseHHmm('00:00', 'x')).toBe(0);
    expect(parseHHmm('09:30', 'x')).toBe(570);
    expect(parseHHmm('23:59', 'x')).toBe(23 * 60 + 59);
  });

  it('timeWindowsOverlap respects half-open semantics', () => {
    /** [09:00, 10:00) and [10:00, 11:00) touch but do not overlap. */
    expect(timeWindowsOverlap(540, 600, 600, 660)).toBe(false);
    /** [09:00, 10:00) and [09:30, 10:30) overlap. */
    expect(timeWindowsOverlap(540, 600, 570, 630)).toBe(true);
    /** Fully disjoint. */
    expect(timeWindowsOverlap(540, 600, 700, 760)).toBe(false);
  });
});
