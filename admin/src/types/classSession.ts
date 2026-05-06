import type { TimetablePeriodType } from './period';

export type ClassSessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface IClassSession {
    _id: string;
    periodId: string | { _id: string };
    scheduledDate: string;
    semesterId: string | { _id: string; name?: string };
    classId: string | { _id: string; name?: string };
    courseId: string | { _id: string; name?: string };
    lecturerId: string | { _id: string; username?: string; firstName?: string; lastName?: string };
    hallId?: string | { _id: string; name?: string; code?: string };
    dayLabel: string;
    fromTime: string;
    toTime: string;
    type: TimetablePeriodType;
    status: ClassSessionStatus;
    createdAt?: string;
    updatedAt?: string;
}
