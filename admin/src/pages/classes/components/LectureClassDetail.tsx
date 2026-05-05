import React from 'react';
import moment from 'moment';
import { useGetLectureClassByIdQuery } from '../../../store/api/lectureClassApi';

interface Props {
    classId: string | null;
}

const LectureClassDetail: React.FC<Props> = ({ classId }) => {
    const id = classId ? String(classId) : '';
    const { data: row, isLoading } = useGetLectureClassByIdQuery(id, { skip: !id });

    if (isLoading) return <p className="text-gray-500">Loading...</p>;
    if (!row) return <p className="text-gray-500">None selected</p>;

    const dep = typeof row.departmentId === 'object' && row.departmentId && 'name' in row.departmentId ? (row.departmentId as { name: string }).name : '-';
    const camp = typeof row.campusId === 'object' && row.campusId && 'campusName' in row.campusId ? (row.campusId as { campusName: string }).campusName : '-';
    const ay = typeof row.academicYearId === 'object' && row.academicYearId && 'name' in row.academicYearId ? (row.academicYearId as { name: string }).name : '-';

    return (
        <div className="space-y-2 text-sm">
            <h4 className="font-semibold">{row.name}</h4>
            <p>Department: {dep}</p>
            <p>Campus: {camp}</p>
            <p>Academic year: {ay}</p>
            <p>
                Mode: {row.mode} · Shift: {row.shift}
            </p>
            <p>Size: {row.size}</p>
            <p>Batch: {row.batchId}</p>
            <p>Status: {row.status}</p>
            {row.createdAt && <p className="text-gray-500">Created {moment(row.createdAt).format('LL')}</p>}
        </div>
    );
};

export default LectureClassDetail;
