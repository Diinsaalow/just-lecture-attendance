export enum AttendanceStatus {
  CHECKED_IN = 'CHECKED_IN',
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  EARLY_CHECKOUT = 'EARLY_CHECKOUT',
  MISSED_CHECKOUT = 'MISSED_CHECKOUT',
  ABSENT = 'ABSENT',
  EXCUSED = 'EXCUSED',
  INVALID_ATTEMPT = 'INVALID_ATTEMPT',
  REJECTED = 'REJECTED',
}

/** Flags stored alongside `status` for richer reporting. */
export const StatusFlag = {
  LATE: 'LATE',
  EARLY_CHECKOUT: 'EARLY_CHECKOUT',
  LATE_EXCUSED: 'LATE_EXCUSED',
  EARLY_EXCUSED: 'EARLY_EXCUSED',
  ADMIN_CHECKOUT: 'ADMIN_CHECKOUT',
  AUTO_ABSENT: 'AUTO_ABSENT',
  AUTO_MISSED_CHECKOUT: 'AUTO_MISSED_CHECKOUT',
} as const;
export type StatusFlagValue = (typeof StatusFlag)[keyof typeof StatusFlag];
