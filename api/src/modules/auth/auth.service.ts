import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../common/enums/user-role.enum';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import type { JwtPayload } from './types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
    adminRegistrationKey?: string,
  ): Promise<{
    accessToken: string;
    user: { id: string; username: string; role: string };
  }> {
    const role = dto.role ?? UserRole.LECTURE;

    if (role === UserRole.ADMIN) {
      if (process.env.ALLOW_ADMIN_REGISTER !== 'true') {
        throw new ForbiddenException('Admin self-registration is disabled');
      }
      const expected = process.env.ADMIN_REGISTRATION_KEY;
      if (!expected || adminRegistrationKey !== expected) {
        throw new ForbiddenException('Invalid admin registration key');
      }
    }

    const roleId = await this.rolesService.findIdByRoleName(role);
    const user = await this.usersService.registerWithPasscode({
      username: dto.username,
      passcode: dto.passcode,
      roleId,
    });

    const accessToken = await this.buildToken({
      sub: String(user._id),
      role,
    });

    return {
      accessToken,
      user: {
        id: String(user._id),
        username: user.username,
        role,
      },
    };
  }

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    user: { id: string; username: string; role: string };
  }> {
    const user = await this.usersService.findByUsernameWithHash(dto.username);
    if (!user?.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.usersService.verifyPasscode(
      dto.passcode,
      user.passcodeHash,
    );
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roleName =
      (await this.rolesService.findRoleNameById(user.role)) ?? UserRole.LECTURE;

    const accessToken = await this.buildToken({
      sub: String(user._id),
      role: roleName,
    });

    return {
      accessToken,
      user: {
        id: String(user._id),
        username: user.username,
        role: roleName,
      },
    };
  }

  private async buildToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });
  }
}
