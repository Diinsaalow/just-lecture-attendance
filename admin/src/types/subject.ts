import { IChapter } from './chapter';
import { IClass } from './class';
import { IQuiz } from './quiz';

export interface ISubject {
    _id: string;
    class: string | Partial<IClass>;
    curriculum: string | { _id: string; name: string; code: string };
    name: string;
    order: number;
    status: 'active' | 'inactive';
    description?: string;
    image?: string | { _id: string; url: string; name: string; type: string };
    createdBy?: string | { _id: string; firstName: string; lastName: string; fullName: string; id: string };
    createdAt: string;
    updatedAt: string;
    chapters?: IChapter[];
    id: string;
}

export interface ISubjectDetails extends ISubject {
    chapters: IChapter[];
    quizzes: IQuiz[];
}

export interface ICreateSubject {
    class: string;
    curriculum: string;
    name: string;
    order?: number;
    status?: 'active' | 'inactive';
    description?: string;
    image?: string;
}

export interface IUpdateSubject {
    class?: string;
    curriculum?: string;
    name?: string;
    order?: number;
    status?: 'active' | 'inactive';
    description?: string;
    image?: string;
}
