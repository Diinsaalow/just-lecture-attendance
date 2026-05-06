import {
  Body,
  Controller,
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
  ReadClassSessionPolicy,
  UpdateClassSessionPolicy,
} from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { ClassSessionService } from './class-session.service';
import { GenerateClassSessionsDto } from './dto/generate-class-sessions.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@Controller('class-sessions')
export class ClassSessionController {
  constructor(private readonly classSessionService: ClassSessionService) {}

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

  @Get()
  @CheckPolicies(ReadClassSessionPolicy)
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.classSessionService.findAllPaginated(q, user);
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
}
