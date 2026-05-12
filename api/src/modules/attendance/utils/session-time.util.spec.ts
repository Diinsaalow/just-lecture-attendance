import {
  combineUtcDateAndTime,
  isSameUtcDay,
  parseHHmmStrict,
  startOfUtcDay,
} from './session-time.util';

describe('session-time util', () => {
  it('parses HH:mm strictly', () => {
    expect(parseHHmmStrict('00:00', 'x')).toEqual([0, 0]);
    expect(parseHHmmStrict('23:59', 'x')).toEqual([23, 59]);
    expect(() => parseHHmmStrict('24:00', 'x')).toThrow();
    expect(() => parseHHmmStrict('9:00', 'x')).toThrow();
    expect(() => parseHHmmStrict('09:60', 'x')).toThrow();
  });

  it('combineUtcDateAndTime yields a UTC date at the calendar day + HH:mm', () => {
    const date = new Date('2026-05-11T00:00:00.000Z');
    const combined = combineUtcDateAndTime(date, '14:30');
    expect(combined.toISOString()).toBe('2026-05-11T14:30:00.000Z');
  });

  it('startOfUtcDay strips time-of-day in UTC', () => {
    const d = new Date('2026-05-11T17:45:23.456Z');
    expect(startOfUtcDay(d).toISOString()).toBe('2026-05-11T00:00:00.000Z');
  });

  it('isSameUtcDay compares UTC calendar days', () => {
    const a = new Date('2026-05-11T00:00:00.000Z');
    const b = new Date('2026-05-11T23:59:59.999Z');
    const c = new Date('2026-05-12T00:00:00.000Z');
    expect(isSameUtcDay(a, b)).toBe(true);
    expect(isSameUtcDay(a, c)).toBe(false);
  });
});
