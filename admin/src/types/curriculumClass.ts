import { ILevel } from './level';

/** Legacy curriculum "class" level (not the same as timetable `classes` / lecture cohort). */
export interface IClass {
    _id: string;
    level: string | Partial<ILevel>;
    curriculum: string | { _id: string; name: string; code: string };
    name: string;
    order: number;
    status: 'active' | 'inactive';
    description?: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateClass {
    level: string;
    curriculum: string;
    name: string;
    order?: number;
    status?: 'active' | 'inactive';
    description?: string;
}

export interface IUpdateClass {
    level?: string;
    curriculum?: string;
    name?: string;
    order?: number;
    status?: 'active' | 'inactive';
    description?: string;
}
