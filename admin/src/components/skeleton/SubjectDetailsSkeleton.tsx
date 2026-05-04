import React from 'react';

const SubjectDetailsSkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>

            {/* Subject Header skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg w-9 h-9 animate-pulse"></div>
                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                            <div className="flex items-center space-x-2">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                </div>
            </div>

            {/* Chapters Section skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
                </div>

                {/* Chapter cards skeleton */}
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Lessons skeleton */}
                        <div className="space-y-2">
                            {Array.from({ length: 2 }).map((_, lessonIndex) => (
                                <div key={lessonIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-40 animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-16 animate-pulse"></div>
                                        <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-6 animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubjectDetailsSkeleton;
