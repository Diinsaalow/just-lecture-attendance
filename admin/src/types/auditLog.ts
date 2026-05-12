import type { IUser } from './auth';

export type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'CHECK_IN'
    | 'CHECK_OUT'
    | 'ADMIN_CHECK_OUT'
    | 'SUBMISSION_APPROVE'
    | 'SUBMISSION_REJECT'
    | 'DEVICE_REGISTER'
    | 'DEVICE_CLEAR'
    | 'AUTO_ABSENT'
    | 'AUTO_MISSED_CHECKOUT';

export type AuditEntity =
    | 'USER'
    | 'PERIOD'
    | 'CLASS_SESSION'
    | 'ATTENDANCE_RECORD'
    | 'ABSENCE_SUBMISSION'
    | 'DEVICE';

export interface IAuditLog {
    _id: string;
    actorId: string | IUser | null;
    actorRole: string | null;
    action: AuditAction;
    entityType: AuditEntity;
    entityId: string | null;
    facultyId: string | null;
    before?: unknown;
    after?: unknown;
    metadata?: unknown;
    createdAt: string;
}
