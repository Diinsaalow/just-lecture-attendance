import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewSubmissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
