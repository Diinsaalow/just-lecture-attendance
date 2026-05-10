import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CheckPolicies } from '../../common/casl/guards/policies.guard';
import {
  CreateAttendanceRecordPolicy,
  ReadAttendanceRecordPolicy,
  UpdateAttendanceRecordPolicy,
} from '../../common/casl/policies/access.policies';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { UserScopeService } from '../../common/casl/user-scope.service';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AdminCheckOutDto } from './dto/admin-check-out.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly userScopeService: UserScopeService,
  ) {}

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateAttendanceRecordPolicy)
  checkIn(@Body() dto: CheckInDto, @CurrentUser() user: AuthUserPayload) {
    return this.attendanceService.checkIn(dto, user);
  }

  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(CreateAttendanceRecordPolicy)
  checkOut(@Body() dto: CheckOutDto, @CurrentUser() user: AuthUserPayload) {
    return this.attendanceService.checkOut(dto, user);
  }

  @Post('admin/check-out')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(UpdateAttendanceRecordPolicy)
  adminCheckOut(
    @Body() dto: AdminCheckOutDto,
    @CurrentUser() adminUser: AuthUserPayload,
  ) {
    // Note: UserScopeService could verify if admin has scope over dto.instructorUserId
    return this.attendanceService.adminCheckOut(dto, adminUser);
  }

  @Get('me')
  @CheckPolicies(ReadAttendanceRecordPolicy)
  myHistory(
    @Query() query: TableQueryDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.attendanceService.findMyHistory(query, user);
  }

  @Get('session/:sessionId')
  @CheckPolicies(ReadAttendanceRecordPolicy)
  findBySession(@Param('sessionId') sessionId: string) {
    return this.attendanceService.findBySession(sessionId);
  }

  @Get()
  @CheckPolicies(ReadAttendanceRecordPolicy)
  async findAll(
    @Query() query: TableQueryDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    const scopeFilters = await this.userScopeService.attendanceMatch(user);
    return this.attendanceService.findAllPaginated(query, scopeFilters);
  }
}
