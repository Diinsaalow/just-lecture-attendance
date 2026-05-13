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
import { ClassSessionStatus } from '../class-session/enums/class-session-status.enum';
import { Hall, HallDocument } from '../hall/schemas/hall.schema';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AdminCheckOutDto } from './dto/admin-check-out.dto';
import { AttendanceSettingsService } from '../attendance-settings/attendance-settings.service';
import { DeviceService } from '../device/device.service';
import { CheckInMethod } from './enums/check-in-method.enum';
import { AttendanceStatus, StatusFlag } from './enums/attendance-status.enum';
import { isWithinGeofence } from '../hall/hall-geofence.util';
import {
  combineDateAndTimeWithTz,
  combineUtcDateAndTime,
} from './utils/session-time.util';

/** Set of session statuses that block any further attendance activity. */
const TERMINAL_SESSION_STATUSES = new Set<ClassSessionStatus>([
  ClassSessionStatus.CANCELLED,
  ClassSessionStatus.COMPLETED,
  ClassSessionStatus.NO_SHOW,
]);

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
  ) {}

  /**
   * Complete validation pipeline for Check-In.
   * Returns a fully constructed AttendanceRecord payload ready to be persisted.
   */
  async validateCheckIn(
    dto: CheckInDto,
    instructorUserId: string,
  ): Promise<Partial<AttendanceRecord>> {
    const settings = await this.settingsService.getSettingsOrFail();

    const session = await this.sessionModel.findById(dto.sessionId).exec();
    if (!session) throw new NotFoundException('Session not found');

    if (TERMINAL_SESSION_STATUSES.has(session.status)) {
      throw new BadRequestException(
        `Session is ${session.status.toLowerCase()} and no longer accepts attendance`,
      );
    }

    if (String(session.lecturerId) !== instructorUserId) {
      throw new BadRequestException(
        'You are not the assigned instructor for this session',
      );
    }

    const existing = await this.attendanceModel
      .findOne({ sessionId: dto.sessionId, instructorUserId })
      .exec();
    if (existing && existing.checkInAt) {
      throw new ConflictException(
        'You have already checked in to this session',
      );
    }

    const now = new Date();
    const tz = settings.timezone || 'Africa/Mogadishu';
    const sessionStart = combineDateAndTimeWithTz(
      session.scheduledDate,
      session.fromTime,
      tz,
    );
    const sessionEnd = combineDateAndTimeWithTz(
      session.scheduledDate,
      session.toTime,
      tz,
    );

    const windowStart = new Date(
      sessionStart.getTime() - settings.checkInWindowBeforeMinutes * 60000,
    );
    const windowEnd = new Date(
      sessionEnd.getTime() + settings.checkInWindowAfterMinutes * 60000,
    );

    console.log(`[CHECK-IN DEBUG] Server current date/time: ${now.toISOString()}`);
    console.log(`[CHECK-IN DEBUG] Server timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    console.log(`[CHECK-IN DEBUG] Configured University timezone: ${tz}`);
    console.log(`[CHECK-IN DEBUG] Received sessionId: ${dto.sessionId}`);
    console.log(`[CHECK-IN DEBUG] Session date: ${session.scheduledDate.toISOString()}`);
    console.log(`[CHECK-IN DEBUG] Session fromTime: ${session.fromTime}`);
    console.log(`[CHECK-IN DEBUG] Session toTime: ${session.toTime}`);
    console.log(`[CHECK-IN DEBUG] Parsed session start Date (UTC): ${sessionStart.toISOString()}`);
    console.log(`[CHECK-IN DEBUG] Parsed session end Date (UTC): ${sessionEnd.toISOString()}`);
    console.log(`[CHECK-IN DEBUG] Allowed check-in window start (UTC): ${windowStart.toISOString()}`);
    console.log(`[CHECK-IN DEBUG] Allowed check-in window end (UTC): ${windowEnd.toISOString()}`);
    console.log(`[CHECK-IN DEBUG] Current time used for comparison: ${now.toISOString()}`);
    console.log(`[CHECK-IN DEBUG] Early check-in allowed minutes: ${settings.checkInWindowBeforeMinutes}`);
    console.log(`[CHECK-IN DEBUG] Late check-in threshold minutes: ${settings.lateThresholdMinutes}`);
    console.log(`[CHECK-IN DEBUG] Grace period: ${settings.checkInWindowAfterMinutes}`);

    if (now < windowStart) {
      console.log(`[CHECK-IN DEBUG] Is current time before window: true`);
      console.log(`[CHECK-IN DEBUG] Final time validation result: REJECTED_TOO_EARLY`);
      throw new BadRequestException(
        `Check-in opens ${settings.checkInWindowBeforeMinutes} minutes before the session starts`,
      );
    }
    if (now > windowEnd) {
      console.log(`[CHECK-IN DEBUG] Is current time after window: true`);
      console.log(`[CHECK-IN DEBUG] Final time validation result: REJECTED_TOO_LATE`);
      throw new BadRequestException(
        'Check-in window has closed for this session',
      );
    }
    console.log(`[CHECK-IN DEBUG] Final time validation result: ACCEPTED`);

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

    if (settings.geofenceEnabled) {
      if (!session.hallId) {
        throw new BadRequestException(
          'Session has no hall assigned — cannot verify geofence',
        );
      }
      const hall = await this.hallModel.findById(session.hallId).exec();
      if (!hall) throw new NotFoundException('Assigned hall not found');
      if (
        hall.latitude === undefined ||
        hall.longitude === undefined ||
        hall.geofenceRadiusMeters === undefined
      ) {
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

    if (dto.method === CheckInMethod.QR_CODE) {
      if (!settings.qrCodeEnabled) {
        throw new BadRequestException(
          'QR code check-in is not enabled by the administrator',
        );
      }
      if (!session.hallId) {
        throw new BadRequestException(
          'Session has no hall assigned — cannot validate QR',
        );
      }
      const hall = await this.hallModel.findById(session.hallId).exec();
      if (!hall) throw new NotFoundException('Assigned hall not found');
      if (!dto.qrPayload) {
        throw new BadRequestException('QR payload missing for QR check-in');
      }
      if (hall.qrCodeToken !== dto.qrPayload) {
        throw new BadRequestException('Invalid or expired QR code for this hall');
      }
    }

    const flags: string[] = [];
    const lateThresholdTime = new Date(
      sessionStart.getTime() + settings.lateThresholdMinutes * 60000,
    );
    if (now > lateThresholdTime) {
      flags.push(StatusFlag.LATE);
    }

    return {
      sessionId: session._id,
      instructorUserId: instructorUserId as never,
      facultyId: session.facultyId,
      departmentId: session.departmentId,
      classId: session.classId,
      courseId: session.courseId,
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
   * Mutates the existing record and returns it ready to save.
   */
  async validateCheckOut(
    dto: CheckOutDto,
    instructorUserId: string,
  ): Promise<AttendanceRecordDocument> {
    const settings = await this.settingsService.getSettingsOrFail();

    const session = await this.sessionModel.findById(dto.sessionId).exec();
    if (!session) throw new NotFoundException('Session not found');
    if (TERMINAL_SESSION_STATUSES.has(session.status)) {
      throw new BadRequestException(
        `Session is ${session.status.toLowerCase()} and no longer accepts attendance`,
      );
    }

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

    const now = new Date();
    const tz = settings.timezone || 'Africa/Mogadishu';
    const sessionEnd = combineDateAndTimeWithTz(
      session.scheduledDate,
      session.toTime,
      tz,
    );
    const gracePeriodEnd = new Date(
      sessionEnd.getTime() + settings.checkOutGracePeriodMinutes * 60000,
    );
    if (now > gracePeriodEnd) {
      throw new BadRequestException(
        'Check-out grace period has expired. Please contact administration.',
      );
    }

    if (settings.deviceValidationEnabled) {
      const isDeviceValid = await this.deviceService.verify(
        instructorUserId,
        dto.deviceId,
      );
      if (!isDeviceValid) {
        throw new BadRequestException('Unregistered device');
      }
    }

    if (settings.geofenceEnabled) {
      if (!session.hallId) {
        throw new BadRequestException(
          'Session has no hall assigned — cannot verify geofence',
        );
      }
      const hall = await this.hallModel.findById(session.hallId).exec();
      if (!hall) throw new NotFoundException('Assigned hall not found');
      if (
        hall.latitude === undefined ||
        hall.longitude === undefined ||
        hall.geofenceRadiusMeters === undefined
      ) {
        /** Fail-closed: never allow check-out when geofence is required but hall lacks coords. */
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

    if (dto.method === CheckInMethod.QR_CODE) {
      if (!settings.qrCodeEnabled) {
        throw new BadRequestException(
          'QR code check-out is not enabled by the administrator',
        );
      }
      if (!session.hallId) {
        throw new BadRequestException(
          'Session has no hall assigned — cannot validate QR',
        );
      }
      const hall = await this.hallModel.findById(session.hallId).exec();
      if (!hall) throw new NotFoundException('Assigned hall not found');
      if (!dto.qrPayload) {
        throw new BadRequestException('QR payload missing for QR check-out');
      }
      if (hall.qrCodeToken !== dto.qrPayload) {
        throw new BadRequestException('Invalid or expired QR code for this hall');
      }
    }

    const earlyThresholdTime = new Date(
      sessionEnd.getTime() - settings.earlyCheckoutThresholdMinutes * 60000,
    );
    if (now < earlyThresholdTime) {
      if (!record.statusFlags.includes(StatusFlag.EARLY_CHECKOUT)) {
        record.statusFlags.push(StatusFlag.EARLY_CHECKOUT);
      }
    }

    record.checkOutAt = now;
    record.checkOutMethod = dto.method;
    record.checkOutGeo = { lat: dto.latitude, lng: dto.longitude };
    record.checkOutDeviceId = dto.deviceId;
    record.actualDurationMinutes = Math.round(
      (now.getTime() - record.checkInAt.getTime()) / 60000,
    );

    record.status = this.computeFinalStatus(record.statusFlags);

    return record;
  }

  /**
   * Admin check-out: closes an instructor's open record on their behalf.
   * Scope is verified at the controller layer (`ensureClassSessionInScope`
   * + `ensureUserInScope`); this method only handles state transitions.
   */
  async validateAdminCheckOut(
    dto: AdminCheckOutDto,
    adminUserId: string,
  ): Promise<AttendanceRecordDocument> {
    const session = await this.sessionModel.findById(dto.sessionId).exec();
    if (!session) throw new NotFoundException('Session not found');

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

    const now = new Date();
    record.checkOutAt = now;
    record.adminCheckOutBy = adminUserId as never;
    record.adminCheckOutAt = now;
    record.adminCheckOutNote = dto.note;
    record.actualDurationMinutes = Math.round(
      (now.getTime() - record.checkInAt.getTime()) / 60000,
    );

    if (!record.irregularityReasons.includes(StatusFlag.ADMIN_CHECKOUT)) {
      record.irregularityReasons.push(StatusFlag.ADMIN_CHECKOUT);
    }

    record.status = this.computeFinalStatus(record.statusFlags);

    return record;
  }

  /**
   * Deterministic final-status calculation based on `statusFlags`.
   *  - LATE   + EARLY_CHECKOUT → EARLY_CHECKOUT (more severe, surfaces partial attendance)
   *  - LATE                   → LATE
   *  - EARLY_CHECKOUT         → EARLY_CHECKOUT
   *  - otherwise              → PRESENT
   */
  private computeFinalStatus(flags: string[]): AttendanceStatus {
    if (flags.includes(StatusFlag.EARLY_CHECKOUT)) {
      return AttendanceStatus.EARLY_CHECKOUT;
    }
    if (flags.includes(StatusFlag.LATE)) {
      return AttendanceStatus.LATE;
    }
    return AttendanceStatus.PRESENT;
  }
}
