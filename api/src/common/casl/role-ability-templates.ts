import { Action } from './constants/action.enum';
import { Subject } from './constants/subjects';
import type { AbilityRule } from './types/ability.types';

/** Known built-in role keys (names stored lowercase in DB). */
export type NormalizedRole = 'super-admin' | 'faculty-admin' | 'instructor';

export function normalizeRoleName(name: string): NormalizedRole | string {
  return name.trim().toLowerCase();
}

export function defaultAbilitiesForRole(normalizedName: string): AbilityRule[] {
  switch (normalizedName as NormalizedRole) {
    case 'super-admin':
      return [{ action: Action.Manage, subject: Subject.All }];
    case 'faculty-admin':
      return FACULTY_ADMIN_RULES;
    case 'instructor':
      return INSTRUCTOR_RULES;
    default:
      return [];
  }
}

const FACULTY_ADMIN_RULES: AbilityRule[] = [
  { action: Action.Read, subject: Subject.Dashboard },
  { action: Action.Read, subject: Subject.Report },
  /** Sidebar / UI grouping — backend routes still check granular subjects below. */
  { action: Action.Manage, subject: Subject.AcademicSetup },
  { action: Action.Manage, subject: Subject.AcademicYear },
  { action: Action.Read, subject: Subject.Campus },
  { action: Action.Manage, subject: Subject.Hall },
  { action: Action.Read, subject: Subject.Faculty },
  { action: Action.Update, subject: Subject.Faculty },
  { action: Action.Manage, subject: Subject.Department },
  { action: Action.Manage, subject: Subject.Semester },
  { action: Action.Manage, subject: Subject.LectureClass },
  { action: Action.Manage, subject: Subject.Course },
  { action: Action.Manage, subject: Subject.Period },
  { action: Action.Manage, subject: Subject.ClassSession },
  { action: Action.Read, subject: Subject.User },
  { action: Action.Create, subject: Subject.User },
  { action: Action.Update, subject: Subject.User },
  { action: Action.Read, subject: Subject.Role },
  { action: Action.Read, subject: Subject.Settings },
  { action: Action.Read, subject: Subject.AttendanceRecord },
  { action: Action.Update, subject: Subject.AttendanceRecord },
  { action: Action.Manage, subject: Subject.AttendanceSettings },
  { action: Action.Read, subject: Subject.BoundDevice },
  { action: Action.Delete, subject: Subject.BoundDevice },
];

const INSTRUCTOR_RULES: AbilityRule[] = [
  { action: Action.Read, subject: Subject.Dashboard },
  { action: Action.Read, subject: Subject.Report },
  { action: Action.Read, subject: Subject.AcademicSetup },
  { action: Action.Read, subject: Subject.AcademicYear },
  { action: Action.Read, subject: Subject.Campus },
  { action: Action.Read, subject: Subject.Hall },
  { action: Action.Read, subject: Subject.Faculty },
  { action: Action.Read, subject: Subject.Department },
  { action: Action.Read, subject: Subject.Semester },
  { action: Action.Read, subject: Subject.LectureClass },
  { action: Action.Read, subject: Subject.Course },
  { action: Action.Read, subject: Subject.Period },
  { action: Action.Update, subject: Subject.Period },
  { action: Action.Read, subject: Subject.ClassSession },
  { action: Action.Update, subject: Subject.ClassSession },
  { action: Action.Create, subject: Subject.AttendanceRecord },
  { action: Action.Read, subject: Subject.AttendanceRecord },
  { action: Action.Create, subject: Subject.BoundDevice },
  { action: Action.Read, subject: Subject.BoundDevice },
];
