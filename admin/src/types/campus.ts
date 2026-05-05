import type { EntityStatus } from './entity-status';

export interface ICampus {
    _id: string;
    campusName: string;
    telephone: string;
    location: string;
    status: EntityStatus;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
