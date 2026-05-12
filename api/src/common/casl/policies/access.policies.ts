import { Action } from '../constants/action.enum';
import { Subject } from '../constants/subjects';
import { createPolicyHandler } from './base.policy';

export const ManageAllPolicy = createPolicyHandler(Action.Manage, Subject.All);

export const ReadDashboardPolicy = createPolicyHandler(
  Action.Read,
  Subject.Dashboard,
);
export const ReadReportPolicy = createPolicyHandler(
  Action.Read,
  Subject.Report,
);

export const CreateAcademicYearPolicy = createPolicyHandler(
  Action.Create,
  Subject.AcademicYear,
);
export const ReadAcademicYearPolicy = createPolicyHandler(
  Action.Read,
  Subject.AcademicYear,
);
export const UpdateAcademicYearPolicy = createPolicyHandler(
  Action.Update,
  Subject.AcademicYear,
);
export const DeleteAcademicYearPolicy = createPolicyHandler(
  Action.Delete,
  Subject.AcademicYear,
);

export const CreateCampusPolicy = createPolicyHandler(
  Action.Create,
  Subject.Campus,
);
export const ReadCampusPolicy = createPolicyHandler(
  Action.Read,
  Subject.Campus,
);
export const UpdateCampusPolicy = createPolicyHandler(
  Action.Update,
  Subject.Campus,
);
export const DeleteCampusPolicy = createPolicyHandler(
  Action.Delete,
  Subject.Campus,
);

export const CreateHallPolicy = createPolicyHandler(
  Action.Create,
  Subject.Hall,
);
export const ReadHallPolicy = createPolicyHandler(Action.Read, Subject.Hall);
export const UpdateHallPolicy = createPolicyHandler(
  Action.Update,
  Subject.Hall,
);
export const DeleteHallPolicy = createPolicyHandler(
  Action.Delete,
  Subject.Hall,
);

export const CreateFacultyPolicy = createPolicyHandler(
  Action.Create,
  Subject.Faculty,
);
export const ReadFacultyPolicy = createPolicyHandler(
  Action.Read,
  Subject.Faculty,
);
export const UpdateFacultyPolicy = createPolicyHandler(
  Action.Update,
  Subject.Faculty,
);
export const DeleteFacultyPolicy = createPolicyHandler(
  Action.Delete,
  Subject.Faculty,
);

export const CreateDepartmentPolicy = createPolicyHandler(
  Action.Create,
  Subject.Department,
);
export const ReadDepartmentPolicy = createPolicyHandler(
  Action.Read,
  Subject.Department,
);
export const UpdateDepartmentPolicy = createPolicyHandler(
  Action.Update,
  Subject.Department,
);
export const DeleteDepartmentPolicy = createPolicyHandler(
  Action.Delete,
  Subject.Department,
);

export const CreateSemesterPolicy = createPolicyHandler(
  Action.Create,
  Subject.Semester,
);
export const ReadSemesterPolicy = createPolicyHandler(
  Action.Read,
  Subject.Semester,
);
export const UpdateSemesterPolicy = createPolicyHandler(
  Action.Update,
  Subject.Semester,
);
export const DeleteSemesterPolicy = createPolicyHandler(
  Action.Delete,
  Subject.Semester,
);

export const CreateLectureClassPolicy = createPolicyHandler(
  Action.Create,
  Subject.LectureClass,
);
export const ReadLectureClassPolicy = createPolicyHandler(
  Action.Read,
  Subject.LectureClass,
);
export const UpdateLectureClassPolicy = createPolicyHandler(
  Action.Update,
  Subject.LectureClass,
);
export const DeleteLectureClassPolicy = createPolicyHandler(
  Action.Delete,
  Subject.LectureClass,
);

export const CreateCoursePolicy = createPolicyHandler(
  Action.Create,
  Subject.Course,
);
export const ReadCoursePolicy = createPolicyHandler(
  Action.Read,
  Subject.Course,
);
export const UpdateCoursePolicy = createPolicyHandler(
  Action.Update,
  Subject.Course,
);
export const DeleteCoursePolicy = createPolicyHandler(
  Action.Delete,
  Subject.Course,
);

export const CreatePeriodPolicy = createPolicyHandler(
  Action.Create,
  Subject.Period,
);
export const ReadPeriodPolicy = createPolicyHandler(
  Action.Read,
  Subject.Period,
);
export const UpdatePeriodPolicy = createPolicyHandler(
  Action.Update,
  Subject.Period,
);
export const DeletePeriodPolicy = createPolicyHandler(
  Action.Delete,
  Subject.Period,
);

export const CreateClassSessionPolicy = createPolicyHandler(
  Action.Create,
  Subject.ClassSession,
);
export const ReadClassSessionPolicy = createPolicyHandler(
  Action.Read,
  Subject.ClassSession,
);
export const UpdateClassSessionPolicy = createPolicyHandler(
  Action.Update,
  Subject.ClassSession,
);
export const DeleteClassSessionPolicy = createPolicyHandler(
  Action.Delete,
  Subject.ClassSession,
);

export const CreateUserPolicy = createPolicyHandler(
  Action.Create,
  Subject.User,
);
export const ReadUserPolicy = createPolicyHandler(Action.Read, Subject.User);
export const UpdateUserPolicy = createPolicyHandler(
  Action.Update,
  Subject.User,
);
export const DeleteUserPolicy = createPolicyHandler(
  Action.Delete,
  Subject.User,
);

export const ReadRolePolicy = createPolicyHandler(Action.Read, Subject.Role);

export const CreateRolePolicy = createPolicyHandler(
  Action.Create,
  Subject.Role,
);
export const UpdateRolePolicy = createPolicyHandler(
  Action.Update,
  Subject.Role,
);
export const DeleteRolePolicy = createPolicyHandler(
  Action.Delete,
  Subject.Role,
);

export const ManageSettingsPolicy = createPolicyHandler(
  Action.Manage,
  Subject.Settings,
);

// Attendance Record
export const CreateAttendanceRecordPolicy = createPolicyHandler(
  Action.Create,
  Subject.AttendanceRecord,
);
export const ReadAttendanceRecordPolicy = createPolicyHandler(
  Action.Read,
  Subject.AttendanceRecord,
);
export const UpdateAttendanceRecordPolicy = createPolicyHandler(
  Action.Update,
  Subject.AttendanceRecord,
);

// Bound Device
export const CreateBoundDevicePolicy = createPolicyHandler(
  Action.Create,
  Subject.BoundDevice,
);
export const ReadBoundDevicePolicy = createPolicyHandler(
  Action.Read,
  Subject.BoundDevice,
);
export const DeleteBoundDevicePolicy = createPolicyHandler(
  Action.Delete,
  Subject.BoundDevice,
);

// Attendance Settings
export const ReadAttendanceSettingsPolicy = createPolicyHandler(
  Action.Read,
  Subject.AttendanceSettings,
);
export const ManageAttendanceSettingsPolicy = createPolicyHandler(
  Action.Manage,
  Subject.AttendanceSettings,
);

// Absence / Late / Early Leave Submission
export const CreateAbsenceSubmissionPolicy = createPolicyHandler(
  Action.Create,
  Subject.AbsenceSubmission,
);
export const ReadAbsenceSubmissionPolicy = createPolicyHandler(
  Action.Read,
  Subject.AbsenceSubmission,
);
export const UpdateAbsenceSubmissionPolicy = createPolicyHandler(
  Action.Update,
  Subject.AbsenceSubmission,
);

// Audit Log
export const ReadAuditLogPolicy = createPolicyHandler(
  Action.Read,
  Subject.AuditLog,
);
