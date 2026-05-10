import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AdminCheckOutDto {
  @IsMongoId()
  @IsNotEmpty()
  sessionId: string;

  @IsMongoId()
  @IsNotEmpty()
  instructorUserId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
