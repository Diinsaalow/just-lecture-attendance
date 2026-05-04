import { PartialType } from '@nestjs/mapped-types';
import { CreateLectureClassDto } from './create-lecture-class.dto';

export class UpdateLectureClassDto extends PartialType(CreateLectureClassDto) {}
