import React from 'react';
import moment from 'moment';
import { useGetAcademicYearByIdQuery } from '../../../store/api/academicYearApi';

interface AcademicYearDetailProps {
    academicYearId: string | null;
}

const AcademicYearDetail: React.FC<AcademicYearDetailProps> = ({ academicYearId }) => {
    const idString = academicYearId ? String(academicYearId) : '';
    const { data: row, isLoading } = useGetAcademicYearByIdQuery(idString, { skip: !idString });

    if (isLoading) {
        return <p className="text-gray-500">Loading...</p>;
    }
    if (!row) {
        return <p className="text-gray-500">No academic year selected</p>;
    }

    return (
        <div className="space-y-4 text-sm">
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{row.name}</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {row.startDate ? moment(row.startDate).format('L') : '-'} – {row.endDate ? moment(row.endDate).format('L') : '-'}
                </p>
            </div>
            <div>
                <span className="text-gray-500">Status</span>
                <p className="text-gray-800 dark:text-gray-200">{row.status}</p>
            </div>
        </div>
    );
};

export default AcademicYearDetail;
