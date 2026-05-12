import React from 'react';
import { useGetUserByIdQuery } from '../../../store/api/userApi';
import { IUser } from '../../../types/auth';
import UserDetailSkeleton from '../../../components/skeleton/UserDetailSkeleton';

interface UserDetailProps {
    userId: string | null;
}

const UserDetail: React.FC<UserDetailProps> = ({ userId }) => {
    // Convert number ID to string for RTK Query, or skip if no userId
    const userIdString = userId ? (userId as unknown as string) : '';
    const { data: user, isLoading } = useGetUserByIdQuery(userIdString, { skip: !userIdString });

    if (isLoading) {
        return <UserDetailSkeleton />;
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No user selected</p>
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
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Status</h4>
                <p className="text-gray-700 dark:text-gray-300 capitalize">{user.status || (user.isActive ? 'active' : 'inactive')}</p>
            </div>

            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Role</h4>
                <p className="text-gray-700 dark:text-gray-300">{typeof user.role === 'object' ? user.role.name : user.role || 'N/A'}</p>
            </div>

            {user.referralCode && (
                <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Referral Code</h4>
                    <p className="text-gray-700 dark:text-gray-300 font-mono">{user.referralCode}</p>
                </div>
            )}

            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Created At</h4>
                <p className="text-gray-700 dark:text-gray-300">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Updated At</h4>
                <p className="text-gray-700 dark:text-gray-300">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="border-t pt-4 mt-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">ID</h4>
                <p className="text-gray-700 dark:text-gray-300">{user._id}</p>
            </div>
        </div>
    );
};

export default UserDetail;
