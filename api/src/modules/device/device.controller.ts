import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/casl/decorators/require-permission.decorator';
import { Action, Resource } from '../../common/casl/interfaces/action.interface';
import { UserScopeService } from '../../common/casl/user-scope.service';
import { DeviceService } from './device.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';

@Controller('devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly userScopeService: UserScopeService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Action.Create, Resource.DEVICE)
  async register(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.deviceService.register(user.id, dto);
  }

  @Get()
  @RequirePermission(Action.Read, Resource.DEVICE)
  async findAll(
    @Query() query: TableQueryDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.deviceService.findAll(query, user);
  }

  @Get('my')
  @RequirePermission(Action.Read, Resource.DEVICE)
  async getMyDevice(@CurrentUser() user: AuthUserPayload) {
    return this.deviceService.getMyDevice(user.id);
  }

  @Post('approve/:userId')
  @RequirePermission(Action.Update, Resource.DEVICE)
  async approveDevice(
    @Param('userId') targetUserId: string,
    @CurrentUser() admin: AuthUserPayload,
  ) {
    await this.userScopeService.ensureUserInScope(admin, targetUserId);
    return this.deviceService.approveDevice(targetUserId, admin.id);
  }

  @Post('reject/:userId')
  @RequirePermission(Action.Update, Resource.DEVICE)
  async rejectDevice(
    @Param('userId') targetUserId: string,
    @CurrentUser() admin: AuthUserPayload,
  ) {
    await this.userScopeService.ensureUserInScope(admin, targetUserId);
    return this.deviceService.rejectDevice(targetUserId, admin.id);
  }

  @Delete(':userId')
  @RequirePermission(Action.Delete, Resource.DEVICE)
  async clearDevice(
    @Param('userId') targetUserId: string,
    @CurrentUser() actor: AuthUserPayload,
  ) {
    await this.userScopeService.ensureUserInScope(actor, targetUserId);
    return this.deviceService.clearDevice(targetUserId);
  }
}
