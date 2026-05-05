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
  CreateAcademicYearPolicy,
  DeleteAcademicYearPolicy,
  ReadAcademicYearPolicy,
  UpdateAcademicYearPolicy,
} from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BulkIdsDto } from '../../common/dto/bulk-ids.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { AcademicYearService } from './academic-year.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Controller('academic-years')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateAcademicYearPolicy)
  create(
    @Body() dto: CreateAcademicYearDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.academicYearService.create(dto, user.id);
  }

  @Get()
  @CheckPolicies(ReadAcademicYearPolicy)
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.academicYearService.findAllPaginated(q, user);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteAcademicYearPolicy)
  bulkRemove(@Body() body: BulkIdsDto, @CurrentUser() user: AuthUserPayload) {
    return this.academicYearService.bulkRemove(body.ids, user);
  }

  @Get(':id')
  @CheckPolicies(ReadAcademicYearPolicy)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.academicYearService.findById(id, user);
  }

  @Patch(':id')
  @CheckPolicies(UpdateAcademicYearPolicy)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicYearDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.academicYearService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeleteAcademicYearPolicy)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    await this.academicYearService.remove(id, user);
  }
}
