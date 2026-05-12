import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Public registration always creates an `instructor`. Privileged roles
 * (`super-admin`, `faculty-admin`) are created via the seeder or by an
 * authenticated Super Admin through `POST /users` — never by anonymous clients.
 */
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  passcode: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  passcode: string;
}
