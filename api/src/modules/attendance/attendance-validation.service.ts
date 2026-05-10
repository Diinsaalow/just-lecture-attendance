import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AttendanceRecord,
  AttendanceRecordDocument,
} from './schemas/attendance-record.schema';
import {
  ClassSession,
  ClassSessionDocument,
} from '../class-session/schemas/class-session.schema';
import { Hall, HallDocument } from '../hall/schemas/hall.schema';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AdminCheckOutDto } from './dto/admin-check-out.dto';
import { AttendanceSettingsService } from '../attendance-settings/attendance-settings.service';
import { DeviceService } from '../device/device.service';
import { HallQrService } from '../hall-qr/hall-qr.service';
import { CheckInMethod } from './enums/check-in-method.enum';
import { AttendanceStatus } from './enums/attendance-status.enum';
import { isWithinGeofence } from '../hall/hall-geofence.util';

@Injectable()
export class AttendanceValidationService {
  constructor(
    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecordDocument>,
    @InjectModel(ClassSession.name)
    private readonly sessionModel: Model<ClassSessionDocument>,
    @InjectModel(Hall.name)
    private readonly hallModel: Model<HallDocument>,
    private readonly settingsService: AttendanceSettingsService,
    private readonly deviceService: DeviceService,
    private readonly qrService: HallQrService,
  ) {}

  /**
   * Complete validation pipeline for Check-In.
   * Returns a fully constructed AttendanceRecord ready to be saved.
   */
  async validateCheckIn(
    dto: CheckInDto,
    instructorUserId: string,
  ): Promise<Partial<AttendanceRecord>> {
    const settings = await this.settingsService.getSettingsOrFail();

    // 1. Load Session
    const session = await this.sessionModel.findById(dto.sessionId).exec();
    if (!session) throw new NotFoundException('Session not found');

    // 2. Instructor Assignment
    if (String(session.lecturerId) !== instructorUserId) {
      throw new BadRequestException(
        'You are not the assigned instructor for this session',
      );
    }

    // 3. Duplicate Check
    const existing = await this.attendanceModel
      .findOne({ sessionId: dto.sessionId, instructorUserId })
      .exec();
    if (existing && existing.checkInAt) {
      throw new ConflictException(
        'You have already checked in to this session',
      );
    }

    const now = new Date();
    const scheduledDate = new Date(session.scheduledDate);
    const [startH, startM] = session.fromTime.split(':').map(Number);
    const [endH, endM] = session.toTime.split(':').map(Number);

    const sessionStart = new Date(scheduledDate);
    sessionStart.setHours(startH, startM, 0, 0);

    const sessionEnd = new Date(scheduledDate);
    sessionEnd.setHours(endH, endM, 0, 0);

    // 4. Schedule Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDateOnly = new Date(scheduledDate);
    sessionDateOnly.setHours(0, 0, 0, 0);

    if (today.getTime() !== sessionDateOnly.getTime()) {
      throw new BadRequestException(
        'You can only check in to sessions scheduled for today',
      );
    }

    // 5. Time Window
    const windowStart = new Date(
      sessionStart.getTime() - settings.checkInWindowBeforeMinutes * 60000,
    );
    let windowEnd = sessionEnd;
    if (settings.checkInWindowAfterMinutes > 0) {
      windowEnd = new Date(
        sessionEnd.getTime() + settings.checkInWindowAfterMinutes * 60000,
      );
    }

    if (now < windowStart) {
      throw new BadRequestException(
        `Check-in opens ${settings.checkInWindowBeforeMinutes} minutes before the session starts`,
      );
    }
    if (now > windowEnd) {
      throw new BadRequestException(
        'Check-in window has closed for this session',
      );
    }

    // 6. Device Validation
    if (settings.deviceValidationEnabled) {
      const isDeviceValid = await this.deviceService.verify(
        instructorUserId,
        dto.deviceId,
      );
      if (!isDeviceValid) {
        throw new BadRequestException(
          'This device is not registered. Please register your device first.',
        );
      }
    }

    // 7. Hall Geofence Validation
    if (settings.geofenceEnabled && session.hallId) {
      const hall = await this.hallModel.findById(session.hallId).exec();
      if (!hall) throw new NotFoundException('Assigned hall not found');

      if (
        hall.latitude === undefined ||
        hall.longitude === undefined ||
        hall.geofenceRadiusMeters === undefined
      ) {
        // Fail closed if geofence is enabled but hall lacks coords
        throw new BadRequestException(
          'Hall geolocation data is missing. Cannot verify geofence.',
        );
      }

      const inside = isWithinGeofence(
        hall.latitude,
        hall.longitude,
        hall.geofenceRadiusMeters,
        dto.latitude,
        dto.longitude,
      );
      if (!inside) {
        throw new BadRequestException(
          'You are outside the permitted geofence for this classroom',
        );
      }
    }

    // 8. Method Validation (QR Code)
    if (dto.method === CheckInMethod.QR_CODE && settings.qrCodeEnabled) {
      if (!dto.qrPayload) {
        throw new BadRequestException(
          'QR payload is required for QR_CODE method',
        );
      }
      const verifiedPayload = this.qrService.verifyToken(dto.qrPayload);
      if (session.hallId) {
        this.qrService.assertMatchesSession(
          String(session.hallId),
          verifiedPayload,
        );
      }
    }

    // 9. Late Calculation
    const flags: string[] = [];
    const lateThresholdTime = new Date(
      sessionStart.getTime() + settings.lateThresholdMinutes * 60000,
    );
    if (now > lateThresholdTime) {
      flags.push('LATE');
    }

    return {
      sessionId: session._id,
      instructorUserId: instructorUserId as any,
      facultyId: session.facultyId,
      campusId: session.campusId,
      hallId: session.hallId,
      checkInAt: now,
      checkInMethod: dto.method,
      checkInGeo: { lat: dto.latitude, lng: dto.longitude },
      checkInDeviceId: dto.deviceId,
      scheduledDate: session.scheduledDate,
      scheduledStart: session.fromTime,
      scheduledEnd: session.toTime,
      status: AttendanceStatus.CHECKED_IN,
      statusFlags: flags,
    };
  }

