import React from 'react';
import moment from 'moment';
import { useGetPeriodByIdQuery } from '../../../store/api/periodApi';
import type { IPeriod } from '../../../types/period';

function labelRef(ref: unknown, key: string): string {
    if (typeof ref === 'object' && ref !== null && key in ref) return String((ref as Record<string, unknown>)[key]);
    return '-';
}

function hallLine(hall: IPeriod['hallId']): string {
    if (!hall) return '—';
    if (typeof hall === 'string') return hall;
    const name = hall.name ?? '';
    const code = hall.code ? ` (${hall.code})` : '';
    return name || code ? `${name}${code}` : '—';
}

interface Props {
    periodId: string | null;
}

const PeriodDetail: React.FC<Props> = ({ periodId }) => {
    const id = periodId ? String(periodId) : '';
    const { data: row, isLoading } = useGetPeriodByIdQuery(id, { skip: !id });

    if (isLoading) return <p className="text-gray-500">Loading...</p>;
    if (!row) return <p className="text-gray-500">None selected</p>;

    return (
        <div className="space-y-2 text-sm">
            <p>Class: {labelRef(row.classId, 'name')}</p>
            <p>Course: {labelRef(row.courseId, 'name')}</p>
            <p>Lecturer: {labelRef(row.lecturerId, 'username')}</p>
            <p>Semester: {labelRef(row.semesterId, 'name')}</p>
            <p>
                {row.day} · {row.type} · {moment(row.from, 'HH:mm').format('hh:mm A')}–{moment(row.to, 'HH:mm').format('hh:mm A')}
            </p>
            <p>Hall: {hallLine(row.hallId)}</p>
            <p>Status: {row.status}</p>
        </div>
    );
};

export default PeriodDetail;
