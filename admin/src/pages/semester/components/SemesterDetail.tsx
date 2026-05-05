import React from 'react';
import { useGetSemesterByIdQuery } from '../../../store/api/semesterApi';
import moment from 'moment';

interface Props {
    semesterId: string | null;
}

const SemesterDetail: React.FC<Props> = ({ semesterId }) => {
    const id = semesterId ? String(semesterId) : '';
    const { data: row, isLoading } = useGetSemesterByIdQuery(id, { skip: !id });

    if (isLoading) return <p className="text-gray-500">Loading...</p>;
    if (!row) return <p className="text-gray-500">None selected</p>;

    const ay =
        typeof row.academicYearId === 'object' && row.academicYearId && 'name' in row.academicYearId
            ? (row.academicYearId as { name: string }).name
            : String(row.academicYearId);

    return (
        <div className="space-y-2 text-sm">
            <h4 className="font-semibold">{row.name}</h4>
            <p>Academic year: {ay}</p>
            <p>
                {row.startDate ? moment(row.startDate).format('L') : '-'} – {row.endDate ? moment(row.endDate).format('L') : '-'}
            </p>
            <p>Status: {row.status}</p>
        </div>
    );
};

export default SemesterDetail;
