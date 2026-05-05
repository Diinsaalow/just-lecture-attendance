import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import {
  defaultAbilitiesForRole,
  normalizeRoleName,
} from '../../common/casl/role-ability-templates';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import type { JwtPayload } from './types/jwt-payload.interface';

export type AuthPublicUser = {
  id: string;
  username: string;
  role: string;
  abilities: Array<{
    action: string | string[];
    subject: string;
    fields?: string[];
    condition?: Record<string, unknown>;
  }>;
  facultyId?: string;
};

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
  ): Promise<{ accessToken: string; user: AuthPublicUser }> {
    const role = dto.role ?? UserRole.INSTRUCTOR;

    const privilegedRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
    if (privilegedRoles.includes(role)) {
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
      user: await this.toPublicUser(user, role),
    };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: AuthPublicUser }> {
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
      (await this.rolesService.findRoleNameById(user.role)) ??
      UserRole.INSTRUCTOR;

    const accessToken = await this.buildToken({
      sub: String(user._id),
      role: roleName,
    });

    return {
      accessToken,
      user: await this.toPublicUser(user, roleName),
    };
  }

  async getAuthenticatedProfile(
    userId: string,
  ): Promise<AuthPublicUser | null> {
    const u = await this.usersService.findActiveByIdForAuth(userId);
    if (!u) {
      return null;
    }
    return this.toPublicUserFromPayload(u);
  }

  private async toPublicUser(
    user: {
      _id: Types.ObjectId | unknown;
      username: string;
      facultyId?: Types.ObjectId;
    },
    roleName: string,
  ): Promise<AuthPublicUser> {
    const roleEntity = await this.rolesService.findByName(roleName);
    const normalized = normalizeRoleName(roleName);
    const abilities =
      roleEntity?.ability && roleEntity.ability.length > 0
        ? roleEntity.ability
        : defaultAbilitiesForRole(normalized);

    return {
      id: String(user._id),
      username: user.username,
      role: roleName,
      abilities,
      facultyId: user.facultyId ? String(user.facultyId) : undefined,
    };
  }

  private async toPublicUserFromPayload(
    u: AuthUserPayload,
  ): Promise<AuthPublicUser> {
    const roleEntity = await this.rolesService.findByName(u.role.name);
    const normalized = normalizeRoleName(u.role.name);
    const abilities =
      roleEntity?.ability && roleEntity.ability.length > 0
        ? roleEntity.ability
        : u.role.ability && u.role.ability.length > 0
          ? u.role.ability
          : defaultAbilitiesForRole(normalized);

    return {
      id: u.id,
      username: u.username,
      role: u.role.name,
      abilities,
      facultyId: u.facultyId,
    };
  }

  private async buildToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });
  }
}