  /**
   * Complete validation pipeline for Check-Out.
   * Modifies existing record and returns it ready to save.
   */
  async validateCheckOut(
    dto: CheckOutDto,
    instructorUserId: string,
  ): Promise<AttendanceRecordDocument> {
    const settings = await this.settingsService.getSettingsOrFail();

    const record = await this.attendanceModel
      .findOne({ sessionId: dto.sessionId, instructorUserId })
      .exec();

    if (!record || !record.checkInAt) {
      throw new BadRequestException('You must check in before checking out');
    }
    if (record.checkOutAt) {
      throw new ConflictException(
        'You have already checked out of this session',
      );
    }

    const session = await this.sessionModel.findById(dto.sessionId).exec();
    if (!session) throw new NotFoundException('Session not found');

    const now = new Date();
    const scheduledDate = new Date(session.scheduledDate);
    const [endH, endM] = session.toTime.split(':').map(Number);
    const sessionEnd = new Date(scheduledDate);
    sessionEnd.setHours(endH, endM, 0, 0);

    // 1. Time Window (Grace Period)
    const gracePeriodEnd = new Date(
      sessionEnd.getTime() + settings.checkOutGracePeriodMinutes * 60000,
    );
    if (now > gracePeriodEnd) {
      throw new BadRequestException(
        'Check-out grace period has expired. Please contact administration.',
      );
    }

    // 2. Device Validation
    if (settings.deviceValidationEnabled) {
      const isDeviceValid = await this.deviceService.verify(
        instructorUserId,
        dto.deviceId,
      );
      if (!isDeviceValid) {
        throw new BadRequestException('Unregistered device');
      }
    }

    // 3. Hall Geofence Validation
    if (settings.geofenceEnabled && session.hallId) {
      const hall = await this.hallModel.findById(session.hallId).exec();
      if (
        hall &&
        hall.latitude !== undefined &&
        hall.longitude !== undefined &&
        hall.geofenceRadiusMeters !== undefined
      ) {
        const inside = isWithinGeofence(
          hall.latitude,
          hall.longitude,
          hall.geofenceRadiusMeters,
          dto.latitude,
          dto.longitude,
        );
        if (!inside) {
          throw new BadRequestException(
            'You are outside the permitted geofence for this classroom',
          );
        }
      }
    }

    // 4. Early Check-out Calculation
    const earlyThresholdTime = new Date(
      sessionEnd.getTime() - settings.earlyCheckoutThresholdMinutes * 60000,
    );
    if (now < earlyThresholdTime) {
      if (!record.statusFlags.includes('EARLY_CHECKOUT')) {
        record.statusFlags.push('EARLY_CHECKOUT');
      }
    }

    // Update status based on flags
    record.status = record.statusFlags.includes('LATE')
      ? AttendanceStatus.LATE
      : AttendanceStatus.PRESENT;

    record.checkOutAt = now;
    record.checkOutMethod = dto.method;
    record.checkOutGeo = { lat: dto.latitude, lng: dto.longitude };
    record.checkOutDeviceId = dto.deviceId;
    record.actualDurationMinutes = Math.round(
      (now.getTime() - record.checkInAt.getTime()) / 60000,
    );

    return record;
  }

  /**
   * Validate admin check-out on behalf of instructor.
   */
  async validateAdminCheckOut(
    dto: AdminCheckOutDto,
    adminUserId: string,
  ): Promise<AttendanceRecordDocument> {
    const record = await this.attendanceModel
      .findOne({
        sessionId: dto.sessionId,
        instructorUserId: dto.instructorUserId,
      })
      .exec();

    if (!record || !record.checkInAt) {
      throw new BadRequestException(
        'Instructor has not checked in to this session',
      );
    }
    if (record.checkOutAt) {
      throw new ConflictException('Instructor is already checked out');
    }

    const session = await this.sessionModel.findById(dto.sessionId).exec();
    if (!session) throw new NotFoundException('Session not found');

    const now = new Date();
    record.checkOutAt = now;
    record.adminCheckOutBy = adminUserId as any;
    record.adminCheckOutAt = now;
    record.adminCheckOutNote = dto.note;
    record.actualDurationMinutes = Math.round(
      (now.getTime() - record.checkInAt.getTime()) / 60000,
    );

    record.status = record.statusFlags.includes('LATE')
      ? AttendanceStatus.LATE
      : AttendanceStatus.PRESENT;

    if (!record.irregularityReasons.includes('ADMIN_CHECKOUT')) {
      record.irregularityReasons.push('ADMIN_CHECKOUT');
    }

    return record;
  }
}
