import { IMediaItem } from './media';

export interface ICurriculum {
    _id: string;
    name: string;
    code: string;
    status: 'active' | 'inactive';
    description?: string;
    image?: string | Partial<IMediaItem>; // Media item ID
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateCurriculum {
    name: string;
    code: string;
    status?: 'active' | 'inactive';
    description?: string;
    image?: string; // Media item ID
}

export interface IUpdateCurriculum {
    name?: string;
    code?: string;
    status?: 'active' | 'inactive';
    description?: string;
    image?: string; // Media item ID
}
