import type { IUser } from './auth';
import type { EntityStatus } from './entity-status';
import type { IDepartment } from './department';

export interface ICourse {
    _id: string;
    name: string;
    departmentId: string | Pick<IDepartment, '_id' | 'name'>;
    type: string;
    credit: number;
    lecturers?: (string | Pick<IUser, '_id' | 'username' | 'email' | 'firstName' | 'lastName'>)[];
    status: EntityStatus;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
