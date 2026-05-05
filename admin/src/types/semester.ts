import type { EntityStatus } from './entity-status';
import type { IAcademicYear } from './academicYear';

export interface ISemester {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    academicYearId: string | Pick<IAcademicYear, '_id' | 'name'>;
    status: EntityStatus;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
