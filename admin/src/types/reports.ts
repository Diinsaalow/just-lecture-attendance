import { ENROLLMENT_STATUS } from './enrollment';
import { ORDER_PAYMENT_STATUS, ORDER_STATUS } from './order';

// Shared pagination
export interface PaginatedResponse<T> {
    docs: T[];
    totalDocs: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Enrollment report
export interface EnrollmentReportItem {
    _id: string;
    user?: { firstName?: string; lastName?: string; email?: string; phone?: string };
    level?: { name?: string; code?: string };
    plan?: { name?: string; price?: number };
    curriculum?: { name?: string; code?: string };
    status?: keyof typeof ENROLLMENT_STATUS | string;
    enrolledAt?: string;
}

export interface EnrollmentSummary {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    cancelledEnrollments: number;
    suspendedEnrollments: number;
    expiredEnrollments: number;
    byLevel: Array<{ levelId: string; levelName: string; count: number }>;
    byPlan: Array<{ planId: string; planName: string; count: number }>;
}

export interface EnrollmentReportResponse extends PaginatedResponse<EnrollmentReportItem> {
    summary: EnrollmentSummary;
}

export interface EnrollmentReportFilter {
    level?: string[];
    plan?: string[];
    status?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

// Order report
export interface OrderReportItem {
    _id: string;
    user?: { firstName?: string; lastName?: string; email?: string; phone?: string };
    level?: { name?: string; code?: string };
    plan?: { name?: string; price?: number };
    curriculum?: { name?: string; code?: string };
    assignedTo?: { firstName?: string; lastName?: string; email?: string } | null;
    status?: keyof typeof ORDER_STATUS | string;
    paymentStatus?: keyof typeof ORDER_PAYMENT_STATUS | string;
    totalAmount?: number;
    createdAt?: string;
}

export interface OrderSummaryByStatus {
    status: string;
    count: number;
    percentage: number;
}

export interface OrderSummaryByPaymentStatus {
    paymentStatus: string;
    count: number;
    percentage: number;
}

export interface OrderSummary {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    byStatus: OrderSummaryByStatus[];
    byPaymentStatus: OrderSummaryByPaymentStatus[];
    byLevel: Array<{ levelId: string; levelName: string; count: number; revenue: number }>;
    byPlan: Array<{ planId: string; planName: string; count: number; revenue: number }>;
    byAssignedTo: Array<{ assignedToId: string; assignedToName: string; count: number; revenue: number }>;
}

export interface OrderReportResponse extends PaginatedResponse<OrderReportItem> {
    summary: OrderSummary;
}

export interface OrderReportFilter {
    plan?: string[];
    level?: string[];
    status?: string[];
    paymentStatus?: string[];
    assignedTo?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

// User report
export interface UserReportItem {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role?: { _id: string; name: string };
    status: 'active' | 'inactive' | 'suspended';
    isVerified: boolean;
    curriculum?: { _id: string; name: string; code: string };
    level?: { _id: string; name: string };
    class?: { _id: string; name: string };
    createdAt: string;
}

export interface UserSummary {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    byRole: Array<{ roleId: string; roleName: string; count: number }>;
    byStatus: Array<{ status: string; count: number; percentage: number }>;
    byCurriculum: Array<{ curriculumId: string; curriculumName: string; count: number }>;
    byLevel: Array<{ levelId: string; levelName: string; count: number }>;
}

export interface UserReportResponse extends PaginatedResponse<UserReportItem> {
    summary: UserSummary;
}

export interface UserReportFilter {
    role?: string[];
    status?: string[];
    curriculum?: string[];
    level?: string[];
    isVerified?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

// Payment/Financial report
export interface PaymentReportItem {
    _id: string;
    order?: {
        _id: string;
        orderNumber?: string;
        status?: string;
        totalAmount?: number;
    };
    curriculum?: { _id?: string; name?: string; description?: string };
    paymentMethod?: { _id?: string; name?: string };
    amount?: number;
    reference?: string;
    user?: { _id?: string; firstName?: string; lastName?: string; email?: string };
    status?: string;
    paymentDate?: string;
    createdBy?: { _id?: string; firstName?: string; lastName?: string };
    createdAt?: string;
}

export interface PaymentSummaryByStatus {
    status: string;
    count: number;
    percentage: number;
}

export interface PaymentSummaryByMethod {
    methodId: string;
    methodName: string;
    count: number;
    amount: number;
}

export interface PaymentSummary {
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    byStatus: PaymentSummaryByStatus[];
    byMethod: PaymentSummaryByMethod[];
}

export interface PaymentReportResponse extends PaginatedResponse<PaymentReportItem> {
    summary: PaymentSummary;
}

export interface PaymentReportFilter {
    paymentMethod?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

// Campaign report
export interface CampaignReportItem {
    _id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    targetAudienceSize: number;
    status: 'active' | 'inactive' | 'paused' | 'completed';
    createdAt: string;
}

export interface CampaignSummary {
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    draftCampaigns: number;
    byStatus: Array<{ status: string; count: number; percentage: number }>;
}

export interface CampaignReportResponse extends PaginatedResponse<CampaignReportItem> {
    summary: CampaignSummary;
}

export interface CampaignReportFilter {
    status?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

// SMS report
export interface SmsReportItem {
    _id: string;
    smsMessage: {
        _id: string;
        content: string;
        campaign: { _id: string; name: string };
    };
    recipient: {
        _id: string;
        phoneNumber: string;
        firstName?: string;
        lastName?: string;
    };
    gatewayMessageId?: string;
    deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
    sentAt?: string;
    deliveredAt?: string;
    failureReason?: string;
    createdAt: string;
}

export interface SmsSummary {
    totalMessages: number;
    deliveredCount: number;
    failedCount: number;
    pendingCount: number;
    deliveryRate: number;
    byCampaign: Array<{ campaignId: string; campaignName: string; count: number; deliveryRate: number }>;
}

export interface SmsReportResponse extends PaginatedResponse<SmsReportItem> {
    summary: SmsSummary;
}

export interface SmsReportFilter {
    campaigns?: string[];
    status?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

// Feedback report
export interface FeedbackReportItem {
    _id: string;
    recipient?: { _id: string; phoneNumber: string; firstName?: string; lastName?: string };
    phoneNumber: string;
    campaign: { _id: string; name: string };
    responseText: string;
    riskLevel: 'normal' | 'flagged' | 'high';
    receivedAt: string;
}

export interface FeedbackSummary {
    totalFeedback: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    byCampaign: Array<{ campaignId: string; campaignName: string; feedbackCount: number; highRiskCount: number }>;
}

export interface FeedbackReportResponse extends PaginatedResponse<FeedbackReportItem> {
    summary: FeedbackSummary;
}

export interface FeedbackReportFilter {
    campaigns?: string[];
    riskLevels?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

// Recipient report
export interface RecipientReportItem {
    _id: string;
    phoneNumber: string;
    location?: { _id: string; country: string; region: string; district: string };
    gender?: string;
    languageCode: string;
    isActive: boolean;
    createdAt: string;
}

export interface RecipientSummary {
    totalRecipients: number;
    activeRecipients: number;
    optedOutCount: number;
    byLocation: Array<{ locationId: string; locationName: string; count: number }>;
    byGender: Array<{ gender: string; count: number; percentage: number }>;
}

export interface RecipientReportResponse extends PaginatedResponse<RecipientReportItem> {
    summary: RecipientSummary;
}

export interface RecipientReportFilter {
    locations?: string[];
    genders?: string[];
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
} as const;

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
} as const;

export const CAMPAIGN_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PAUSED: 'paused',
    COMPLETED: 'completed',
} as const;

export const SMS_DELIVERY_STATUS = {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
} as const;

export const RISK_LEVEL = {
    NORMAL: 'normal',
    FLAGGED: 'flagged',
    HIGH: 'high',
} as const;
