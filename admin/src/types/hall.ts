import type { EntityStatus } from './entity-status';
import type { ICampus } from './campus';

export interface IHall {
    _id: string;
    name: string;
    code: string;
    campusId: string | Pick<ICampus, '_id' | 'campusName'>;
    latitude?: number;
    longitude?: number;
    geofenceRadiusMeters?: number;
    qrCodeToken?: string;
    capacity?: number;
    status: EntityStatus;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
