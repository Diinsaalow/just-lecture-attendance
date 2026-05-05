import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { AuthUserPayload } from '../decorators/current-user.decorator';
import { normalizeRoleName } from './role-ability-templates';
import { Hall, HallDocument } from '../../modules/hall/schemas/hall.schema';
import { Campus, CampusDocument } from '../../modules/campus/schemas/campus.schema';
import { Faculty, FacultyDocument } from '../../modules/faculty/schemas/faculty.schema';
import { Department, DepartmentDocument } from '../../modules/department/schemas/department.schema';
import { LectureClass, LectureClassDocument } from '../../modules/classes/schemas/lecture-class.schema';
import { Period, PeriodDocument } from '../../modules/period/schemas/period.schema';
import { Course, CourseDocument } from '../../modules/course/schemas/course.schema';
import { Semester, SemesterDocument } from '../../modules/semester/schemas/semester.schema';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';

const emptyMatch = { _id: { $exists: false } };

@Injectable()
export class UserScopeService {
  constructor(
    @InjectModel(Campus.name) private readonly campusModel: Model<CampusDocument>,
    @InjectModel(Hall.name) private readonly hallModel: Model<HallDocument>,
    @InjectModel(Faculty.name)
    private readonly facultyModel: Model<FacultyDocument>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(LectureClass.name)
    private readonly lectureClassModel: Model<LectureClassDocument>,
    @InjectModel(Period.name)
    private readonly periodModel: Model<PeriodDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Semester.name)
    private readonly semesterModel: Model<SemesterDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  isSuperAdmin(user: AuthUserPayload): boolean {
    return normalizeRoleName(user.role.name) === 'super-admin';
  }

  isFacultyAdmin(user: AuthUserPayload): boolean {
    return normalizeRoleName(user.role.name) === 'faculty-admin';
  }

  isInstructor(user: AuthUserPayload): boolean {
    return normalizeRoleName(user.role.name) === 'instructor';
  }

  async campusMatch(user: AuthUserPayload): Promise<Record<string, unknown>> {
    if (this.isSuperAdmin(user)) return {};
    if (this.isFacultyAdmin(user) && user.facultyId) {
      const fac = await this.facultyModel
        .findById(user.facultyId)
        .select('campusId')
        .lean();
      if (fac?.campusId) {
        return { _id: fac.campusId };
      }
      return emptyMatch;
    }
    if (this.isInstructor(user)) {
      const ids = await this.instructorCampusIds(user.id);
      return ids.length ? { _id: { $in: ids } } : emptyMatch;
    }
    return emptyMatch;
  }

  /** Halls live under campuses — same campus visibility as `campusMatch` but filters `campusId` on Hall. */
  async hallMatch(user: AuthUserPayload): Promise<Record<string, unknown>> {
    if (this.isSuperAdmin(user)) return {};
    if (this.isFacultyAdmin(user) && user.facultyId) {
      const fac = await this.facultyModel
        .findById(user.facultyId)
        .select('campusId')
        .lean();
      if (fac?.campusId) {
        return { campusId: fac.campusId };
      }
      return emptyMatch;
    }
    if (this.isInstructor(user)) {
      const ids = await this.instructorCampusIds(user.id);
      return ids.length ? { campusId: { $in: ids } } : emptyMatch;
    }
    return emptyMatch;
  }

  async facultyMatch(user: AuthUserPayload): Promise<Record<string, unknown>> {
    if (this.isSuperAdmin(user)) return {};
    if (this.isFacultyAdmin(user) && user.facultyId) {
      return { _id: new Types.ObjectId(user.facultyId) };
    }
    if (this.isInstructor(user)) {
      const ids = await this.instructorFacultyIds(user.id);
      return ids.length ? { _id: { $in: ids } } : emptyMatch;
    }
    return emptyMatch;
  }

  async departmentMatch(user: AuthUserPayload): Promise<Record<string, unknown>> {
    if (this.isSuperAdmin(user)) return {};
    if (this.isFacultyAdmin(user) && user.facultyId) {
      return { facultyId: new Types.ObjectId(user.facultyId) };
    }
    if (this.isInstructor(user)) {
      const ids = await this.instructorDepartmentIds(user.id);
      return ids.length ? { _id: { $in: ids } } : emptyMatch;
    }
    return emptyMatch;
  }

