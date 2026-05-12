import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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
import { AttendanceSettingsService } from '../attendance-settings/attendance-settings.service';
import {
  AttendanceStatus,
  StatusFlag,
} from './enums/attendance-status.enum';
import { combineUtcDateAndTime } from './utils/session-time.util';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  AuditAction,
  AuditEntity,
} from '../audit-log/enums/audit-action.enum';

/**
 * Periodic sweeps that finalize attendance records the user-driven flow left
 * incomplete:
 *
 *  - `markAbsentees`         — sessions whose check-in window has fully closed
 *                              with no record are written as `ABSENT`.
 *  - `markMissedCheckouts`   — instructors who checked in but never checked out
 *                              after the grace period are written as
 *                              `MISSED_CHECKOUT`.
 *
 * Both sweeps are idempotent: they ignore records that already have
 * `automationProcessedAt` set or a non-`CHECKED_IN` status.
 */
@Injectable()
export class AttendanceAutomationService {
  private readonly logger = new Logger(AttendanceAutomationService.name);

  constructor(
    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecordDocument>,
    @InjectModel(ClassSession.name)
    private readonly sessionModel: Model<ClassSessionDocument>,
    private readonly settingsService: AttendanceSettingsService,
    private readonly auditLog: AuditLogService,
  ) {}

  /** Every 5 minutes. */
  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'attendance-automation' })
  async runSweeps(): Promise<void> {
    const settings = await this.settingsService.getSettings();
    if (!settings) {
      /** Without configured settings we have no thresholds — skip until configured. */
      return;
    }
    try {
      const absent = await this.markAbsentees(settings);
      const missed = await this.markMissedCheckouts(settings);
      if (absent > 0 || missed > 0) {
        this.logger.log(
          `Automation sweep: absent=${absent} missed-checkout=${missed}`,
        );
      }
    } catch (err) {
      this.logger.error('Attendance automation sweep failed', err as Error);
    }
  }

  async markAbsentees(settings: {
    checkInWindowAfterMinutes: number;
  }): Promise<number> {
    const now = new Date();
    /** Pull sessions whose check-in window closed within the last 7 days that are still SCHEDULED. */
    const recentLowerBound = new Date(now.getTime() - 7 * 86400000);
    const sessions = await this.sessionModel
      .find({
        scheduledDate: { $gte: recentLowerBound, $lte: now },
        status: ClassSessionStatus.SCHEDULED,
      })
      .lean();

    let created = 0;
    for (const session of sessions) {
      const sessionEnd = combineUtcDateAndTime(
        session.scheduledDate,
        session.toTime,
      );
      const windowEnd = new Date(
        sessionEnd.getTime() + settings.checkInWindowAfterMinutes * 60000,
      );
      if (now <= windowEnd) {
        continue;
      }
      const existing = await this.attendanceModel.exists({
        sessionId: session._id,
        instructorUserId: session.lecturerId,
      });
      if (existing) continue;

      try {
        const inserted = await this.attendanceModel.create({
          sessionId: session._id,
          instructorUserId: session.lecturerId,
          facultyId: session.facultyId,
          campusId: session.campusId,
          hallId: session.hallId,
          scheduledDate: session.scheduledDate,
          scheduledStart: session.fromTime,
          scheduledEnd: session.toTime,
          status: AttendanceStatus.ABSENT,
          statusFlags: [StatusFlag.AUTO_ABSENT],
          automationProcessedAt: new Date(),
          automationType: StatusFlag.AUTO_ABSENT,
        });
        await this.auditLog.record({
          action: AuditAction.AUTO_ABSENT,
          entityType: AuditEntity.ATTENDANCE_RECORD,
          entityId: inserted._id,
          facultyId: session.facultyId,
          metadata: { sessionId: String(session._id) },
        });
        created += 1;
      } catch (err: unknown) {
        /** Race with a real check-in or a parallel sweep — unique index protects us. */
        if (
          typeof err !== 'object' ||
          err === null ||
          !('code' in err) ||
          (err as { code?: number }).code !== 11000
        ) {
          this.logger.warn(
            `Failed to write auto-absent for session ${String(session._id)}: ${
              (err as Error)?.message ?? String(err)
            }`,
          );
        }
      }
    }
    return created;
  }

  async markMissedCheckouts(settings: {
    checkOutGracePeriodMinutes: number;
  }): Promise<number> {
    const now = new Date();
    const candidates = await this.attendanceModel
      .find({
        status: AttendanceStatus.CHECKED_IN,
        checkInAt: { $ne: null },
        checkOutAt: null,
        automationProcessedAt: null,
      })
      .limit(500)
      .exec();

    let updated = 0;
    for (const record of candidates) {
      const sessionEnd = combineUtcDateAndTime(
        record.scheduledDate,
        record.scheduledEnd,
      );
      const cutoff = new Date(
        sessionEnd.getTime() + settings.checkOutGracePeriodMinutes * 60000,
      );
      if (now <= cutoff) continue;

      record.status = AttendanceStatus.MISSED_CHECKOUT;
      if (!record.statusFlags.includes(StatusFlag.AUTO_MISSED_CHECKOUT)) {
        record.statusFlags.push(StatusFlag.AUTO_MISSED_CHECKOUT);
      }
      record.automationProcessedAt = now;
      record.automationType = StatusFlag.AUTO_MISSED_CHECKOUT;
      try {
        await record.save();
        await this.auditLog.record({
          action: AuditAction.AUTO_MISSED_CHECKOUT,
          entityType: AuditEntity.ATTENDANCE_RECORD,
          entityId: record._id,
          facultyId: record.facultyId,
        });
        updated += 1;
      } catch (err) {
        this.logger.warn(
          `Failed to mark missed-checkout for record ${String(record._id)}: ${
            (err as Error)?.message ?? String(err)
          }`,
        );
      }
    }
    return updated;
  }
}
