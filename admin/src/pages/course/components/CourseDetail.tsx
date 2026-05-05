import React from 'react';
import { useGetCourseByIdQuery } from '../../../store/api/courseApi';
import type { IUser } from '../../../types/auth';

interface Props {
    courseId: string | null;
}

function userLabel(u: string | Pick<IUser, '_id' | 'username' | 'email' | 'firstName' | 'lastName'>): string {
    if (typeof u === 'string') return u;
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return name || u.username || u.email || String(u._id);
}

const CourseDetail: React.FC<Props> = ({ courseId }) => {
    const id = courseId ? String(courseId) : '';
    const { data: row, isLoading } = useGetCourseByIdQuery(id, { skip: !id });

    if (!id) return <p className="text-gray-500">None selected</p>;
    if (isLoading) return <p className="text-gray-500">Loading...</p>;
    if (!row) return <p className="text-gray-500">Not found</p>;

    const dept =
        typeof row.departmentId === 'object' && row.departmentId && 'name' in row.departmentId
            ? (row.departmentId as { name: string }).name
            : String(row.departmentId);

    const lecturers = Array.isArray(row.lecturers) ? row.lecturers : [];

    return (
        <div className="space-y-2 text-sm">
            <h4 className="font-semibold">{row.name}</h4>
            <p>Department: {dept}</p>
            <p>Type: {row.type}</p>
            <p>Credit: {row.credit}</p>
            <p>Status: {row.status}</p>
            <div>
                <p className="font-medium">Lecturers ({lecturers.length})</p>
                {lecturers.length === 0 ? (
                    <p className="text-gray-500">None assigned</p>
                ) : (
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                        {lecturers.map((u, i) => (
                            <li key={typeof u === 'string' ? u : String((u as IUser)._id ?? i)}>{userLabel(u)}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CourseDetail;
