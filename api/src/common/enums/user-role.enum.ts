export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  FACULTY_ADMIN = 'faculty-admin',
  INSTRUCTOR = 'instructor',
  /** @deprecated Prefer SUPER_ADMIN */
  ADMIN = 'admin',
  /** @deprecated Prefer INSTRUCTOR */
  LECTURE = 'lecture',
}
