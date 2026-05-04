import React from 'react';

const RoleDetailSkeleton: React.FC = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Basic Information Section Skeleton */}
            <div>
                <div className="mb-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                </div>
                <div className="space-y-3">
                    {/* Name field skeleton */}
                    <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                    </div>
                    {/* Status field skeleton */}
                    <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                    </div>
                    {/* Created At field skeleton */}
                    <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                    </div>
                    {/* Updated At field skeleton */}
                    <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Permissions Section Skeleton */}
            <div>
                <div className="mb-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default RoleDetailSkeleton;
