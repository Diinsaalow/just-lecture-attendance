import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AttendanceRecord,
  AttendanceRecordDocument,
} from './schemas/attendance-record.schema';
import { AttendanceValidationService } from './attendance-validation.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AdminCheckOutDto } from './dto/admin-check-out.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { Types } from 'mongoose';
import { paginateFind } from '../../common/utils/mongo-table-query';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecordDocument>,
    private readonly validationService: AttendanceValidationService,
  ) {}

  async checkIn(dto: CheckInDto, user: AuthUserPayload) {
    const recordData = await this.validationService.validateCheckIn(
      dto,
      user.id,
    );
    return this.attendanceModel.create(recordData);
  }

  async checkOut(dto: CheckOutDto, user: AuthUserPayload) {
    const record = await this.validationService.validateCheckOut(dto, user.id);
    return record.save();
  }

  async adminCheckOut(dto: AdminCheckOutDto, adminUser: AuthUserPayload) {
    const record = await this.validationService.validateAdminCheckOut(
      dto,
      adminUser.id,
    );
    return record.save();
  }

  async findBySession(sessionId: string) {
    return this.attendanceModel
      .find({ sessionId })
      .populate('instructorUserId', 'username email')
      .exec();
  }

  async findMyHistory(query: TableQueryDto, user: AuthUserPayload) {
    return paginateFind<AttendanceRecordDocument>(this.attendanceModel, query, {
      searchFields: ['status', 'scheduledStart', 'scheduledEnd'],
      defaultSort: { scheduledDate: -1 },
      populate: [
        { path: 'sessionId' },
        { path: 'hallId', select: 'name code' },
      ],
      baseMatch: { instructorUserId: new Types.ObjectId(user.id) },
    });
  }

  async findAllPaginated(query: TableQueryDto, userScopeFilters: any) {
    return paginateFind<AttendanceRecordDocument>(this.attendanceModel, query, {
      searchFields: ['status', 'scheduledStart', 'scheduledEnd'],
      defaultSort: { scheduledDate: -1 },
      populate: [
        { path: 'instructorUserId', select: 'username email' },
        { path: 'sessionId' },
        { path: 'hallId', select: 'name code' },
      ],
      baseMatch:
        userScopeFilters && Object.keys(userScopeFilters).length > 0
          ? userScopeFilters
          : undefined,
    });
  }
}
