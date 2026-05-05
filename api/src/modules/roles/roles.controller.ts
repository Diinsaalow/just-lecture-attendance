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
import {
  CheckPolicies,
} from '../../common/casl/guards/policies.guard';
import {
  CreateRolePolicy,
  DeleteRolePolicy,
  ReadRolePolicy,
  UpdateRolePolicy,
} from '../../common/casl/policies/access.policies';
import { BulkIdsDto } from '../../common/dto/bulk-ids.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { buildPermissionsCatalog } from './permissions-catalog';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /** Permission matrix source — register before :id routes. */
  @Get('permissions')
  @CheckPolicies(ReadRolePolicy)
  permissionsCatalog() {
    return buildPermissionsCatalog();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies(CreateRolePolicy)
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @CheckPolicies(ReadRolePolicy)
  findAll(@Query() q: TableQueryDto) {
    return this.rolesService.findAllPaginated(q);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteRolePolicy)
  bulkRemove(@Body() body: BulkIdsDto) {
    return this.rolesService.bulkRemove(body.ids);
  }

  @Get(':id')
  @CheckPolicies(ReadRolePolicy)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOneById(id);
  }

  @Patch(':id')
  @CheckPolicies(UpdateRolePolicy)
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Patch(':id/permissions')
  @CheckPolicies(UpdateRolePolicy)
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.rolesService.updatePermissions(id, dto.ability);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies(DeleteRolePolicy)
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
  }
}
