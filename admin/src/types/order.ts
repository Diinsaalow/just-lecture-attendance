// Order Status Enums
export enum ORDER_STATUS {
    PENDING = 'pending',
    PROCESSING = 'processing',
    PAID = 'paid',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum ORDER_PAYMENT_STATUS {
    UNPAID = 'unpaid',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

export enum ORDER_SOURCE {
    WEB = 'web',
    MOBILE = 'mobile',
    ADMIN = 'admin',
    API = 'api',
}

export enum DISCOUNT_TYPE {
    NONE = 'none',
    FIXED = 'fixed',
    PERCENT = 'percent',
}

// User interface for order references
export interface IOrderUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

// Plan interface for order references
export interface IOrderPlan {
    _id: string;
    name: string;
    description: string;
    originalPrice: number;
    salePrice: number;
}

// Level interface for order references
export interface IOrderLevel {
    _id: string;
    name: string;
    description: string;
}

// Curriculum interface for order references
export interface IOrderCurriculum {
    _id: string;
    name: string;
    code: string;
}

// Enrollment interface for order references
export interface IOrderEnrollment {
    _id: string;
    status: string;
    enrolledAt: string;
}

// Currency interface
export interface IOrderCurrency {
    name: string;
    symbol: string;
}

// Main Order interface
export interface IOrder {
    _id: string;
    user: IOrderUser | string;
    plan: IOrderPlan | string;
    level: IOrderLevel | string;
    curriculum: IOrderCurriculum | string;
    enrollment?: IOrderEnrollment;
    orderFrom: ORDER_SOURCE;
    status: ORDER_STATUS;
    notes?: string;
    currency: IOrderCurrency;
    dueDate: string;
    paymentStatus: ORDER_PAYMENT_STATUS;
    orderNumber: string;
    assignedTo?: IOrderUser;
    paidAt?: string;
    completedAt?: string;
    cancelReason?: string;
    createdBy: IOrderUser;
    createdAt: string;
    updatedAt: string;

    // Pricing fields
    subtotal: number;
    discountType: DISCOUNT_TYPE;
    discountValue: number;
    discountAmount: number;
    totalAmount: number;
}

// Create Order interface
export interface ICreateOrder {
    userId: string;
    plan: string;
    level: string;
    orderFrom?: ORDER_SOURCE;
    notes?: string;
    currency?: IOrderCurrency;
    dueDate?: string;
    discountType?: DISCOUNT_TYPE;
    discountValue?: number;
    assignedTo?: string;
}

// Update Order interface
export interface IUpdateOrder {
    user?: string;
    plan?: string;
    level?: string;
    orderFrom?: ORDER_SOURCE;
    status?: ORDER_STATUS;
    paymentStatus?: ORDER_PAYMENT_STATUS;
    notes?: string;
    currency?: IOrderCurrency;
    dueDate?: string;
    discountType?: DISCOUNT_TYPE;
    discountValue?: number;
    assignedTo?: string;
}

// Pay Order interface
export interface IPayOrder {
    paymentMethod: string;
    amount: number;
    reference: string;
    paymentDate: string;
}

// Cancel Order interface
export interface ICancelOrder {
    reason?: string;
}

// Complete Order interface
export interface ICompleteOrder {
    sendNotice?: boolean;
}

// Assign Order interface
export interface IAssignOrder {
    assignedTo: string;
}

// Bulk Delete Order interface
export interface IBulkDeleteOrder {
    ids: string[];
}

// Bulk Delete Response interface
export interface IBulkDeleteOrderResponse {
    deletedCount: number;
    deletedIds: string[];
    notFoundIds: string[];
    errorCount: number;
    errorIds: string[];
    errorMessages: Record<string, string>;
}

// Order Statistics interface
export interface IOrderStatistics {
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    processingOrders: number;
    pendingPayments: number;
    paidPayments: number;
    failedPayments: number;
    refundedPayments: number;
    conversionRate: number;
}

// Order Response interface for API responses
export interface IOrderResponse {
    _id: string;
    user: IOrderUser;
    plan: IOrderPlan;
    level: IOrderLevel;
    enrollment?: IOrderEnrollment;
    assignedTo?: IOrderUser;
    createdBy: IOrderUser;
    orderFrom: ORDER_SOURCE;
    status: ORDER_STATUS;
    notes?: string;
    currency: IOrderCurrency;
    dueDate: string;
    paymentStatus: ORDER_PAYMENT_STATUS;
    orderNumber: string;
    paidAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Order List Query Parameters
export interface IOrderQueryParams {
    search?: {
        keyword?: string;
        fields?: string[];
    };
    options?: {
        limit?: number;
        page?: number;
        sort?: Record<string, 'asc' | 'desc'>;
    };
    query?: {
        status?: ORDER_STATUS;
        paymentStatus?: ORDER_PAYMENT_STATUS;
        orderFrom?: ORDER_SOURCE;
        user?: string;
        plan?: string;
        level?: string;
        curriculum?: string;
        assignedTo?: string;
        createdBy?: string;
        dateFrom?: string;
        dateTo?: string;
        amountMin?: number;
        amountMax?: number;
    };
}
