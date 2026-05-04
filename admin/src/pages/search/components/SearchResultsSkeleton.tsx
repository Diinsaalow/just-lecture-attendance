import React from 'react';

const SearchResultsSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>

            {/* Tabs skeleton */}
            <div className="flex space-x-1 mb-4 border-b border-gray-200 dark:border-gray-700">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="px-4 py-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Entity sections skeleton */}
                {[1, 2, 3].map((sectionIndex) => (
                    <div key={sectionIndex} className="mb-4">
                        {/* Section header skeleton */}
                        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 flex justify-between items-center">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>

                        {/* Search items skeleton */}
                        {[1, 2, 3].map((itemIndex) => (
                            <div key={itemIndex} className="p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                                <div className="flex items-start space-x-3">
                                    {/* Icon skeleton */}
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 mt-1"></div>

                                    <div className="flex-1 min-w-0">
                                        {/* Title skeleton */}
                                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>

                                        {/* Description skeleton */}
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>

                                        {/* Tags skeleton */}
                                        <div className="flex space-x-2 mb-2">
                                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
                                        </div>

                                        {/* Metadata skeleton */}
                                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchResultsSkeleton;
