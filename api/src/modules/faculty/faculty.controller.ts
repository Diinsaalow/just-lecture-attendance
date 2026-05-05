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
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Controller('faculties')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateFacultyDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.facultyService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() q: TableQueryDto) {
    return this.facultyService.findAllPaginated(q);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  bulkRemove(@Body() body: BulkIdsDto) {
    return this.facultyService.bulkRemove(body.ids);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facultyService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFacultyDto) {
    return this.facultyService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.facultyService.remove(id);
  }
}
