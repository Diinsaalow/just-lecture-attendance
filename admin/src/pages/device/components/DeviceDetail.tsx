import React from 'react';
import { useGetUserByIdQuery } from '../../../store/api/userApi';
import UserDetailSkeleton from '../../../components/skeleton/UserDetailSkeleton';

interface DeviceDetailProps {
    userId: string | null;
}

const DeviceDetail: React.FC<DeviceDetailProps> = ({ userId }) => {
    const userIdString = userId ? (userId as unknown as string) : '';
    const { data: user, isLoading } = useGetUserByIdQuery(userIdString, { skip: !userIdString });

    if (isLoading) {
        return <UserDetailSkeleton />;
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No device selected</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 transition-all duration-200 ease-in-out">
            <div>
                <h3 className="text-2xl font-bold mb-1">
                    {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{user.email}</p>
            </div>

            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Device Status</h4>
                <div className="flex items-center">
                    {user.registeredDeviceId ? (
                        <span className="badge badge-outline-success">Active</span>
                    ) : user.pendingDeviceId ? (
                        <span className="badge badge-outline-warning">Pending Approval</span>
                    ) : (
                        <span className="badge badge-outline-danger">Not Registered</span>
                    )}
                </div>
            </div>

            {(user.registeredDeviceId || user.pendingDeviceId) && (
                <>
                    <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Device ID</h4>
                        <p className="text-gray-700 dark:text-gray-300 font-mono text-xs break-all">{user.registeredDeviceId || user.pendingDeviceId}</p>
                    </div>

                    <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Model</h4>
                        <p className="text-gray-700 dark:text-gray-300">{user.deviceModel || 'N/A'}</p>
                    </div>

                    <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Platform</h4>
                        <p className="text-gray-700 dark:text-gray-300 capitalize">{user.devicePlatform || 'N/A'}</p>
                    </div>
                </>
            )}

            <div className="border-t pt-4 mt-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">User ID</h4>
                <p className="text-gray-700 dark:text-gray-300 text-xs">{user._id}</p>
            </div>
        </div>
    );
};

export default DeviceDetail;
