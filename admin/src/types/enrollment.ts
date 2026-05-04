// Enrollment Status Enums
export enum ENROLLMENT_STATUS {
    ACTIVE = 'active',
    CANCELLED = 'cancelled',
    SUSPENDED = 'suspended',
    EXPIRED = 'expired',
}

// User interface for enrollment references
export interface IEnrollmentUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

// Plan interface for enrollment references
export interface IEnrollmentPlan {
    _id: string;
    name: string;
    description: string;
    originalPrice: number;
    salePrice: number;
    duration: number;
    durationType: string;
}

// Level interface for enrollment references
export interface IEnrollmentLevel {
    _id: string;
    name: string;
    description: string;
    order: number;
    curriculum: string;
}

// Curriculum interface for enrollment references
export interface IEnrollmentCurriculum {
    _id: string;
    name: string;
    code: string;
    description?: string;
}

// Order interface for enrollment references
export interface IEnrollmentOrder {
    _id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    currency: {
        name: string;
        symbol: string;
    };
    paidAt?: string;
    completedAt?: string;
}

// Main Enrollment interface
export interface IEnrollment {
    _id: string;
    user: IEnrollmentUser | string;
    level: IEnrollmentLevel | string;
    curriculum: IEnrollmentCurriculum | string;
    plan: IEnrollmentPlan | string;
    order: IEnrollmentOrder | string;
    status: ENROLLMENT_STATUS;
    startedAt: string;
    endDate?: string;
    enrolledAt: string;
    cancellationReason?: string;
    createdBy: IEnrollmentUser | string;
    createdAt: string;
    updatedAt: string;
}

// Create Enrollment interface (for admin enrollment)
export interface ICreateEnrollment {
    userId: string;
    levelId: string;
    curriculumId: string;
    planId?: string;
    startedAt?: string;
    endDate?: string;
    status?: ENROLLMENT_STATUS;
}

// Update Enrollment interface
export interface IUpdateEnrollment {
    status?: ENROLLMENT_STATUS;
    startedAt?: string;
    endDate?: string;
    cancellationReason?: string;
}

// Cancel Enrollment interface
export interface ICancelEnrollment {
    reason?: string;
}

// Suspend Enrollment interface
export interface ISuspendEnrollment {
    reason?: string;
}

// Bulk Delete Enrollment interface
export interface IBulkDeleteEnrollment {
    ids: string[];
}

// Bulk Delete Response interface
export interface IBulkDeleteEnrollmentResponse {
    deletedCount: number;
    deletedIds: string[];
    notFoundIds: string[];
    errorCount: number;
    errorIds: string[];
    errorMessages: Record<string, string>;
}

// Enrollment Statistics interface
export interface IEnrollmentStatistics {
    totalEnrollments: number;
    activeEnrollments: number;
    expiredEnrollments: number;
    cancelledEnrollments: number;
    suspendedEnrollments: number;
    totalStudents: number;
    enrollmentRate: number;
    completionRate: number;
}

// Enrollment Response interface for API responses
export interface IEnrollmentResponse {
    _id: string;
    user: IEnrollmentUser;
    level: IEnrollmentLevel;
    curriculum: IEnrollmentCurriculum;
    plan?: IEnrollmentPlan;
    order: IEnrollmentOrder;
    status: ENROLLMENT_STATUS;
    startedAt: string;
    endDate?: string;
    enrolledAt: string;
    cancellationReason?: string;
    createdBy: IEnrollmentUser;
    createdAt: string;
    updatedAt: string;
}

// Enrollment List Query Parameters
export interface IEnrollmentQueryParams {
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
        status?: ENROLLMENT_STATUS;
        user?: string;
        level?: string;
        curriculum?: string;
        plan?: string;
        createdBy?: string;
        dateFrom?: string;
        dateTo?: string;
        enrollmentDateFrom?: string;
        enrollmentDateTo?: string;
        endDateFrom?: string;
        endDateTo?: string;
    };
}

// Enrollment with Details Response (for detailed view)
export interface IEnrollmentWithDetailsResponse extends IEnrollmentResponse {
    // Additional populated fields
    user: IEnrollmentUser;
    level: IEnrollmentLevel;
    curriculum: IEnrollmentCurriculum;
    plan?: IEnrollmentPlan;
    order: IEnrollmentOrder;
    createdBy: IEnrollmentUser;
}

// Enrollment Statistics Response
export interface IEnrollmentStatisticsResponse {
    totalEnrollments: number;
    activeEnrollments: number;
    expiredEnrollments: number;
    cancelledEnrollments: number;
    suspendedEnrollments: number;
}
