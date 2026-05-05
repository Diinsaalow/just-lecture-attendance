import React from 'react';
import { useGetDepartmentByIdQuery } from '../../../store/api/departmentApi';

interface Props {
    departmentId: string | null;
}

const DepartmentDetail: React.FC<Props> = ({ departmentId }) => {
    const id = departmentId ? String(departmentId) : '';
    const { data: row, isLoading } = useGetDepartmentByIdQuery(id, { skip: !id });

    if (isLoading) return <p className="text-gray-500">Loading...</p>;
    if (!row) return <p className="text-gray-500">None selected</p>;

    const fac =
        typeof row.facultyId === 'object' && row.facultyId && 'name' in row.facultyId ? (row.facultyId as { name: string }).name : String(row.facultyId);

    return (
        <div className="space-y-2 text-sm">
            <h4 className="font-semibold">{row.name}</h4>
            <p>Faculty: {fac}</p>
            <p>Graduation: {row.graduationName}</p>
            <p>Duration: {row.duration}</p>
            <p>Abbrev: {row.abbreviation}</p>
            <p>Degree: {row.degree}</p>
            <p>Status: {row.status}</p>
        </div>
    );
};

export default DepartmentDetail;
