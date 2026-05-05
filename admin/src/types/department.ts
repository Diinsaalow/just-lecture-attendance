import type { EntityStatus } from './entity-status';
import type { IFaculty } from './faculty';

export interface IDepartment {
    _id: string;
    name: string;
    graduationName: string;
    facultyId: string | Pick<IFaculty, '_id' | 'name'>;
    duration: string;
    abbreviation: string;
    degree: string;
    status: EntityStatus;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
