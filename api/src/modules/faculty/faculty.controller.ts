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
  CreateFacultyPolicy,
  DeleteFacultyPolicy,
  ReadFacultyPolicy,
  UpdateFacultyPolicy,
} from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BulkIdsDto } from '../../common/dto/bulk-ids.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Controller('faculties')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateFacultyPolicy)
  create(@Body() dto: CreateFacultyDto, @CurrentUser() user: AuthUserPayload) {
    return this.facultyService.create(dto, user.id);
  }

  @Get()
  @CheckPolicies(ReadFacultyPolicy)
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.facultyService.findAllPaginated(q, user);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteFacultyPolicy)
  bulkRemove(@Body() body: BulkIdsDto, @CurrentUser() user: AuthUserPayload) {
    return this.facultyService.bulkRemove(body.ids, user);
  }

  @Get(':id')
  @CheckPolicies(ReadFacultyPolicy)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.facultyService.findById(id, user);
  }

  @Patch(':id')
  @CheckPolicies(UpdateFacultyPolicy)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFacultyDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.facultyService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeleteFacultyPolicy)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    await this.facultyService.remove(id, user);
  }
}
