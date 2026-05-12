import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CheckPolicies } from '../../common/casl/guards/policies.guard';
import {
  CreateBoundDevicePolicy,
  DeleteBoundDevicePolicy,
  ReadBoundDevicePolicy,
} from '../../common/casl/policies/access.policies';
import { UserScopeService } from '../../common/casl/user-scope.service';
import { DeviceService } from './device.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Controller('devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly userScopeService: UserScopeService,
  ) {}

  /** Register or replace the authenticated instructor's device. */
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(CreateBoundDevicePolicy)
  register(
    @Body() dto: RegisterDeviceDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.deviceService.register(user.id, dto.deviceId);
  }

  /** Get the authenticated instructor's registered device. */
  @Get('me')
  @CheckPolicies(ReadBoundDevicePolicy)
  getMyDevice(@CurrentUser() user: AuthUserPayload) {
    return this.deviceService.getMyDevice(user.id);
  }

  /** Admin: clear an instructor's registered device — scoped to actor's faculty. */
  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(DeleteBoundDevicePolicy)
  async clearDevice(
    @Param('userId') userId: string,
    @CurrentUser() actor: AuthUserPayload,
  ) {
    await this.userScopeService.ensureUserInScope(actor, userId);
    return this.deviceService.clearDevice(userId);
  }
}
