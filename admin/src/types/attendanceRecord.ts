/** Populated attendance row from GET /api/v1/attendance (lean + populate). */

export interface IAttendanceRecordNamed {
    _id: string;
    name?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    code?: string;
    registeredDeviceId?: string;
    pendingDeviceId?: string;
}

export interface IAttendanceRecordRow {
    _id: string;
    sessionId: string | { _id: string; scheduledDate?: string; fromTime?: string; toTime?: string; status?: string; type?: string };
    instructorUserId?: string | IAttendanceRecordNamed;
    facultyId?: string | IAttendanceRecordNamed;
    departmentId?: string | IAttendanceRecordNamed;
    classId?: string | IAttendanceRecordNamed;
    courseId?: string | IAttendanceRecordNamed;
    hallId?: string | IAttendanceRecordNamed;
    scheduledDate: string;
    scheduledStart: string;
    scheduledEnd: string;
    checkInAt?: string | null;
    checkOutAt?: string | null;
    checkInMethod?: string;
    checkOutMethod?: string;
    checkInDeviceId?: string;
    checkOutDeviceId?: string;
    status: string;
    statusFlags?: string[];
    actualDurationMinutes?: number | null;
    createdAt?: string;
    updatedAt?: string;
}
