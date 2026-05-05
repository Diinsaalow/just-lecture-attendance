import React from 'react';
import { useGetHallByIdQuery } from '../../../store/api/hallApi';
import type { IHall } from '../../../types/hall';

interface Props {
    hallId: string | null;
}

function campusLabel(campusId: IHall['campusId']): string {
    if (typeof campusId === 'object' && campusId !== null && 'campusName' in campusId) {
        return campusId.campusName;
    }
    return String(campusId);
}

const HallDetail: React.FC<Props> = ({ hallId }) => {
    const id = hallId ? String(hallId) : '';
    const { data: row, isLoading } = useGetHallByIdQuery(
        { id, params: { options: { populate: [{ path: 'campusId', select: 'campusName' }] } } },
        { skip: !id },
    );

    if (isLoading) return <p className="text-gray-500">Loading...</p>;
    if (!row) return <p className="text-gray-500">None selected</p>;

    return (
        <div className="space-y-3 text-sm">
            <h4 className="font-semibold">{row.name}</h4>
            <p className="text-gray-600 dark:text-gray-300">Code: {row.code}</p>
            <p className="text-gray-600 dark:text-gray-300">Campus: {campusLabel(row.campusId)}</p>
            {row.building ? <p className="text-gray-600 dark:text-gray-300">Building: {row.building}</p> : null}
            {row.floor ? <p className="text-gray-600 dark:text-gray-300">Floor: {row.floor}</p> : null}
            {row.capacity != null ? <p className="text-gray-600 dark:text-gray-300">Capacity: {row.capacity}</p> : null}
            <p>Status: {row.status}</p>
        </div>
    );
};

export default HallDetail;
