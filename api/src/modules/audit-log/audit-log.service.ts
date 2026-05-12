import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { UserScopeService } from '../../common/casl/user-scope.service';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginateFind } from '../../common/utils/mongo-table-query';
import { AuditAction, AuditEntity } from './enums/audit-action.enum';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface RecordAuditArgs {
  actor?: AuthUserPayload | null;
  action: AuditAction;
  entityType: AuditEntity;
  entityId?: string | Types.ObjectId | null;
  facultyId?: string | Types.ObjectId | null;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
    private readonly userScope: UserScopeService,
  ) {}

  /**
   * Persist an audit row. Never throws — audit failures must not break the
   * primary business workflow.
   */
  async record(args: RecordAuditArgs): Promise<void> {
    try {
      await this.auditLogModel.create({
        actorId: args.actor ? new Types.ObjectId(args.actor.id) : null,
        actorRole: args.actor?.role.name ?? null,
        action: args.action,
        entityType: args.entityType,
        entityId: args.entityId
          ? new Types.ObjectId(String(args.entityId))
          : null,
        facultyId: args.facultyId
          ? new Types.ObjectId(String(args.facultyId))
          : args.actor?.facultyId
            ? new Types.ObjectId(args.actor.facultyId)
            : null,
        before: args.before ?? null,
        after: args.after ?? null,
        metadata: args.metadata ?? null,
      });
    } catch (err) {
      this.logger.warn(`Failed to write audit log: ${(err as Error).message}`);
    }
  }

  async findAllPaginated(
    q: TableQueryDto,
    actor: AuthUserPayload,
  ): Promise<PaginatedResult<AuditLogDocument>> {
    const baseMatch = await this.buildScopeMatch(actor);
    return paginateFind<AuditLogDocument>(this.auditLogModel, q, {
      searchFields: ['action', 'entityType', 'actorRole'],
      defaultSort: { createdAt: -1 },
      populate: [
        { path: 'actorId', select: 'username firstName lastName' },
      ],
      baseMatch:
        Object.keys(baseMatch).length > 0 ? baseMatch : undefined,
    });
  }

  private async buildScopeMatch(
    actor: AuthUserPayload,
  ): Promise<Record<string, unknown>> {
    if (this.userScope.isSuperAdmin(actor)) return {};
    if (this.userScope.isFacultyAdmin(actor)) {
      if (!actor.facultyId) return { _id: { $exists: false } };
      return { facultyId: new Types.ObjectId(actor.facultyId) };
    }
    /** Instructors should not browse the audit log. */
    return { _id: { $exists: false } };
  }
}
