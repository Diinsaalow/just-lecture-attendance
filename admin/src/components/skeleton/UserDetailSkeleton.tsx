import React from 'react';

const UserDetailSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 transition-all duration-200 ease-in-out">
            {/* Header */}
            <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Status section */}
            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 animate-pulse"></div>
            </div>

            {/* Role section */}
            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
            </div>

            {/* Created At section */}
            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Updated At section */}
            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* ID section with divider */}
            <div className="border-t pt-4 mt-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
            </div>
        </div>
    );
};

export default UserDetailSkeleton;
