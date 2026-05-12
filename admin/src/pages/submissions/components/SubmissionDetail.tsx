import React from 'react';
import moment from 'moment';
import { useGetSubmissionByIdQuery } from '../../../store/api/submissionApi';
import type {
    IAbsenceSubmission,
    SubmissionStatus,
} from '../../../types/submission';

const STATUS_BADGE: Record<SubmissionStatus, string> = {
    PENDING: 'badge-outline-warning',
    APPROVED: 'badge-outline-success',
    REJECTED: 'badge-outline-danger',
    EXCUSED: 'badge-outline-info',
};

function userLabel(ref: unknown): string {
    if (!ref || typeof ref !== 'object') return typeof ref === 'string' ? ref : '-';
    const u = ref as { firstName?: string; lastName?: string; username?: string };
    const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return full || u.username || '-';
}

function sessionLine(ref: IAbsenceSubmission['sessionId']): string {
    if (!ref || typeof ref !== 'object') return '-';
    const s = ref as {
        scheduledDate?: string;
        fromTime?: string;
        toTime?: string;
        classId?: { name?: string };
        courseId?: { name?: string };
    };
    const date = s.scheduledDate ? moment(s.scheduledDate).format('ddd MMM DD, YYYY') : '';
    const time = s.fromTime && s.toTime ? `${s.fromTime}–${s.toTime}` : '';
    return [s.classId?.name, s.courseId?.name, date, time].filter(Boolean).join(' · ') || '-';
}

interface Props {
    submissionId: string | null;
}

const SubmissionDetail: React.FC<Props> = ({ submissionId }) => {
    const id = submissionId ?? '';
    const { data, isLoading } = useGetSubmissionByIdQuery(id, { skip: !id });

    if (!id) return <p className="text-gray-500">Select a submission.</p>;
    if (isLoading) return <p className="text-gray-500">Loading…</p>;
    if (!data) return <p className="text-gray-500">Not found.</p>;

    return (
        <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
                <span className={`badge ${STATUS_BADGE[data.status] ?? 'badge-outline-secondary'}`}>
                    {data.status}
                </span>
                <span className="text-gray-500">{data.type}</span>
            </div>

            <div>
                <p className="font-semibold">Instructor</p>
                <p>{userLabel(data.instructorUserId)}</p>
            </div>

            <div>
                <p className="font-semibold">Session</p>
                <p>{sessionLine(data.sessionId)}</p>
            </div>

            <div>
                <p className="font-semibold">Reason</p>
                <p>{data.reason}</p>
            </div>

            {data.description && (
                <div>
                    <p className="font-semibold">Description</p>
                    <p className="whitespace-pre-wrap">{data.description}</p>
                </div>
            )}

            {data.reviewerId && (
                <div>
                    <p className="font-semibold">Reviewed by</p>
                    <p>{userLabel(data.reviewerId)}</p>
                    {data.reviewedAt && (
                        <p className="text-gray-500">
                            {moment(data.reviewedAt).format('MMM DD, YYYY HH:mm')}
                        </p>
                    )}
                    {data.reviewNote && <p>{data.reviewNote}</p>}
                </div>
            )}

            {data.decisionHistory && data.decisionHistory.length > 0 && (
                <div>
                    <p className="font-semibold">History</p>
                    <ul className="space-y-1">
                        {data.decisionHistory.map((entry, idx) => (
                            <li key={idx} className="text-gray-600 dark:text-gray-400">
                                <span
                                    className={`badge ${
                                        STATUS_BADGE[entry.status] ?? 'badge-outline-secondary'
                                    } mr-2`}
                                >
                                    {entry.status}
                                </span>
                                by {userLabel(entry.actorId)} ·{' '}
                                {moment(entry.at).format('MMM DD, YYYY HH:mm')}
                                {entry.note ? ` — ${entry.note}` : ''}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <p className="text-gray-500">
                Submitted {moment(data.createdAt).format('MMM DD, YYYY HH:mm')}
            </p>
        </div>
    );
};

export default SubmissionDetail;
