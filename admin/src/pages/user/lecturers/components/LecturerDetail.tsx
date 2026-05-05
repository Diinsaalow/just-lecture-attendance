import React from 'react';
import { useGetLecturerByIdQuery } from '../../../../store/api/lecturerApi';
import type { IUser } from '../../../../types/auth';
import { formatJamhuriyaUsername } from '../../../../utils/jamhuriyaUsername';

interface Props {
    lecturerId: string | null;
}

const LecturerDetail: React.FC<Props> = ({ lecturerId }) => {
    const id = lecturerId ? String(lecturerId) : '';
    const { data: row, isLoading } = useGetLecturerByIdQuery(id, { skip: !id });

    if (!id) return <p className="text-gray-500 text-sm">Select a lecturer</p>;
    if (isLoading) return <p className="text-gray-500 text-sm">Loading...</p>;
    if (!row) return <p className="text-gray-500 text-sm">Not found</p>;

    const r = row as IUser;
    const faculty =
        r.facultyId && typeof r.facultyId === 'object' && r.facultyId !== null && 'name' in r.facultyId
            ? (r.facultyId as { name: string }).name
            : '—';

    return (
        <div className="space-y-2 text-sm">
            <h4 className="font-semibold">
                {r.firstName || r.lastName ? `${r.firstName || ''} ${r.lastName || ''}`.trim() : r.username}
            </h4>
            <p>
                <span className="text-gray-500">Username:</span>{' '}
                <span className="font-mono font-medium">{formatJamhuriyaUsername(r.username || '')}</span>
            </p>
            <p>Phone: {r.phone || '—'}</p>
            <p>Faculty: {faculty}</p>
            <p>Status: {r.status || '—'}</p>
            <p className="text-xs text-gray-500">Passcode is never shown after creation.</p>
        </div>
    );
};

export default LecturerDetail;
