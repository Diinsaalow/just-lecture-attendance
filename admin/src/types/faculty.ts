import type { EntityStatus } from './entity-status';
import type { ICampus } from './campus';

export interface IFaculty {
    _id: string;
    name: string;
    description?: string;
    code?: string;
    status: EntityStatus;
    campusId: string | Pick<ICampus, '_id' | 'campusName'>;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
