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
  CreatePeriodPolicy,
  DeletePeriodPolicy,
  ReadPeriodPolicy,
  UpdatePeriodPolicy,
} from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BulkIdsDto } from '../../common/dto/bulk-ids.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PeriodService } from './period.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';

@Controller('periods')
export class PeriodController {
  constructor(private readonly periodService: PeriodService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreatePeriodPolicy)
  create(
    @Body() dto: CreatePeriodDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.periodService.create(dto, user.id, user);
  }

  @Get()
  @CheckPolicies(ReadPeriodPolicy)
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.periodService.findAllPaginated(q, user);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeletePeriodPolicy)
  bulkRemove(@Body() body: BulkIdsDto, @CurrentUser() user: AuthUserPayload) {
    return this.periodService.bulkRemove(body.ids, user);
  }

  @Get(':id')
  @CheckPolicies(ReadPeriodPolicy)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.periodService.findById(id, user);
  }

  @Patch(':id')
  @CheckPolicies(UpdatePeriodPolicy)
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePeriodDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.periodService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeletePeriodPolicy)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    await this.periodService.remove(id, user);
  }
}
