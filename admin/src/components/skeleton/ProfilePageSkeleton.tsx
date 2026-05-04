import React from 'react';

const ProfilePageSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse">
            {/* General Information Form Skeleton */}
            <div className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-8 mb-8 bg-white dark:bg-black w-full">
                {/* Form Title */}
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-5"></div>

                <div className="flex flex-col md:flex-row items-start">
                    {/* Profile Image Section */}
                    <div className="md:mr-8 w-32 h-32 mb-5 flex justify-center items-start self-start">
                        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>

                    {/* Form Fields */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* First Name Field */}
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>

                        {/* Last Name Field */}
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>

                        {/* Bio Field */}
                        <div className="md:col-span-2 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>

                        {/* Address Field */}
                        <div className="md:col-span-2 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-6">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
            </div>

            {/* Security Form Skeleton */}
            <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow p-8">
                {/* Security Form Title */}
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-6"></div>

                <div className="space-y-6">
                    {/* Current Password Field */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>

                    {/* New Password Field */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>

                    {/* Change Password Button */}
                    <div className="flex justify-end">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePageSkeleton;
