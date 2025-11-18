import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { GenderType } from '../entities/student.entity';

export class UpdateStudentDto {
  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del estudiante',
    example: '2005-07-23',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    enum: GenderType,
    description: 'Género del estudiante',
  })
  @IsOptional()
  @IsEnum(GenderType)
  gender?: GenderType;

  @ApiPropertyOptional({
    description: 'Ciudad de origen del estudiante',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  cityOfOrigin?: string;
}
