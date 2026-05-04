import React from 'react';

const BookDetailSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 transition-all duration-200 ease-in-out">
            {/* Header */}
            <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Subject & Class section */}
            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>
            </div>

            {/* Book Details section */}
            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                </div>
            </div>

            {/* Description section */}
            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5 animate-pulse"></div>
                </div>
            </div>

            {/* Media section */}
            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mb-2 animate-pulse"></div>
                <div className="space-y-4">
                    {/* Thumbnail */}
                    <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 mt-2 animate-pulse"></div>
                    </div>
                    {/* File */}
                    <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Status & Features section */}
            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
                    <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
                    </div>
                </div>
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

export default BookDetailSkeleton;
