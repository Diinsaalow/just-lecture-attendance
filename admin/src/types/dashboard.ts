export interface SystemStatus {
    users: {
        total: number;
        active: number;
        inactive: number;
        verified: number;
    };
}

export interface SmsStatus {
    campaigns: {
        total: number;
        active: number;
    };
    messages: {
        total: number;
        sent: number;
        pending: number;
    };
    delivery: {
        total: number;
        delivered: number;
        failed: number;
        rate: number;
    };
    feedback: {
        total: number;
        rate: number;
        autoReplies: number;
    };
}

export interface RecentCampaign {
    _id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export interface RecentFeedback {
    _id: string;
    recipient?: {
        phoneNumber: string;
    };
    phoneNumber: string;
    campaign: {
        name: string;
    };
    responseText: string;
    responseType: string;
    riskLevel: string;
    receivedAt: string;
}

export interface ChartData {
    labels: string[];
    data: number[];
}

export interface DeliveryTrends {
    labels: string[];
    delivered: number[];
    failed: number[];
}

export interface ContentGrowthData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color: string;
    }[];
}

export interface UserDistribution {
    labels: string[];
    data: number[];
}

export interface RecentUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    createdAt: string;
    role: {
        _id: string;
        name: string;
    };
}

export interface RecentLesson {
    _id: string;
    title: string;
    type: string;
    status: string;
    views: number;
    averageRating: number;
    totalReviews: number;
    createdAt: string;
}

export interface RecentQuiz {
    _id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
}

export interface ReviewStatistics {
    totalReviews: number;
    averageRating: number;
    ratingBreakdown: {
        [key: string]: number;
    };
}

export interface RecentReview {
    _id: string;
    rating: number;
    review: string;
    status: string;
    createdAt: string;
    student: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    lesson: {
        _id: string;
        title: string;
    };
    subject: {
        _id: string;
        name: string;
    };
}

export interface RecentReviews {
    recentReviews: RecentReview[];
    reviewStats: ReviewStatistics;
}

export interface TopLesson {
    _id: string;
    title: string;
    type: string;
    views: number;
    averageRating: number;
    totalReviews: number;
    createdAt: string;
    chapter?: {
        _id: string;
        title: string;
    };
}

export interface TopLessons {
    topRatedLessons: TopLesson[];
    topViewedLessons: TopLesson[];
}

export interface DashboardType {
    id: string;
    name: string;
    description: string;
    icon: string;
    route: string;
}

// Enrollment Dashboard Types
export interface EnrollmentStatus {
    total: {
        totalEnrollments: number;
        enrollmentGrowthLastMonth: number;
    };
    byStatus: {
        active: {
            totalActive: number;
            activeGrowthLastMonth: number;
        };
        completed: {
            totalCompleted: number;
            completedGrowthLastMonth: number;
        };
        cancelled: {
            totalCancelled: number;
            cancelledGrowthLastMonth: number;
        };
        expired: {
            totalExpired: number;
            expiredGrowthLastMonth: number;
        };
    };
}

export interface EnrollmentDistribution {
    labels: string[];
    data: number[];
    details?: {
        planId: string;
        planName: string;
        enrollmentCount: number;
    }[];
}

export interface RecentEnrollment {
    _id: string;
    status: string;
    startedAt: string;
    endDate: string;
    enrolledAt: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    level: {
        _id: string;
        name: string;
    };
    curriculum: {
        _id: string;
        name: string;
    };
    plan: {
        _id: string;
        name: string;
        duration: number;
        durationType: string;
    };
}

export interface TopStudent {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    enrollmentCount: number;
    activeEnrollments: number;
    completedEnrollments: number;
}

export interface EnrollmentCompletion {
    totalEnrollments: number;
    completedEnrollments: number;
    activeEnrollments: number;
    completionRate: number;
    activeRate: number;
}

export interface CancellationAnalytics {
    totalCancellations: number;
    topReasons: {
        reason: string;
        count: number;
    }[];
}

export interface PlanPerformance {
    planId: string;
    planName: string;
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    cancelledEnrollments: number;
    completionRate: number;
    cancellationRate: number;
}

export interface ExpiringSoon {
    expiring7Days: number;
    expiring30Days: number;
    recentExpiring: RecentEnrollment[];
}

// Financial Dashboard Types
export interface FinancialStatus {
    total: {
        monthlyRevenue: number;
        monthlyRevenueLastMonth: number;
        totalRevenue: number;
        paidOrdersThisMonth: number;
        paidOrdersLastMonth: number;
        pendingOrders: number;
    };
    growth: {
        revenueGrowth: number;
        ordersGrowth: number;
    };
}

export interface FinancialGrowth {
    revenue: {
        current: number;
        lastMonth: number;
        twoMonthsAgo: number;
        growth: number;
        previousGrowth: number;
    };
    orders: {
        current: number;
        lastMonth: number;
        twoMonthsAgo: number;
        growth: number;
        previousGrowth: number;
    };
}

export interface RevenueTrends {
    labels: string[];
    data: number[];
}

export interface RevenueDistribution {
    labels: string[];
    data: number[];
    counts: number[];
    totalRevenue: number;
}

export interface RevenueByPlan {
    planName: string;
    totalRevenue: number;
    count: number;
    avgOrderValue: number;
}

export interface TopCustomer {
    customerId: string;
    customerName: string;
    customerEmail: string;
    totalSpent: number;
    orderCount: number;
    lastOrderDate: string;
}

export interface PaymentAnalytics {
    paymentStatus: Array<{ _id: string; count: number; totalAmount: number }>;
    paymentMethods: Array<{ _id: string; count: number; totalAmount: number }>;
    orderValueStats: {
        avgOrderValue: number;
        minOrderValue: number;
        maxOrderValue: number;
    };
    refundStats: {
        refundCount: number;
        refundAmount: number;
    };
}

export interface MonthlyPerformance {
    currentMonth: {
        totalRevenue: number;
        totalOrders: number;
        newCustomers: number;
        avgOrderValue: number;
    };
    lastMonth: {
        totalRevenue: number;
        totalOrders: number;
        newCustomers: number;
        avgOrderValue: number;
    };
    trends: Array<{
        month: string;
        totalRevenue: number;
        totalOrders: number;
        newCustomers: number;
        avgOrderValue: number;
    }>;
    comparison: {
        revenueGrowth: number;
        ordersGrowth: number;
    };
}

export interface RevenueForecast {
    avgGrowthRate: number;
    forecast: Array<{
        month: string;
        projectedRevenue: number;
    }>;
    confidence: 'positive' | 'negative';
}

export const DASHBOARD_TYPES: DashboardType[] = [
    {
        id: 'system',
        name: 'System Dashboard',
        description: 'Overview of system statistics and user performance',
        icon: 'system',
        route: '/dashboard/system',
    },
    {
        id: 'sms',
        name: 'SMS Dashboard',
        description: 'Campaign and messaging analytics',
        icon: 'sms',
        route: '/dashboard/sms',
    },
];
