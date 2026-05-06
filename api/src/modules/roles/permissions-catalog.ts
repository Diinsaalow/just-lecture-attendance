import { Action } from '../../common/casl/constants/action.enum';
import { Subject } from '../../common/casl/constants/subjects';

/** Flat list for GET /roles/permissions — drives admin permission matrix. */
export type PermissionCatalogEntry = {
  action: string | string[];
  subject: string;
};

const SUBJECTS_FOR_MATRIX: string[] = [
  Subject.Dashboard,
  Subject.Report,
  Subject.AcademicSetup,
  Subject.AcademicYear,
  Subject.Campus,
  Subject.Hall,
  Subject.Faculty,
  Subject.Department,
  Subject.Semester,
  Subject.Period,
  Subject.ClassSession,
  Subject.LectureClass,
  Subject.Course,
  Subject.User,
  Subject.Role,
  Subject.Settings,
  Subject.AttendanceRecord,
  Subject.AbsenceSubmission,
];

const CRUD_MANAGE: Action[] = [
  Action.Create,
  Action.Read,
  Action.Update,
  Action.Delete,
  Action.Manage,
];

export function buildPermissionsCatalog(): PermissionCatalogEntry[] {
  const out: PermissionCatalogEntry[] = [];

  out.push({ action: Action.Manage, subject: Subject.All });

  for (const subject of SUBJECTS_FOR_MATRIX) {
    if (subject === Subject.All) continue;
    for (const action of CRUD_MANAGE) {
      out.push({ action, subject });
    }
  }

  return out;
}
