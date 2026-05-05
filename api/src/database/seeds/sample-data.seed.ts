import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Semester } from '../../modules/semester/schemas/semester.schema';
import { Period } from '../../modules/period/schemas/period.schema';
import { LectureClass } from '../../modules/classes/schemas/lecture-class.schema';
import { AcademicYear } from '../../modules/academic-year/schemas/academic-year.schema';
import { Campus } from '../../modules/campus/schemas/campus.schema';
import { Department } from '../../modules/department/schemas/department.schema';
import { Course } from '../../modules/course/schemas/course.schema';
import { User } from '../../modules/users/schemas/user.schema';
import { Role } from '../../modules/roles/schemas/role.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TimetablePeriodType } from '../../modules/period/enums/timetable-period-type.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const semesterModel = app.get<Model<Semester>>(getModelToken(Semester.name));
  const periodModel = app.get<Model<Period>>(getModelToken(Period.name));
  const classModel = app.get<Model<LectureClass>>(getModelToken(LectureClass.name));
  const academicYearModel = app.get<Model<AcademicYear>>(getModelToken(AcademicYear.name));
  const campusModel = app.get<Model<Campus>>(getModelToken(Campus.name));
  const departmentModel = app.get<Model<Department>>(getModelToken(Department.name));
  const courseModel = app.get<Model<Course>>(getModelToken(Course.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const roleModel = app.get<Model<Role>>(getModelToken(Role.name));

  console.log('Seeding sample data...');

  // Clear existing data
  await semesterModel.deleteMany({});
  await periodModel.deleteMany({});
  await classModel.deleteMany({});
  console.log('Cleared existing Semester, Period, and Class data');

  // 1. Get or Create a Role
  let role = await roleModel.findOne();
  if (!role) {
    role = await roleModel.create({ name: 'admin' });
    console.log('Created default admin role');
  }

  // 2. Get or Create a User (Admin/Lecturer)
  let user = await userModel.findOne();
  if (!user) {
    user = await userModel.create({
      username: 'admin',
      passcodeHash: 'seed_passcode_hash', 
      role: role._id,
      isActive: true,
    });
    console.log('Created default admin user');
  }

  const userId = (user as any)._id;

  // 3. Get or Create Academic Year
  let academicYear = await academicYearModel.findOne();
  if (!academicYear) {
    academicYear = await academicYearModel.create({
      name: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      createdBy: userId,
    });
  }
  const academicYearId = (academicYear as any)._id;

  // 4. Get or Create Campus
  let campus = await campusModel.findOne();
  if (!campus) {
    campus = await campusModel.create({
      campusName: 'Main Campus',
      telephone: '123456789',
      location: 'City Center',
      createdBy: userId,
    });
  }
  const campusId = (campus as any)._id;

  // 5. Get or Create Department
  let department = await departmentModel.findOne();
  if (!department) {
    department = await departmentModel.create({
      name: 'Computer Science',
      graduationName: 'Bachelor of Computer Science',
      facultyId: new Types.ObjectId(), 
      duration: '4 Years',
      abbreviation: 'CS',
      degree: 'BSc',
      createdBy: userId,
    });
  }
  const departmentId = (department as any)._id;

  // 6. Get or Create Course
  let course = await courseModel.findOne();
  if (!course) {
    course = await courseModel.create({
      name: 'Introduction to Programming',
      departmentId: departmentId,
      type: 'Core',
      credit: 3,
      lecturers: [userId],
      createdBy: userId,
    });
  }
  const courseId = (course as any)._id;

  // Seed 10 Semesters
  const semesters: any[] = [];
  for (let i = 1; i <= 10; i++) {
    semesters.push({
      name: `Semester ${i} - ${academicYear.name}`,
      startDate: new Date(2024, i, 1),
      endDate: new Date(2024, i + 3, 1),
      academicYearId: academicYearId,
      createdBy: userId,
    });
  }
  const createdSemesters = await semesterModel.insertMany(semesters);
  console.log(`Seeded ${createdSemesters.length} Semesters`);

  // Seed 10 Classes (LectureClass)
  const classes: any[] = [];
  const shifts = ['Morning', 'Afternoon', 'Evening'];
  const modes = ['Full-time', 'Part-time'];
  for (let i = 1; i <= 10; i++) {
    classes.push({
      name: `Class ${String.fromCharCode(64 + i)}`,
      departmentId: departmentId,
      mode: modes[i % modes.length],
      shift: shifts[i % shifts.length],
      size: 30 + i,
      campusId: campusId,
      batchId: `B2024-${i}`,
      academicYearId: academicYearId,
      createdBy: userId,
    });
  }
  const createdClasses = await classModel.insertMany(classes);
  console.log(`Seeded ${createdClasses.length} Classes`);

  // Seed 10 Periods
  const periods: any[] = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  for (let i = 0; i < 10; i++) {
    periods.push({
      classId: createdClasses[i % createdClasses.length]._id,
      courseId: courseId,
      lecturerId: userId,
      semesterId: createdSemesters[i % createdSemesters.length]._id,
      day: days[i % days.length],
      type: i % 2 === 0 ? TimetablePeriodType.THEORY : TimetablePeriodType.LAB,
      from: `${8 + i}:00`,
      to: `${10 + i}:00`,
      createdBy: userId,
    });
  }
  console.log(`Prepared ${periods.length} periods for insertion`);
  const createdPeriods = await periodModel.insertMany(periods);
  console.log(`Seeded ${createdPeriods.length} Periods`);

  console.log('Seeding completed successfully!');
  await app.close();
}

bootstrap();
