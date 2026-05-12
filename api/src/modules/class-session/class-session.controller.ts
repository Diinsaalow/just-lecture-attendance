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
  CreateClassSessionPolicy,
  DeleteClassSessionPolicy,
  ReadClassSessionPolicy,
  UpdateClassSessionPolicy,
} from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BulkIdsDto } from '../../common/dto/bulk-ids.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { ClassSessionService } from './class-session.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { GenerateClassSessionsDto } from './dto/generate-class-sessions.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@Controller('class-sessions')
export class ClassSessionController {
  constructor(private readonly classSessionService: ClassSessionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateClassSessionPolicy)
  create(
    @Body() dto: CreateClassSessionDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.classSessionService.create(dto, user);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(CreateClassSessionPolicy)
  generate(
    @Body() dto: GenerateClassSessionsDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.classSessionService.generateForSemester(dto, user);
  }

  /** Must be registered before `GET :id` so these paths are not treated as ids. */
  @Get('classes-for-generation')
  @CheckPolicies(ReadClassSessionPolicy)
  classesForGeneration(@CurrentUser() user: AuthUserPayload) {
    return this.classSessionService.findClassesForGeneration(user);
  }

  @Get('semesters-for-generation')
  @CheckPolicies(ReadClassSessionPolicy)
  semestersForGeneration(
    @CurrentUser() user: AuthUserPayload,
    @Query('classId') classId?: string,
  ) {
    return this.classSessionService.findSemestersForGeneration(user, classId);
  }

  /** Mobile: instructor's sessions for today (UTC). */
  @Get('me/today')
  @CheckPolicies(ReadClassSessionPolicy)
  myToday(@CurrentUser() user: AuthUserPayload) {
    return this.classSessionService.findMyToday(user);
  }

  /** Mobile: the currently checkable session for the instructor, or null. */
  @Get('me/active')
  @CheckPolicies(ReadClassSessionPolicy)
  myActive(@CurrentUser() user: AuthUserPayload) {
    return this.classSessionService.findMyActiveSession(user);
  }

  /** Mobile: instructor's sessions in the inclusive [from, to] range. */
  @Get('me')
  @CheckPolicies(ReadClassSessionPolicy)
  myRange(
    @CurrentUser() user: AuthUserPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.classSessionService.findMyRange(user, from, to);
  }

  @Get()
  @CheckPolicies(ReadClassSessionPolicy)
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.classSessionService.findAllPaginated(q, user);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteClassSessionPolicy)
  bulkRemove(@Body() body: BulkIdsDto, @CurrentUser() user: AuthUserPayload) {
    return this.classSessionService.bulkRemove(body.ids, user);
  }

  @Get(':id')
  @CheckPolicies(ReadClassSessionPolicy)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.classSessionService.findById(id, user);
  }

  @Patch(':id')
  @CheckPolicies(UpdateClassSessionPolicy)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClassSessionDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.classSessionService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeleteClassSessionPolicy)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    await this.classSessionService.remove(id, user);
  }
}
