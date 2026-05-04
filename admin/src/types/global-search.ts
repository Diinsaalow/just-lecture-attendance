export interface IGlobalSearchItem {
    id: string;
    type: string;
    title: string;
    description: string;
    url: string;
    created_at?: string;
    additional_data?: Record<string, any>;
}

export interface IGlobalSearchResponse {
    total_results: number;
    results: Record<string, IGlobalSearchItem[]>;
    total_per_category: Record<string, number>;
    query: string;
}

export interface IEntitySearchResponse {
    data: IGlobalSearchItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
}

export interface IGlobalSearchParams {
    q: string;
    limit_per_type?: number;
}

export interface IEntitySearchParams {
    q: string;
    page?: number;
    per_page?: number;
}

export type EntityType = 'curriculum' | 'level' | 'class' | 'subject' | 'chapter' | 'lesson' | 'book' | 'quiz' | 'national-examination' | 'user' | 'review' | 'plan' | 'enrollment';

export const ENTITY_LABELS: Record<EntityType, string> = {
    curriculum: 'Curriculum',
    level: 'Levels',
    class: 'Classes',
    subject: 'Subjects',
    chapter: 'Chapters',
    lesson: 'Lessons',
    book: 'Books',
    quiz: 'Quizzes',
    'national-examination': 'National Examinations',
    user: 'Users',
    review: 'Reviews',
    plan: 'Plans',
    enrollment: 'Enrollments',
};

export const ENTITY_ICONS: Record<EntityType, string> = {
    curriculum: 'BookOpen',
    level: 'ClipboardList',
    class: 'BookOpen',
    subject: 'BookOpen',
    chapter: 'FileText',
    lesson: 'FileText',
    book: 'Book',
    quiz: 'HelpCircle',
    'national-examination': 'ClipboardList',
    user: 'User',
    review: 'Star',
    plan: 'CreditCard',
    enrollment: 'UserCheck',
};
