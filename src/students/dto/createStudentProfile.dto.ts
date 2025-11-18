import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsString, Length } from 'class-validator';
import { GenderType } from '../entities/student.entity';

export class CreateStudentProfileDto {
  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '2005-09-12',
  })
  @IsDateString()
  birthDate: string;

  @ApiProperty({
    description: 'Ciudad de origen del estudiante',
    example: 'Pereira',
  })
  @IsString()
  @Length(2, 100)
  cityOfOrigin: string;

  @ApiProperty({
    description: 'Género del estudiante',
    enum: GenderType,
  })
  @IsEnum(GenderType)
  gender: GenderType;
}
