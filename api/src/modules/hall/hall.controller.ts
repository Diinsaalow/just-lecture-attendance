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
  CreateHallPolicy,
  DeleteHallPolicy,
  ReadHallPolicy,
  UpdateHallPolicy,
} from '../../common/casl/policies/access.policies';
import { BulkIdsDto } from '../../common/dto/bulk-ids.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { HallService } from './hall.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';

@Controller('halls')
export class HallController {
  constructor(private readonly hallService: HallService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateHallPolicy)
  create(@Body() dto: CreateHallDto, @CurrentUser() user: AuthUserPayload) {
    return this.hallService.create(dto, user.id, user);
  }

  @Get()
  @CheckPolicies(ReadHallPolicy)
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.hallService.findAllPaginated(q, user);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteHallPolicy)
  bulkRemove(@Body() body: BulkIdsDto, @CurrentUser() user: AuthUserPayload) {
    return this.hallService.bulkRemove(body.ids, user);
  }

  @Get(':id')
  @CheckPolicies(ReadHallPolicy)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.hallService.findById(id, user);
  }

  @Patch(':id')
  @CheckPolicies(UpdateHallPolicy)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHallDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.hallService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeleteHallPolicy)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    await this.hallService.remove(id, user);
  }

  @Post(':id/qr/regenerate')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(UpdateHallPolicy)
  regenerateQr(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.hallService.regenerateQrToken(id, user);
  }
}
