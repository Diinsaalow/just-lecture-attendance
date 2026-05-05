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
  CreateLectureClassPolicy,
  DeleteLectureClassPolicy,
  ReadLectureClassPolicy,
  UpdateLectureClassPolicy,
} from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BulkIdsDto } from '../../common/dto/bulk-ids.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { LectureClassService } from './lecture-class.service';
import { CreateLectureClassDto } from './dto/create-lecture-class.dto';
import { UpdateLectureClassDto } from './dto/update-lecture-class.dto';

@Controller('classes')
export class LectureClassController {
  constructor(private readonly lectureClassService: LectureClassService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateLectureClassPolicy)
  create(
    @Body() dto: CreateLectureClassDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.lectureClassService.create(dto, user.id, user);
  }

  @Get()
  @CheckPolicies(ReadLectureClassPolicy)
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.lectureClassService.findAllPaginated(q, user);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteLectureClassPolicy)
  bulkRemove(@Body() body: BulkIdsDto, @CurrentUser() user: AuthUserPayload) {
    return this.lectureClassService.bulkRemove(body.ids, user);
  }

  @Get(':id')
  @CheckPolicies(ReadLectureClassPolicy)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.lectureClassService.findById(id, user);
  }

  @Patch(':id')
  @CheckPolicies(UpdateLectureClassPolicy)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLectureClassDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.lectureClassService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeleteLectureClassPolicy)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    await this.lectureClassService.remove(id, user);
  }
}
