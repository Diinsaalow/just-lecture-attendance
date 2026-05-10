/** CASL subject strings — keep in sync with admin `lib/casl` and route `resource` fields. */
export const Subject = {
  All: 'all',
  Dashboard: 'Dashboard',
  Report: 'Report',
  AcademicSetup: 'AcademicSetup',
  AcademicYear: 'AcademicYear',
  Campus: 'Campus',
  Hall: 'Hall',
  Faculty: 'Faculty',
  Department: 'Department',
  Semester: 'Semester',
  Period: 'Period',
  ClassSession: 'ClassSession',
  LectureClass: 'LectureClass',
  Course: 'Course',
  User: 'User',
  Role: 'Role',
  Settings: 'Settings',
  AttendanceRecord: 'AttendanceRecord',
  AbsenceSubmission: 'AbsenceSubmission',
  BoundDevice: 'BoundDevice',
  AttendanceSettings: 'AttendanceSettings',
} as const;

export type SubjectType = (typeof Subject)[keyof typeof Subject];
