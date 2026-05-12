import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { UserRole } from '../../common/enums/user-role.enum';

describe('AuthService.register', () => {
  let service: AuthService;
  let users: { registerWithPasscode: jest.Mock };
  let roles: { findIdByRoleName: jest.Mock; findByName: jest.Mock };
  let jwt: { signAsync: jest.Mock };

  beforeEach(async () => {
    users = {
      registerWithPasscode: jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        username: 'jane@uni.edu',
        facultyId: undefined,
      }),
    };
    roles = {
      findIdByRoleName: jest.fn().mockResolvedValue(new Types.ObjectId()),
      findByName: jest.fn().mockResolvedValue({ ability: [] }),
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: RolesService, useValue: roles },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('always creates an instructor regardless of payload extras', async () => {
    const dto = { username: 'jane', passcode: 'pass1234' } as never;
    await service.register(dto);
    expect(roles.findIdByRoleName).toHaveBeenCalledWith(UserRole.INSTRUCTOR);
  });

  it('never lets a caller supply role=super-admin', async () => {
    /**
     * The DTO surface no longer carries `role`, but the test guards against
     * regressions where someone re-adds it: the call must still use
     * `instructor` for the role lookup.
     */
    const dto = {
      username: 'mallory',
      passcode: 'pass1234',
      role: 'super-admin',
    } as never;
    await service.register(dto);
    expect(roles.findIdByRoleName).toHaveBeenCalledWith(UserRole.INSTRUCTOR);
    expect(roles.findIdByRoleName).not.toHaveBeenCalledWith('super-admin');
  });
});
