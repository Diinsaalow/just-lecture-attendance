import type { EntityStatus } from './entity-status';

export interface IAcademicYear {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: EntityStatus;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
