import React from 'react';
import { useGetCampusByIdQuery } from '../../../store/api/campusApi';

interface Props {
    campusId: string | null;
}

const CampusDetail: React.FC<Props> = ({ campusId }) => {
    const id = campusId ? String(campusId) : '';
    const { data: row, isLoading } = useGetCampusByIdQuery(id, { skip: !id });

    if (isLoading) return <p className="text-gray-500">Loading...</p>;
    if (!row) return <p className="text-gray-500">None selected</p>;

    return (
        <div className="space-y-3 text-sm">
            <h4 className="font-semibold">{row.campusName}</h4>
            <p className="text-gray-600 dark:text-gray-300">{row.telephone}</p>
            <p className="text-gray-600 dark:text-gray-300">{row.location}</p>
            <p>Status: {row.status}</p>
        </div>
    );
};

export default CampusDetail;
