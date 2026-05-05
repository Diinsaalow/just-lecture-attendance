import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateLecturerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  passcode: string;

  /** Super-admin only; faculty-admin gets scope from JWT. */
  @IsMongoId()
  @IsOptional()
  facultyId?: string;

  @IsIn(['active', 'inactive', 'suspended'])
  @IsOptional()
  status?: string;
}
