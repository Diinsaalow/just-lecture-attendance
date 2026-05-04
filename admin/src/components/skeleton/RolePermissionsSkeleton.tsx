import React from 'react';

const RolePermissionsSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col h-[calc(100vh-60px)]">
            {/* Section Title Skeleton */}
            <div className="font-semibold text-lg mb-2 mt-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>

            {/* Permissions List Skeleton */}
            <div className="flex-1 overflow-y-hidden divide-y divide-gray-200 dark:divide-gray-800">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="flex items-center py-3 px-1 animate-pulse">
                        {/* Subject name skeleton */}
                        <div className="w-56">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                        {/* Action checkboxes skeleton */}
                        <div className="flex flex-wrap gap-4 ml-4">
                            {Array.from({ length: 4 }).map((_, actionIndex) => (
                                <div key={actionIndex} className="flex items-center gap-1">
                                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RolePermissionsSkeleton;
