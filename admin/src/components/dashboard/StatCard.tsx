import React from 'react';
import { ArrowUpRight, ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
    title: string;
    count: number;
    previousCount: number;
    icon: React.ReactNode;
    linkTo: string;
    gradientColors: string;
    badgeText: string;
    showViewLink?: boolean;
    showGrowth?: boolean;
    isLoading?: boolean;
    displayValue?: string; // Optional formatted display value
}

const StatCard: React.FC<StatCardProps> = ({ title, count, previousCount, icon, linkTo, gradientColors, badgeText, showViewLink = true, showGrowth = true, isLoading = false, displayValue }) => {
    // Format percentage growth
    const formatGrowth = (current: number, previous: number): string => {
        if (previous === 0) return '∞%';
        const growth = ((current - previous) / previous) * 100;
        return growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
    };

    // Check if growth is positive
    const isPositiveGrowth = (current: number, previous: number): boolean => {
        return current >= previous;
    };

    return (
        <div className={`panel p-0 ${gradientColors} text-white overflow-hidden h-full flex flex-col`}>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4 min-h-[48px]">
                    <div className="flex items-start overflow-hidden">
                        <div className="mt-1 mr-2 flex-shrink-0 opacity-80">
                            {icon}
                        </div>
                        <h5 className="font-bold text-base leading-tight mt-1 line-clamp-2">{title}</h5>
                    </div>
                    <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ml-2 mt-1.5 flex-shrink-0">
                        {badgeText}
                    </span>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                    {isLoading ? (
                        <div className="h-10 bg-white/20 rounded animate-pulse w-24 mb-2"></div>
                    ) : (
                        <div className="text-3xl font-bold mb-1">{displayValue || count}</div>
                    )}

                    {showGrowth && (
                        <div className="flex items-center mt-2">
                            {isLoading ? (
                                <>
                                    <div className="h-4 bg-white/20 rounded-full w-12 mr-2 animate-pulse"></div>
                                    <div className="h-3 bg-white/20 rounded w-16 animate-pulse"></div>
                                </>
                            ) : (
                                <>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full mr-2 flex items-center ${isPositiveGrowth(count, previousCount) ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
                                        {isPositiveGrowth(count, previousCount) ?
                                            <ArrowUpRight size={10} className="mr-0.5" /> :
                                            <ArrowUpRight size={10} className="mr-0.5 rotate-180" />
                                        }
                                        {formatGrowth(count, previousCount)}
                                    </span>
                                    <span className="text-[10px] text-white/70">vs last month</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {showViewLink && (
                <div className="h-12 bg-white/10">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-sm opacity-50 cursor-not-allowed">
                            View {title} <ChevronsRight size={16} className="ml-1" />
                        </div>
                    ) : (
                        <Link to={linkTo} className="flex items-center justify-center h-full text-sm hover:bg-white/20 transition">
                            View {title} <ChevronsRight size={16} className="ml-1" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default StatCard;