  async semesterMatch(user: AuthUserPayload): Promise<Record<string, unknown>> {
    if (this.isSuperAdmin(user)) return {};
    if (this.isFacultyAdmin(user) && user.facultyId) {
      const deptIds = await this.departmentModel
        .find({ facultyId: new Types.ObjectId(user.facultyId) })
        .distinct('_id');
      const classIds = await this.lectureClassModel
        .find({ departmentId: { $in: deptIds } })
        .distinct('_id');
      const semIds = await this.periodModel
        .find({ classId: { $in: classIds } })
        .distinct('semesterId');
      if (semIds.length) {
        return { _id: { $in: semIds } };
      }
      return {};
    }
    if (this.isInstructor(user)) {
      const semIds = await this.periodModel.distinct('semesterId', {
        lecturerId: new Types.ObjectId(user.id),
      });
      return semIds.length
        ? { _id: { $in: semIds } }
        : { createdBy: new Types.ObjectId(user.id) };
    }
    return emptyMatch;
  }

  async lectureClassMatch(
    user: AuthUserPayload,
  ): Promise<Record<string, unknown>> {
    if (this.isSuperAdmin(user)) return {};
    if (this.isFacultyAdmin(user) && user.facultyId) {
      const deptIds = await this.departmentModel
        .find({ facultyId: new Types.ObjectId(user.facultyId) })
        .distinct('_id');
      return deptIds.length
        ? { departmentId: { $in: deptIds } }
        : emptyMatch;
    }
    if (this.isInstructor(user)) {
      const ids = await this.instructorDepartmentIds(user.id);
      return ids.length ? { departmentId: { $in: ids } } : emptyMatch;
    }
    return emptyMatch;
  }

  async courseMatch(user: AuthUserPayload): Promise<Record<string, unknown>> {
    if (this.isSuperAdmin(user)) return {};
    if (this.isFacultyAdmin(user) && user.facultyId) {
      const deptIds = await this.departmentModel
        .find({ facultyId: new Types.ObjectId(user.facultyId) })
        .distinct('_id');
      return deptIds.length
        ? { departmentId: { $in: deptIds } }
        : emptyMatch;
    }
    if (this.isInstructor(user)) {
      const uid = new Types.ObjectId(user.id);
      return {
        $or: [{ lecturers: uid }, { createdBy: uid }],
      };
    }
    return emptyMatch;
  }

  async periodMatch(user: AuthUserPayload): Promise<Record<string, unknown>> {
    if (this.isSuperAdmin(user)) return {};
    if (this.isFacultyAdmin(user) && user.facultyId) {
      const deptIds = await this.departmentModel
        .find({ facultyId: new Types.ObjectId(user.facultyId) })
        .distinct('_id');
      const classIds = await this.lectureClassModel
        .find({ departmentId: { $in: deptIds } })
        .distinct('_id');
      return classIds.length
        ? { classId: { $in: classIds } }
        : emptyMatch;
    }
    if (this.isInstructor(user)) {
      return { lecturerId: new Types.ObjectId(user.id) };
    }
    return emptyMatch;
  }

  async academicYearMatch(_user: AuthUserPayload): Promise<Record<string, unknown>> {
    return {};
  }

  async userMatch(user: AuthUserPayload): Promise<Record<string, unknown>> {
    if (this.isSuperAdmin(user)) return {};
    if (this.isFacultyAdmin(user) && user.facultyId) {
      const fid = new Types.ObjectId(user.facultyId);
      return {
        $or: [{ facultyId: fid }, { _id: new Types.ObjectId(user.id) }],
      };
    }
    if (this.isInstructor(user)) {
      return { _id: new Types.ObjectId(user.id) };
    }
    return emptyMatch;
  }

  async ensureCampusInScope(
    user: AuthUserPayload,
    campusId: string,
  ): Promise<void> {
    await this.ensureRow(this.campusModel, campusId, () => this.campusMatch(user));
  }

