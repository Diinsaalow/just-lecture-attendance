import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  username: string;

  @IsString()
  @Matches(/^\d{6,9}$/, {
    message: 'passcode must be 6–9 digits',
  })
  passcode: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  username: string;

  @IsString()
  @Matches(/^\d{6,9}$/, {
    message: 'passcode must be 6–9 digits',
  })
  passcode: string;
}
