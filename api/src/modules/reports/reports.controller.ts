import { Controller, Get, Param, Query } from '@nestjs/common';
import { CheckPolicies } from '../../common/casl/guards/policies.guard';
import {
  ReadDashboardPolicy,
  ReadReportPolicy,
} from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { ReportFilterQuery } from './reports.service';
import { ReportsService } from './reports.service';

@Controller()
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard/summary')
  @CheckPolicies(ReadDashboardPolicy)
  dashboardSummary(
    @CurrentUser() user: AuthUserPayload,
    @Query() filters: ReportFilterQuery,
  ) {
    return this.reports.getDashboardSummary(user, filters);
  }

  @Get('reports/attendance')
  @CheckPolicies(ReadReportPolicy)
  attendanceTimeline(
    @CurrentUser() user: AuthUserPayload,
    @Query() filters: ReportFilterQuery,
  ) {
    return this.reports.getAttendanceTimeline(user, filters);
  }

  @Get('reports/faculty')
  @CheckPolicies(ReadReportPolicy)
  facultyBreakdown(
    @CurrentUser() user: AuthUserPayload,
    @Query() filters: ReportFilterQuery,
  ) {
    return this.reports.getFacultyBreakdown(user, filters);
  }

  @Get('reports/instructors/:id')
  @CheckPolicies(ReadReportPolicy)
  instructorPerformance(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserPayload,
    @Query() filters: ReportFilterQuery,
  ) {
    return this.reports.getInstructorPerformance(user, id, filters);
  }
}