  async ensureHallInScope(
    user: AuthUserPayload,
    hallId: string,
  ): Promise<void> {
    await this.ensureRow(this.hallModel, hallId, () => this.hallMatch(user));
  }

  async ensureFacultyInScope(
    user: AuthUserPayload,
    facultyId: string,
  ): Promise<void> {
    await this.ensureRow(this.facultyModel, facultyId, () =>
      this.facultyMatch(user),
    );
  }

  async ensureDepartmentInScope(
    user: AuthUserPayload,
    departmentId: string,
  ): Promise<void> {
    await this.ensureRow(this.departmentModel, departmentId, () =>
      this.departmentMatch(user),
    );
  }

  async ensureLectureClassInScope(
    user: AuthUserPayload,
    classId: string,
  ): Promise<void> {
    await this.ensureRow(this.lectureClassModel, classId, () =>
      this.lectureClassMatch(user),
    );
  }

  async ensureCourseInScope(
    user: AuthUserPayload,
    courseId: string,
  ): Promise<void> {
    await this.ensureRow(this.courseModel, courseId, () =>
      this.courseMatch(user),
    );
  }

  async ensurePeriodInScope(
    user: AuthUserPayload,
    periodId: string,
  ): Promise<void> {
    await this.ensureRow(this.periodModel, periodId, () =>
      this.periodMatch(user),
    );
  }

  async ensureUserInScope(
    user: AuthUserPayload,
    targetUserId: string,
  ): Promise<void> {
    await this.ensureRow(this.userModel, targetUserId, () =>
      this.userMatch(user),
    );
  }

  async ensureSemesterInScope(
    user: AuthUserPayload,
    semesterId: string,
  ): Promise<void> {
    await this.ensureRow(this.semesterModel, semesterId, () =>
      this.semesterMatch(user),
    );
  }

  private async ensureRow<T>(
    model: Model<T>,
    id: string,
    scope: () => Promise<Record<string, unknown>>,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Resource not found');
    }
    const m = await scope();
    if (!Object.keys(m).length) {
      const exists = await model.exists({ _id: id }).exec();
      if (!exists) throw new NotFoundException('Resource not found');
      return;
    }
    const found = await model
      .findOne({
        $and: [{ _id: id }, m as Record<string, unknown>],
      } as never)
      .exec();
    if (!found) {
      const exists = await model.exists({ _id: id }).exec();
      if (!exists) throw new NotFoundException('Resource not found');
      throw new ForbiddenException('You do not have access to this resource');
    }
  }

  private async instructorCampusIds(
    userId: string,
  ): Promise<Types.ObjectId[]> {
    const classIds = await this.periodModel.distinct('classId', {
      lecturerId: new Types.ObjectId(userId),
    });
    if (!classIds.length) return [];
    return this.lectureClassModel.distinct('campusId', {
      _id: { $in: classIds },
    });
  }

  private async instructorFacultyIds(
    userId: string,
  ): Promise<Types.ObjectId[]> {
    const deptIds = await this.instructorDepartmentIds(userId);
    if (!deptIds.length) return [];
    return this.departmentModel.distinct('facultyId', {
      _id: { $in: deptIds },
    });
  }

  private async instructorDepartmentIds(
    userId: string,
  ): Promise<Types.ObjectId[]> {
    const courseDeptIds = await this.courseModel.distinct('departmentId', {
      lecturers: new Types.ObjectId(userId),
    });
    const periodClassIds = await this.periodModel.distinct('classId', {
      lecturerId: new Types.ObjectId(userId),
    });
    const classDeptIds =
      periodClassIds.length > 0
        ? await this.lectureClassModel.distinct('departmentId', {
            _id: { $in: periodClassIds },
          })
        : [];
    const merged = new Set([
      ...courseDeptIds.map((x) => String(x)),
      ...classDeptIds.map((x) => String(x)),
    ]);
    return [...merged]
      .filter(Types.ObjectId.isValid)
      .map((s) => new Types.ObjectId(s));
  }
}
