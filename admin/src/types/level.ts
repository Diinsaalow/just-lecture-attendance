export interface ILevel {
    _id: string;
    curriculum: string | { _id: string; name: string; code: string };
    name: string;
    order: number;
    status: 'active' | 'inactive';
    description?: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateLevel {
    curriculum: string;
    name: string;
    order?: number;
    status?: 'active' | 'inactive';
    description?: string;
}

export interface IUpdateLevel {
    curriculum?: string;
    name?: string;
    order?: number;
    status?: 'active' | 'inactive';
    description?: string;
}
