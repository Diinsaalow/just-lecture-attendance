import React from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

interface ComparisonCardProps {
    title: string;
    currentValue: number | string;
    previousValue: number | string;
    icon: React.ReactNode;
    format?: "currency" | "number" | "percentage";
    showTrend?: boolean;
    trendValue?: number;
    gradientColors?: string;
    subtitle?: string;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
    title,
    currentValue,
    previousValue,
    icon,
    format = "number",
    showTrend = true,
    trendValue,
    gradientColors = "bg-gradient-to-r from-blue-500 to-blue-600",
    subtitle,
}) => {
    // Format value based on type
    const formatValue = (value: number | string): string => {
        const num = typeof value === "string" ? parseFloat(value) : value;
        
        if (isNaN(num)) return "0";

        switch (format) {
            case "currency":
                return `$${num.toFixed(2)}`;
            case "percentage":
                return `${num.toFixed(2)}%`;
            default:
                return num.toLocaleString();
        }
    };

    // Calculate growth
    const calculateGrowth = (): number => {
        if (trendValue !== undefined) return trendValue;

        const current =
            typeof currentValue === "string"
                ? parseFloat(currentValue)
                : currentValue;
        const previous =
            typeof previousValue === "string"
                ? parseFloat(previousValue)
                : previousValue;

        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const growth = calculateGrowth();
    const isPositive = growth >= 0;

    return (
        <div
            className={`panel p-0 ${gradientColors} text-white overflow-hidden h-full`}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-white/20 p-2 rounded-lg">
                            {icon}
                        </div>
                        <h5 className="font-semibold text-base">{title}</h5>
                    </div>
                    {showTrend && (
                        <div
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                                isPositive
                                    ? "bg-green-400/30"
                                    : "bg-red-400/30"
                            }`}
                        >
                            {isPositive ? (
                                <ArrowUpRight size={14} />
                            ) : (
                                <ArrowDownRight size={14} />
                            )}
                            <span className="font-medium">
                                {Math.abs(growth).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Current Value */}
                <div className="mb-4">
                    <div className="text-3xl font-bold">
                        {formatValue(currentValue)}
                    </div>
                    {subtitle && (
                        <p className="text-white/70 text-sm mt-1">{subtitle}</p>
                    )}
                </div>

                {/* Comparison */}
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div>
                        <p className="text-white/60 text-xs">Previous Period</p>
                        <p className="text-white font-medium text-sm">
                            {formatValue(previousValue)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/60 text-xs">Change</p>
                        <p
                            className={`font-medium text-sm ${
                                isPositive ? "text-green-200" : "text-red-200"
                            }`}
                        >
                            {isPositive ? "+" : ""}
                            {growth.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer accent */}
            <div className="h-2 bg-white/10"></div>
        </div>
    );
};

export default ComparisonCard;

