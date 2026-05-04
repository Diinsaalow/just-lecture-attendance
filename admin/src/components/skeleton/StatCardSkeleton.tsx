import React from 'react';

const StatCardSkeleton: React.FC = () => {
    return (
        <div className="panel p-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-white overflow-hidden animate-pulse">
            <div className="p-6">
                {/* Header section skeleton */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                        {/* Icon skeleton */}
                        <div className="w-6 h-6 bg-white/20 rounded mr-3"></div>
                        {/* Title skeleton */}
                        <div className="h-5 bg-white/20 rounded w-24"></div>
                    </div>
                    {/* Badge skeleton */}
                    <div className="bg-white/20 rounded-full w-16 h-6"></div>
                </div>

                {/* Count skeleton */}
                <div className="h-10 bg-white/20 rounded w-20 mb-4"></div>

                {/* Growth section skeleton */}
                <div className="flex items-center mt-4">
                    <div className="bg-white/20 rounded-full w-16 h-6 mr-2"></div>
                    <div className="h-3 bg-white/20 rounded w-20"></div>
                </div>
            </div>

            {/* View link section skeleton */}
            <div className="h-12 bg-white/10">
                <div className="flex items-center justify-center h-full">
                    <div className="h-4 bg-white/20 rounded w-24"></div>
                    <div className="w-4 h-4 bg-white/20 rounded ml-1"></div>
                </div>
            </div>
        </div>
    );
};

export default StatCardSkeleton;
