import { Controller, Get, Query } from '@nestjs/common';
import { CheckPolicies } from '../../common/casl/guards/policies.guard';
import { ReadAuditLogPolicy } from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @CheckPolicies(ReadAuditLogPolicy)
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.auditLogService.findAllPaginated(q, user);
  }
}
