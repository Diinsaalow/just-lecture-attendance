import React from 'react';
import { useGetPeriodByIdQuery } from '../../../store/api/periodApi';

function labelRef(ref: unknown, key: string): string {
    if (typeof ref === 'object' && ref !== null && key in ref) return String((ref as Record<string, unknown>)[key]);
    return '-';
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
                {row.day} · {row.type} · {row.from}–{row.to}
            </p>
            <p>Status: {row.status}</p>
        </div>
    );
};

export default PeriodDetail;
