import { ILesson } from './lesson';
import { IQuiz } from './quiz';

export interface IChapter {
    _id: string;
    subject: string | { _id: string; name: string; class: string | { _id: string; name: string } };
    title: string;
    thumbnail?: { _id: string; url: string; name: string; type: string };
    image?: string | { _id: string; url: string; name: string; type: string };
    number?: number;
    order: number;
    status: 'active' | 'inactive';
    summary?: string;
    createdBy?: string | { _id: string; firstName: string; lastName: string };
    createdAt: string;
    updatedAt: string;
    lessons?: ILesson[];
    quizzes?: IQuiz[];
    id: string;
}

export interface CreateChapterDto {
    subject: string;
    title: string;
    image?: string;
    number?: number;
    order?: number;
    status?: 'active' | 'inactive';
    summary?: string;
}

export interface UpdateChapterDto {
    title?: string;
    image?: string;
    number?: number;
    order?: number;
    status?: 'active' | 'inactive';
    summary?: string;
}

export interface ChapterResponse {
    success: boolean;
    data: IChapter;
    message?: string;
}

export interface ChaptersResponse {
    success: boolean;
    data: {
        docs: IChapter[];
        totalDocs: number;
        limit: number;
        page: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    message?: string;
}
