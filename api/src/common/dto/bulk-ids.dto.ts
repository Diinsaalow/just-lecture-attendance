import { IsArray, IsMongoId } from 'class-validator';

export class BulkIdsDto {
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];
}
