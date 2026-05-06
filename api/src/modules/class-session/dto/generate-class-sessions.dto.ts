import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class GenerateClassSessionsDto {
  @IsMongoId()
  @IsNotEmpty()
  semesterId: string;

  /** When set, only periods for this class are expanded into dated sessions. */
  @IsOptional()
  @IsMongoId()
  classId?: string;
}
