import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CheckPolicies } from '../../common/casl/guards/policies.guard';
import {
  CreateSemesterPolicy,
  DeleteSemesterPolicy,
  ReadSemesterPolicy,
  UpdateSemesterPolicy,
} from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BulkIdsDto } from '../../common/dto/bulk-ids.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { SemesterService } from './semester.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Controller('semesters')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateSemesterPolicy)
  create(@Body() dto: CreateSemesterDto, @CurrentUser() user: AuthUserPayload) {
    return this.semesterService.create(dto, user.id);
  }

  @Get()
  @CheckPolicies(ReadSemesterPolicy)
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.semesterService.findAllPaginated(q, user);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteSemesterPolicy)
  bulkRemove(@Body() body: BulkIdsDto, @CurrentUser() user: AuthUserPayload) {
    return this.semesterService.bulkRemove(body.ids, user);
  }

  @Get(':id')
  @CheckPolicies(ReadSemesterPolicy)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.semesterService.findById(id, user);
  }

  @Patch(':id')
  @CheckPolicies(UpdateSemesterPolicy)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSemesterDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.semesterService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeleteSemesterPolicy)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    await this.semesterService.remove(id, user);
  }
}
