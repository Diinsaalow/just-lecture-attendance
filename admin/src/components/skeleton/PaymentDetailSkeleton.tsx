import React from 'react';

const PaymentDetailSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>

            {/* Payment Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
            </div>

            {/* Payment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
                <div className="grid grid-cols-1 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-4"></div>
                <div className="grid grid-cols-1 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-1 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Method Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-4"></div>
                <div className="grid grid-cols-1 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Curriculum Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailSkeleton;
