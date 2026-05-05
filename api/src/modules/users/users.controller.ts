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
import { CreateUserDto } from './dto/create-user.dto';
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
  findAll(@Query() q: TableQueryDto, @CurrentUser() user: AuthUserPayload) {
    return this.usersService.findAllPaginated(q, user);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteUserPolicy)
  bulkRemove(@Body() body: BulkIdsDto, @CurrentUser() user: AuthUserPayload) {
    return this.usersService.bulkRemove(body.ids, user);
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
