import React from 'react';
import { useGetFacultyByIdQuery } from '../../../store/api/facultyApi';

interface Props {
    facultyId: string | null;
}

const FacultyDetail: React.FC<Props> = ({ facultyId }) => {
    const id = facultyId ? String(facultyId) : '';
    const { data: row, isLoading } = useGetFacultyByIdQuery(id, { skip: !id });

    if (isLoading) return <p className="text-gray-500">Loading...</p>;
    if (!row) return <p className="text-gray-500">None selected</p>;

    const campus =
        typeof row.campusId === 'object' && row.campusId && 'campusName' in row.campusId ? (row.campusId as { campusName: string }).campusName : String(row.campusId);

    return (
        <div className="space-y-2 text-sm">
            <h4 className="font-semibold">{row.name}</h4>
            <p className="text-gray-600">Campus: {campus}</p>
            {row.code && <p>Code: {row.code}</p>}
            {row.description && <p className="text-gray-600">{row.description}</p>}
            <p>Status: {row.status}</p>
        </div>
    );
};

export default FacultyDetail;
