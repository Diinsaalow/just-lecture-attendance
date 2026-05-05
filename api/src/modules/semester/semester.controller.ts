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
import { SemesterService } from './semester.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Controller('semesters')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateSemesterDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.semesterService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() q: TableQueryDto) {
    return this.semesterService.findAllPaginated(q);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  bulkRemove(@Body() body: BulkIdsDto) {
    return this.semesterService.bulkRemove(body.ids);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.semesterService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSemesterDto) {
    return this.semesterService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.semesterService.remove(id);
  }
}
