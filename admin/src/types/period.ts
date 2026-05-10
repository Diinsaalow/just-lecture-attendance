import type { EntityStatus } from './entity-status';
import type { ILectureClass } from './lectureClass';
import type { ICourse } from './course';
import type { ISemester } from './semester';
import type { IHall } from './hall';

export type TimetablePeriodType = 'Lab' | 'Theory';

export interface IPeriod {
    _id: string;
    classId: string | Pick<ILectureClass, '_id' | 'name'>;
    courseId: string | Pick<ICourse, '_id' | 'name'>;
    lecturerId: string | { _id: string; username?: string; firstName?: string; lastName?: string };
    semesterId: string | Pick<ISemester, '_id' | 'name'>;
    day: string;
    type: TimetablePeriodType;
    from: string;
    to: string;
    hallId?: string | Pick<IHall, '_id' | 'name' | 'code'>;
    status: EntityStatus;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
