// Payment Status Enums
export enum PAYMENT_STATUS {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

// Payment Method Type Enums
export enum PAYMENT_METHOD_TYPE {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    BANK_TRANSFER = 'bank_transfer',
    MOBILE_MONEY = 'mobile_money',
    CASH = 'cash',
    CHECK = 'check',
    OTHER = 'other',
}

// User interface for payment references
export interface IPaymentUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

// Order interface for payment references
export interface IPaymentOrder {
    _id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
}

// Curriculum interface for payment references
export interface IPaymentCurriculum {
    _id: string;
    name: string;
    description: string;
}

// Payment Method interface for payment references
export interface IPaymentMethod {
    _id: string;
    name: string;
    slug: string;
    type: PAYMENT_METHOD_TYPE;
    status: string;
    description?: string;
    logo?: string;
    isDefault: boolean;
    parameters: Record<string, any>;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// Main Payment interface
export interface IPayment {
    _id: string;
    order: IPaymentOrder | string;
    curriculum: IPaymentCurriculum | string;
    paymentMethod: IPaymentMethod | string;
    amount: number;
    reference: string;
    user: IPaymentUser | string;
    status: PAYMENT_STATUS;
    paymentDate?: string;
    metadata?: Record<string, any>;
    createdBy: IPaymentUser;
    createdAt: string;
    updatedAt: string;
}

// Payment Statistics interface
export interface IPaymentStatistics {
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    pendingPayments: number;
    completedPayments: number;
    failedPayments: number;
    refundedPayments: number;
}

// Payment Response interface for API responses
export interface IPaymentResponse {
    _id: string;
    order: IPaymentOrder;
    curriculum: IPaymentCurriculum;
    paymentMethod: IPaymentMethod;
    amount: number;
    reference: string;
    user: IPaymentUser;
    status: PAYMENT_STATUS;
    paymentDate?: string;
    metadata?: Record<string, any>;
    createdBy: IPaymentUser;
    createdAt: string;
    updatedAt: string;
}

// Payment List Query Parameters
export interface IPaymentQueryParams {
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
        status?: PAYMENT_STATUS;
        user?: string;
        order?: string;
        curriculum?: string;
        paymentMethod?: string;
        createdBy?: string;
        dateFrom?: string;
        dateTo?: string;
        amountMin?: number;
        amountMax?: number;
    };
}
