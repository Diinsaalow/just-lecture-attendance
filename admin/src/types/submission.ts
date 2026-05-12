import type { IUser } from './auth';
import type { IClassSession } from './classSession';

export type SubmissionType = 'ABSENCE' | 'LATE_ARRIVAL' | 'EARLY_LEAVE';

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXCUSED';

export interface ISubmissionDecisionEntry {
    status: SubmissionStatus;
    actorId: string | IUser;
    at: string;
    note?: string;
}

export interface IAbsenceSubmission {
    _id: string;
    instructorUserId: string | IUser;
    sessionId: string | IClassSession;
    facultyId: string;
    type: SubmissionType;
    reason: string;
    description?: string;
    status: SubmissionStatus;
    reviewerId?: string | IUser | null;
    reviewedAt?: string | null;
    reviewNote?: string;
    decisionHistory: ISubmissionDecisionEntry[];
    createdAt: string;
    updatedAt: string;
}

export interface ICreateSubmissionDto {
    sessionId: string;
    type: SubmissionType;
    reason: string;
    description?: string;
}

export interface IReviewSubmissionDto {
    note?: string;
}
