import type { EntityStatus } from './entity-status';
import type { IDepartment } from './department';
import type { ICampus } from './campus';
import type { IAcademicYear } from './academicYear';

export interface ILectureClass {
    _id: string;
    name: string;
    departmentId: string | Pick<IDepartment, '_id' | 'name'>;
    mode: string;
    shift: string;
    size: number;
    campusId: string | Pick<ICampus, '_id' | 'campusName'>;
    batchId: string;
    academicYearId: string | Pick<IAcademicYear, '_id' | 'name'>;
    status: EntityStatus;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
