import { Action } from './constants/action.enum';
import { Subject } from './constants/subjects';
import type { AbilityRule } from './types/ability.types';

/** Normalized role keys after legacy alias mapping (see `normalizeRoleName`). */
export type NormalizedRole =
  | 'super-admin'
  | 'faculty-admin'
  | 'instructor';

export function normalizeRoleName(name: string): NormalizedRole | string {
  const n = name.trim().toLowerCase();
  if (n === 'admin') return 'super-admin';
  if (n === 'lecture') return 'instructor';
  return n;
}

export function defaultAbilitiesForRole(
  normalizedName: string,
): AbilityRule[] {
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
  { action: Action.Read, subject: Subject.Faculty },
  { action: Action.Update, subject: Subject.Faculty },
  { action: Action.Manage, subject: Subject.Department },
  { action: Action.Manage, subject: Subject.Semester },
  { action: Action.Manage, subject: Subject.LectureClass },
  { action: Action.Manage, subject: Subject.Course },
  { action: Action.Manage, subject: Subject.Period },
  { action: Action.Read, subject: Subject.User },
  { action: Action.Create, subject: Subject.User },
  { action: Action.Update, subject: Subject.User },
  { action: Action.Read, subject: Subject.Role },
  { action: Action.Read, subject: Subject.Settings },
];

const INSTRUCTOR_RULES: AbilityRule[] = [
  { action: Action.Read, subject: Subject.Dashboard },
  { action: Action.Read, subject: Subject.Report },
  { action: Action.Read, subject: Subject.AcademicSetup },
  { action: Action.Read, subject: Subject.AcademicYear },
  { action: Action.Read, subject: Subject.Campus },
  { action: Action.Read, subject: Subject.Faculty },
  { action: Action.Read, subject: Subject.Department },
  { action: Action.Read, subject: Subject.Semester },
  { action: Action.Read, subject: Subject.LectureClass },
  { action: Action.Read, subject: Subject.Course },
  { action: Action.Read, subject: Subject.Period },
  { action: Action.Update, subject: Subject.Period },
];
