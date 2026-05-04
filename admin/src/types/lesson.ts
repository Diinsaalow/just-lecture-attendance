import { IQuiz } from './quiz';

export enum LessonType {
    VIDEO = 'video',
    DOCUMENT = 'document',
    IMAGE = 'image',
    TEXT = 'text',
    EXAM = 'exam',
    AUDIO = 'audio',
    INTERACTIVE = 'interactive',
}

export enum LessonSource {
    YOUTUBE = 'youtube',
    VIMEO = 'vimeo',
    EMBED = 'embed',
    EXTERNAL = 'external',
    TEXT = 'text',
}

export interface IVideo {
    url: string;
    thumbnail?: string;
    duration?: string;
    quality?: string;
    size?: number;
}

export interface ILesson {
    _id: string;
    chapter: string | { _id: string; title: string };
    order: number;
    type: LessonType;
    source: LessonSource;
    isFree: boolean;
    isPremium?: boolean;
    title: string;
    slug: string;
    content?: string;
    video?: string | IVideo;
    mediaUrl?: string;
    attachment?: string | null;
    summary?: string;
    thumbnail?: { _id: string; url: string; name: string; type: string };
    image?: string;
    duration: number;
    durationInMinutes?: number;
    durationFormatted?: string;
    views: number;
    downloads: number;
    averageRating?: number;
    totalReviews?: number;
    status: 'active' | 'inactive';
    tags: string[];
    metadata?: Record<string, any>;
    createdBy: string | { _id: string; firstName: string; lastName: string; fullName: string; id: string };
    updatedBy?: string | { _id: string; firstName: string; lastName: string };
    createdAt: string;
    updatedAt: string;
    id: string;
    quizzes?: IQuiz[];
}

export interface CreateLessonDto {
    chapter: string;
    order?: number;
    type: LessonType;
    source?: LessonSource;
    isFree?: boolean;
    isPremium?: boolean;
    title: string;
    slug?: string;
    content?: string;
    video?: IVideo;
    mediaUrl?: string;
    attachment?: string;
    summary?: string;
    image?: string;
    duration?: string;
    status?: boolean;
    tags?: string[];
    metadata?: Record<string, any>;
}

export interface UpdateLessonDto {
    order?: number;
    type?: LessonType;
    source?: LessonSource;
    isFree?: boolean;
    isPremium?: boolean;
    title?: string;
    slug?: string;
    content?: string;
    video?: IVideo;
    mediaUrl?: string;
    attachment?: string;
    summary?: string;
    image?: string;
    duration?: string;
    status?: boolean;
    tags?: string[];
    metadata?: Record<string, any>;
}

export interface LessonResponse {
    success: boolean;
    data: ILesson;
    message?: string;
}

export interface LessonsResponse {
    success: boolean;
    data: {
        docs: ILesson[];
        totalDocs: number;
        limit: number;
        page: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    message?: string;
}
