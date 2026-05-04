import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { CampusModule } from './modules/campus/campus.module';
import { AcademicYearModule } from './modules/academic-year/academic-year.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { DepartmentModule } from './modules/department/department.module';
import { CourseModule } from './modules/course/course.module';
import { SemesterModule } from './modules/semester/semester.module';
import { LectureClassModule } from './modules/classes/lecture-class.module';
import { PeriodModule } from './modules/period/period.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    RolesModule,
    UsersModule,
    AuthModule,
    CampusModule,
    AcademicYearModule,
    FacultyModule,
    DepartmentModule,
    CourseModule,
    SemesterModule,
    LectureClassModule,
    PeriodModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
