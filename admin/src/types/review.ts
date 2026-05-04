// Review Status Enums
export enum REVIEW_STATUS {
    VISIBLE = 'visible',
    INVISIBLE = 'invisible',
}

// User interface for review references
export interface IReviewUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

// Subject interface for review references
export interface IReviewSubject {
    _id: string;
    name: string;
    description?: string;
}

// Lesson interface for review references
export interface IReviewLesson {
    _id: string;
    title: string;
    description?: string;
}

// Curriculum interface for review references
export interface IReviewCurriculum {
    _id: string;
    name: string;
    code: string;
}

// Main Review interface
export interface IReview {
    _id: string;
    student: IReviewUser | string;
    curriculum: IReviewCurriculum | string;
    subject: IReviewSubject | string;
    lesson: IReviewLesson | string;
    rating: number;
    review: string;
    status: REVIEW_STATUS;
    createdBy: IReviewUser | string;
    createdAt: string;
    updatedAt: string;
}

// Create Review interface
export interface ICreateReview {
    subject: string;
    lesson: string;
    curriculum: string;
    rating: number;
    review: string;
}

// Update Review interface (only for status toggle)
export interface IUpdateReview {
    status?: REVIEW_STATUS;
}

// Toggle Review Status interface
export interface IToggleReviewStatus {
    id: string;
}

// Review Statistics interface
export interface IReviewStatistics {
    totalReviews: number;
    visibleReviews: number;
    invisibleReviews: number;
    averageRating: number;
    ratingDistribution: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    };
    recentReviews: number; // Reviews from last 30 days
}

// Review Response interface for API responses
export interface IReviewResponse {
    _id: string;
    student: IReviewUser;
    curriculum: IReviewCurriculum;
    subject: IReviewSubject;
    lesson: IReviewLesson;
    rating: number;
    review: string;
    status: REVIEW_STATUS;
    createdBy: IReviewUser;
    createdAt: string;
    updatedAt: string;
}

// Review List Query Parameters
export interface IReviewQueryParams {
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
        status?: REVIEW_STATUS;
        rating?: number;
        student?: string;
        subject?: string;
        lesson?: string;
        curriculum?: string;
        createdBy?: string;
        dateFrom?: string;
        dateTo?: string;
        ratingMin?: number;
        ratingMax?: number;
    };
}
