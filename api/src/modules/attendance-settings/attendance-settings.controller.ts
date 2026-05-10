import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { CheckPolicies } from '../../common/casl/guards/policies.guard';
import {
  ManageAttendanceSettingsPolicy,
  ReadAttendanceSettingsPolicy,
} from '../../common/casl/policies/access.policies';
import { AttendanceSettingsService } from './attendance-settings.service';
import { CreateAttendanceSettingsDto } from './dto/create-attendance-settings.dto';
import { UpdateAttendanceSettingsDto } from './dto/update-attendance-settings.dto';

@Controller('attendance-settings')
export class AttendanceSettingsController {
  constructor(
    private readonly attendanceSettingsService: AttendanceSettingsService,
  ) {}

  @Get()
  @CheckPolicies(ReadAttendanceSettingsPolicy)
  getSettings() {
    return this.attendanceSettingsService.getSettings();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(ManageAttendanceSettingsPolicy)
  create(@Body() dto: CreateAttendanceSettingsDto) {
    return this.attendanceSettingsService.create(dto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(ManageAttendanceSettingsPolicy)
  update(@Body() dto: UpdateAttendanceSettingsDto) {
    return this.attendanceSettingsService.update(dto);
  }
}
