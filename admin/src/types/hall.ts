import type { EntityStatus } from './entity-status';
import type { ICampus } from './campus';

export interface IHall {
    _id: string;
    name: string;
    code: string;
    campusId: string | Pick<ICampus, '_id' | 'campusName'>;
    building?: string;
    floor?: string;
    capacity?: number;
    status: EntityStatus;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
