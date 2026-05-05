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
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';

@Controller('campuses')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateCampusDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.campusService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() q: TableQueryDto) {
    return this.campusService.findAllPaginated(q);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  bulkRemove(@Body() body: BulkIdsDto) {
    return this.campusService.bulkRemove(body.ids);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campusService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCampusDto) {
    return this.campusService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.campusService.remove(id);
  }
}
