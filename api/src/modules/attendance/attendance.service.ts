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
import { buildMongooseQuery } from '../../common/utils/query-builder.util';
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
    // Force scope to current user
    const scopedQuery = { ...query };
    if (!scopedQuery.filters) scopedQuery.filters = {};
    scopedQuery.filters.instructorUserId = user.id;

    const { filters, sort, skip, limit } = buildMongooseQuery(scopedQuery);

    const [data, total] = await Promise.all([
      this.attendanceModel
        .find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('sessionId')
        .populate('hallId', 'name code')
        .exec(),
      this.attendanceModel.countDocuments(filters),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page || 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllPaginated(query: TableQueryDto, userScopeFilters: any) {
    const { filters, sort, skip, limit } = buildMongooseQuery(query);
    const finalFilters = { ...filters, ...userScopeFilters };

    const [data, total] = await Promise.all([
      this.attendanceModel
        .find(finalFilters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('instructorUserId', 'username email')
        .populate('sessionId')
        .populate('hallId', 'name code')
        .exec(),
      this.attendanceModel.countDocuments(finalFilters),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page || 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
