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
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CheckPolicies } from '../../common/casl/guards/policies.guard';
import {
  CreateCampusPolicy,
  DeleteCampusPolicy,
  ReadCampusPolicy,
  UpdateCampusPolicy,
} from '../../common/casl/policies/access.policies';
import { BulkIdsDto } from '../../common/dto/bulk-ids.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';

@Controller('campuses')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateCampusPolicy)
  create(@Body() dto: CreateCampusDto, @CurrentUser() user: AuthUserPayload) {
    return this.campusService.create(dto, user.id);
  }

  @Get()
  @CheckPolicies(ReadCampusPolicy)
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.campusService.findAllPaginated(q, user);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteCampusPolicy)
  bulkRemove(@Body() body: BulkIdsDto, @CurrentUser() user: AuthUserPayload) {
    return this.campusService.bulkRemove(body.ids, user);
  }

  @Get(':id')
  @CheckPolicies(ReadCampusPolicy)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.campusService.findById(id, user);
  }

  @Patch(':id')
  @CheckPolicies(UpdateCampusPolicy)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCampusDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.campusService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeleteCampusPolicy)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    await this.campusService.remove(id, user);
  }
}
