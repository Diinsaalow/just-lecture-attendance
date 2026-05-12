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
import { CheckPolicies } from '../../common/casl/guards/policies.guard';
import {
  CreateAbsenceSubmissionPolicy,
  ReadAbsenceSubmissionPolicy,
  UpdateAbsenceSubmissionPolicy,
} from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateAbsenceSubmissionPolicy)
  create(
    @Body() dto: CreateSubmissionDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.submissionService.create(dto, user);
  }

  @Get()
  @CheckPolicies(ReadAbsenceSubmissionPolicy)
  findAll(
    @Query() q: TableQueryDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.submissionService.findAllPaginated(q, user);
  }

  @Get(':id')
  @CheckPolicies(ReadAbsenceSubmissionPolicy)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.submissionService.findById(id, user);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(UpdateAbsenceSubmissionPolicy)
  approve(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.submissionService.approve(id, dto, user);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(UpdateAbsenceSubmissionPolicy)
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.submissionService.reject(id, dto, user);
  }
}
