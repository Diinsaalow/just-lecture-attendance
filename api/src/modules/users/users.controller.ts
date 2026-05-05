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
  CreateUserPolicy,
  DeleteUserPolicy,
  ReadUserPolicy,
  UpdateUserPolicy,
} from '../../common/casl/policies/access.policies';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BulkIdsDto } from '../../common/dto/bulk-ids.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { UsersService } from './users.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateUserPolicy)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @CheckPolicies(ReadUserPolicy)
  findAll(
    @Query() q: TableQueryDto,
    @Query('variant') variant: string | undefined,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.usersService.findAllPaginated(q, user, {
      excludeInstructorRole: variant === 'staff',
    });
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteUserPolicy)
  bulkRemove(@Body() body: BulkIdsDto, @CurrentUser() user: AuthUserPayload) {
    return this.usersService.bulkRemove(body.ids, user);
  }

  /** Static lecturer routes must be registered before @Get(':id'). */

  @Get('lecturers/next-username')
  @CheckPolicies(ReadUserPolicy)
  previewLecturerUsername() {
    return this.usersService.generateNextLecturerUsername().then((username) => ({
      username,
    }));
  }

  @Get('lecturers')
  @CheckPolicies(ReadUserPolicy)
  findAllLecturers(
    @Query() q: TableQueryDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.usersService.findAllLecturersPaginated(q, user);
  }

  @Post('lecturers')
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateUserPolicy)
  createLecturer(
    @Body() dto: CreateLecturerDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.usersService.createLecturer(dto, user);
  }

  @Delete('lecturers/bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteUserPolicy)
  bulkRemoveLecturers(
    @Body() body: BulkIdsDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.usersService.bulkRemoveLecturers(body.ids, user);
  }

  @Get('lecturers/:id')
  @CheckPolicies(ReadUserPolicy)
  findOneLecturer(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.usersService.findLecturerByIdSafe(id, user);
  }

  @Patch('lecturers/:id')
  @CheckPolicies(UpdateUserPolicy)
  updateLecturer(
    @Param('id') id: string,
    @Body() dto: UpdateLecturerDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.usersService.updateLecturer(id, dto, user);
  }

  @Delete('lecturers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeleteUserPolicy)
  async removeLecturer(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserPayload,
  ) {
    await this.usersService.removeLecturer(id, user);
  }

  @Get(':id')
  @CheckPolicies(ReadUserPolicy)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.usersService.findByIdSafe(id, user);
  }

  @Patch(':id')
  @CheckPolicies(UpdateUserPolicy)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.usersService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeleteUserPolicy)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    await this.usersService.remove(id, user);
  }
}
