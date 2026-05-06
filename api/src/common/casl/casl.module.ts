import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslAbilityFactory } from './casl-ability.factory';
import { PoliciesGuard } from './guards/policies.guard';
import { UserScopeService } from './user-scope.service';
import { Hall, HallSchema } from '../../modules/hall/schemas/hall.schema';
import { Campus, CampusSchema } from '../../modules/campus/schemas/campus.schema';
import { Faculty, FacultySchema } from '../../modules/faculty/schemas/faculty.schema';
import { Department, DepartmentSchema } from '../../modules/department/schemas/department.schema';
import { LectureClass, LectureClassSchema } from '../../modules/classes/schemas/lecture-class.schema';
import { Period, PeriodSchema } from '../../modules/period/schemas/period.schema';
import { Course, CourseSchema } from '../../modules/course/schemas/course.schema';
import { User, UserSchema } from '../../modules/users/schemas/user.schema';
import { Semester, SemesterSchema } from '../../modules/semester/schemas/semester.schema';
import {
  ClassSession,
  ClassSessionSchema,
} from '../../modules/class-session/schemas/class-session.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campus.name, schema: CampusSchema },
      { name: Hall.name, schema: HallSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: LectureClass.name, schema: LectureClassSchema },
      { name: Period.name, schema: PeriodSchema },
      { name: Semester.name, schema: SemesterSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: ClassSession.name, schema: ClassSessionSchema },
    ]),
  ],
  providers: [CaslAbilityFactory, PoliciesGuard, UserScopeService],
  exports: [CaslAbilityFactory, PoliciesGuard, UserScopeService],
})
export class CaslModule {}
