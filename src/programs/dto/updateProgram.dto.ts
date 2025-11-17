import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramDto } from './createProgram.dto';

export class UpdateProgramDto extends PartialType(CreateProgramDto) {}
