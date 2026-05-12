export interface ILectureDashboardSummary {
    totalSessions: number;
    totalAttendance: number;
    pendingSubmissions: number;
    byStatus: Partial<Record<string, number>>;
    percentages: {
        present: number;
        late: number;
        absent: number;
        earlyCheckout: number;
        missedCheckout: number;
        excused: number;
    };
}

export interface IAttendanceTimelinePoint {
    _id: { date: string; status: string };
    count: number;
}

export interface IFacultyBreakdownPoint {
    _id: { facultyId: string; status: string };
    count: number;
}

export interface IInstructorPerformance {
    instructorId: string;
    byStatus: Record<string, number>;
}

export interface ILectureReportFilter {
    from?: string;
    to?: string;
    facultyId?: string;
    departmentId?: string;
    classId?: string;
    instructorId?: string;
}
