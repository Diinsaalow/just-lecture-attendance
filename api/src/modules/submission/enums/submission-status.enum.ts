export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  /** Reserved for system-driven excusing (e.g. auto excused after late approval). */
  EXCUSED = 'EXCUSED',
}

export const TERMINAL_SUBMISSION_STATUSES: ReadonlyArray<SubmissionStatus> = [
  SubmissionStatus.APPROVED,
  SubmissionStatus.REJECTED,
  SubmissionStatus.EXCUSED,
];
