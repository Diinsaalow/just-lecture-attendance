import {
  IsEmail,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsMongoId()
  @IsNotEmpty()
  role: string;

  /**
   * Faculty Admins MUST not pass this — it is overridden with `actor.facultyId`.
   * Super Admins may set it to assign the user to a specific faculty.
   */
  @IsMongoId()
  @IsOptional()
  facultyId?: string;

  @IsIn(['active', 'inactive', 'suspended'])
  @IsOptional()
  status?: string;
}
