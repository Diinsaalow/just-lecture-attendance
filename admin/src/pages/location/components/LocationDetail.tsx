import React from 'react';
import { useGetLocationByIdQuery } from '../../../store/api/locationApi';
import { ILocation } from '../../../types/location';
import UserDetailSkeleton from '../../../components/skeleton/UserDetailSkeleton'; // Reusing skeleton for now

interface LocationDetailProps {
    locationId: string | null;
}

const LocationDetail: React.FC<LocationDetailProps> = ({ locationId }) => {
    const idString = locationId ? (locationId as unknown as string) : '';
    const { data: location, isLoading } = useGetLocationByIdQuery(idString, { skip: !idString });

    if (isLoading) {
        return <UserDetailSkeleton />;
    }

    if (!location) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No location selected</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 transition-all duration-200 ease-in-out">
            <div>
                <h3 className="text-2xl font-bold mb-1">
                    {location.country}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{location.region} - {location.district}</p>
            </div>

            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Created At</h4>
                <p className="text-gray-700 dark:text-gray-300">{location.createdAt ? new Date(location.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Updated At</h4>
                <p className="text-gray-700 dark:text-gray-300">{location.updatedAt ? new Date(location.updatedAt).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="border-t pt-4 mt-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">ID</h4>
                <p className="text-gray-700 dark:text-gray-300">{location._id}</p>
            </div>
        </div>
    );
};

export default LocationDetail;
