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
  create(
    @Body() dto: CreatePeriodDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.periodService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() q: TableQueryDto) {
    return this.periodService.findAllPaginated(q);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  bulkRemove(@Body() body: BulkIdsDto) {
    return this.periodService.bulkRemove(body.ids);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePeriodDto) {
    return this.periodService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.periodService.remove(id);
  }
}
