import React from 'react';

interface ProviderFormSkeletonProps {
    hasDescription?: boolean;
    parameterCount?: number;
}

const ProviderFormSkeleton: React.FC<ProviderFormSkeletonProps> = ({ hasDescription = false, parameterCount = 2 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 animate-pulse">
            {/* Name field */}
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
            </div>

            {/* Description field (conditional) */}
            {hasDescription && (
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            )}

            {/* Dynamic parameters fields */}
            {Array.from({ length: parameterCount }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            ))}

            {/* Active switch */}
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>

            {/* Save button */}
            <div className="md:col-span-2 mt-6">
                <div className="h-10 bg-gray-200 rounded w-20"></div>
            </div>
        </div>
    );
};

export default ProviderFormSkeleton;
