import React from 'react';

const QuestionsSidebarSkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="p-3 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse w-14 h-14"></div>
                        <div>
                            {/* Title */}
                            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                            {/* Subtitle */}
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                        </div>
                    </div>
                    {/* Button */}
                    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-36 animate-pulse"></div>
                </div>
            </div>

            {/* Question Cards Skeleton */}
            <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                                {/* Question Number Badge */}
                                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0"></div>
                                <div className="flex-1">
                                    {/* Question Text */}
                                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>

                        {/* Question Details */}
                        <div className="space-y-3 ml-14">
                            {/* Type and Marks */}
                            <div className="flex gap-3">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 mb-2 animate-pulse"></div>
                                {[1, 2, 3, 4].map((opt) => (
                                    <div key={opt} className="flex items-center gap-2 p-2 rounded-lg">
                                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Correct Answer */}
                            <div className="pt-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionsSidebarSkeleton;
